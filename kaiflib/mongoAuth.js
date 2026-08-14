const mongoose = require('mongoose');
const { BufferJSON, initAuthCreds } = require('@whiskeysockets/baileys');

// Define Schema for Auth with bufferCommands: false to prevent process crash if DB disconnects
const AuthStateSchema = new mongoose.Schema({
    _id: String,
    data: mongoose.Schema.Types.Mixed
}, {
    _id: false,
    bufferCommands: false,
    autoCreate: true
});

const useMongoDBAuthState = async (sessionId = 'kaif_session') => {
    // Fast In-Memory Cache for 0ms Auth Key Access (Instance Scoped)
    const keyCache = new Map();

    if (mongoose.connection.readyState !== 1) {
        let waitCount = 0;
        while (mongoose.connection.readyState !== 1 && waitCount < 10) {
            await new Promise(resolve => setTimeout(resolve, 500));
            waitCount++;
        }
    }

    const dbCollectionName = `${sessionId}.authstates`;
    const ModelName = `${sessionId}_AuthState`;

    let AuthState;
    try {
        AuthState = mongoose.model(ModelName);
    } catch {
        AuthState = mongoose.model(ModelName, AuthStateSchema, dbCollectionName);
    }

    const writeData = async (data, id) => {
        keyCache.set(id, data);
        try {
            if (mongoose.connection.readyState !== 1) return;
            const stringifiedData = JSON.stringify(data, BufferJSON.replacer);
            await AuthState.findOneAndUpdate(
                { _id: id },
                { data: stringifiedData },
                { upsert: true, new: true }
            );
        } catch (error) {
            console.error('Error writing auth state to DB:', error.message);
        }
    };

    const readData = async (id) => {
        if (keyCache.has(id)) {
            return keyCache.get(id);
        }
        try {
            if (mongoose.connection.readyState !== 1) return null;
            const result = await AuthState.findById(id);
            if (result && result.data) {
                let parsed;
                if (typeof result.data === 'string') {
                    parsed = JSON.parse(result.data, BufferJSON.reviver);
                } else {
                    const stringified = JSON.stringify(result.data, BufferJSON.replacer);
                    parsed = JSON.parse(stringified, BufferJSON.reviver);
                }
                keyCache.set(id, parsed);
                return parsed;
            }
            return null;
        } catch (error) {
            console.error('Error reading auth state from DB:', error.message);
            return null;
        }
    };

    const removeData = async (id) => {
        keyCache.delete(id);
        try {
            if (mongoose.connection.readyState !== 1) return;
            await AuthState.findByIdAndDelete(id);
        } catch (error) {
            console.error('Error removing auth state from DB:', error.message);
        }
    };

    const creds = (await readData('creds')) || initAuthCreds();

    const clearAllData = async () => {
        keyCache.clear();
        try {
            if (mongoose.connection.readyState !== 1) return;
            await AuthState.deleteMany({});
        } catch (error) {
            console.error('Error clearing auth state from DB:', error.message);
        }
    };

    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const data = {};
                    await Promise.all(ids.map(async (id) => {
                        let value = await readData(`${type}-${id}`);
                        if (value) data[id] = value;
                    }));
                    return data;
                },
                set: async (data) => {
                    const tasks = [];
                    for (const category in data) {
                        for (const id in data[category]) {
                            const value = data[category][id];
                            const key = `${category}-${id}`;
                            if (value) {
                                tasks.push(writeData(value, key));
                            } else {
                                tasks.push(removeData(key));
                            }
                        }
                    }
                    await Promise.all(tasks);
                }
            }
        },
        saveCreds: () => {
            return writeData(creds, 'creds');
        },
        clearState: clearAllData
    };
};

module.exports = { useMongoDBAuthState };
