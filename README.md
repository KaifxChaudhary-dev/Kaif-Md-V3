# 👑 Kaif-Md-V3 👑
### Developed by Kaif x Chaudhary

A powerful, light, and high-performance WhatsApp bot focused on **Auto-Forwarding**, **Smart Text Cleaning & Replacement**, **Real-Time Control Panel**, and **Session Security**.

---

## 🚀 **KEY FEATURES**

- ⚡ **VIP Auto-Forwarding**: Automatically relay messages from source groups or chats to target groups, channels, or newsletters seamlessly.
- 🧹 **Smart Forward Cleaning**: Automatically strips "Forwarded" labels, forwarding scores, newsletter markers, and external ad replies across all media types.
- 🔤 **Advanced Text Changer Engine**:
  - **Smart Pattern Compiler**: Supports slashed regexes (`/pattern/flags`), raw regex syntax (`https?://\S+`), and literal text containing special characters (`Join (Group)`, `[LINK]`, `t.me/channel?id=1`).
  - **Dynamic Evaluation & Empty String Deletion**: Instantly update patterns and delete unwanted text/links by replacing with `""`.
  - **1-to-1 Mapped Replacements**: Map multiple old patterns to corresponding new replacements (`old1, old2` -> `new1, new2`).
  - **Fancy Font Normalization**: Automatically converts mathematical, script, and gothic unicode fonts for clean pattern matching.
  - **Deep Message & Quote Cleaning**: Replaces text across conversations, image/video captions, documents, audio, location comments, poll names, and quoted messages.
- 📊 **Real-Time Dashboard & Memory Sync**: Real-time Server-Sent Events (SSE) sync settings instantly between WhatsApp commands, Heroku in-memory state, MongoDB, and the Web Dashboard.
- 🔒 **Dual Session Persistence**: Supports **MongoDB** for cloud persistence and automatically falls back to **Local Multi-File Auth** if MongoDB is omitted.
- 🌐 **Web Dashboard & Control Panel**: Built-in web control panel (Port `3000`) to view status, scan QR codes, pair via phone code, adjust settings in real-time, clean cache, and reset sessions.
- 🛡️ **Anti-Delete & Auto-Status**: Built-in utilities for capturing deleted messages and auto-viewing/reacting to status updates.
- ⚡ **Light & Fast**: Built on Baileys for maximum speed, low memory footprint, and 24/7 Heroku stability.

---

## 📜 **AVAILABLE COMMANDS**

| Command | Aliases | Category | Description |
| ------- | ------- | -------- | ----------- |
| `.owner` | - | Contact | Contact bot owner for support |
| `.af` | `.autoforward`, `.autofwd` | AutoForward | Configure auto-forwarding targets, sources & filters |
| `.textchanger` | `.tc`, `.settext`, `.oldtext`, `.newtext` | Tools | Configure Text Changer old text patterns & new replacement text |
| `.f` | `.forward` | Tools | Manually forward a replied message to target JIDs |
| `.gjids` | `.gjid`, `.groups` | Tools | List all participating groups with member counts and unique JIDs |
| `.jid` | - | Debug | Get the exact JID of the current chat |
| `.antidelete` | `.anti-delete` | Settings | Toggle Anti-Delete to forward deleted messages to owner inbox |
| `.autostatus` | `.statusseen` | Settings | Toggle automatic WhatsApp status viewing and reactions |
| `.menu` | `.help`, `.h` | Information | Interactive menu showing all available commands |
| `.ping` | - | Information | Check bot response latency |
| `.uptime` | - | Information | Display bot active uptime |

---

## 🛠️ **TEXT CHANGER COMMAND USAGE (`.tc`)**

Manage text replacement patterns directly from WhatsApp with real-time sync to the Web Dashboard:

- **`.tc`** - View current Text Changer configuration & status.
- **`.tc set <old1, old2> | <new text>`** - Set old patterns and replacement text in one command!  
  *Example:* `.tc set Join (Group), badlink.com | My Channel`
- **`.tc old <pattern1, pattern2>`** - Set old text patterns (comma-separated).
- **`.tc new <replacement text>`** - Set new replacement text (leave empty to delete text).
- **`.tc test <sample text>`** - Test text replacement live in WhatsApp chat.
- **`.tc clear`** - Reset and clear all text changer settings.

---

## 🚀 **SETUP & DEPLOYMENT**

### **Prerequisites**
- **Node.js 20+**
- **MongoDB Database** (Optional - recommended for cloud storage, falls back to local storage)

### **Local Installation**

```bash
# 1. Install dependencies
npm install

# 2. Start the bot
npm start
```

Once started, open `http://localhost:3000` in your web browser to view the Control Panel and scan the QR code or link via phone pairing code.

---

## ⚙️ **ENVIRONMENT VARIABLES**

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `SESSION_ID` | Optional | Custom session identifier (defaults to `kaif_session`). |
| `MONGODB_URL` / `MONGODB_URI` | Optional | MongoDB connection string for cloud persistence. |
| `OLD_TEXT_REGEX` | Optional | Comma-separated patterns/words to strip/replace from forwarded messages. |
| `NEW_TEXT` | Optional | Replacement text to insert in place of matched regex/patterns. |
| `OWNER_NUMBER` | Optional | Personal WhatsApp number of the bot owner. |
| `PORT` | Optional | Web dashboard server port (defaults to `3000`). |

---

## 🌐 **WEB CONTROL PANEL**
Access the built-in control panel at `http://localhost:3000` (or your app URL) to:
- 📱 **Scan QR Code / Link Code**: Connect your WhatsApp account via Linked Devices or 8-digit Pairing Code.
- ⚡ **Real-Time Config Sync**: Toggle Auto-Forwarding, Auto-Status, and Regex Cleaning with instant live dashboard syncing.
- 🧹 **Clean Cache**: Purge temporary files and clear expired message buffers from database.
- 🔄 **Reset Session**: Force session clear and generate a new QR code anytime.

---

## 💳 **CREDITS & LICENSING**
- **Developer**: Kaif x Chaudhary
- **Version**: 3.0.0 (Kaif-Md-V3)

---
> _Powered by Kaif-Md-V3_