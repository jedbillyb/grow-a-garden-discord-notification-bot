<a href="https://jedbillyb.com"><img align="right" src="https://img.shields.io/badge/jedbillyb.com-000?style=for-the-badge&logo=archlinux&logoColor=blue" /></a>
# Grow a Garden Bot 
Grow a Garden Roblox Stock Monitor + Discord Alert Bot

Grow a Guardian Bot is a full Node.js stock monitoring system designed for the Roblox game **Grow a Garden**.

It scrapes live stock data from the public Grow a Garden stock API, processes and formats the data through a custom Express server, and automatically sends Discord DM alerts when high-value items restock.

This project combines:

- Live web scraping
- API processing
- Terminal dashboard monitoring
- Discord bot automation

---

## 🔎 What This Project Does

Grow a Guardian has two main components:

### 1️⃣ Stock API Wrapper (Express Server)

- Fetches live stock data from:  
  https://growagarden.gg/api/stock
- Cleans and formats the data
- Exposes a local endpoint:  
  http://localhost:3000/api/stock/GetStock
- Includes:
  - Optional IP whitelisting
  - CORS support
  - Performance monitoring
  - Live terminal dashboard (built using `blessed`)
  - Request logging
  - Restock timer tracking

---

### 2️⃣ Discord Alert Bot

- Connects using **discord.js**
- Checks the local API every 60 seconds
- Filters specific high-value items
- Detects stock increases (not just presence)
- Sends formatted embed alerts via DM
- Includes a terminal-based DM control panel
- Logs and replies to incoming DMs

---

## 🎮 Designed For

Roblox Game: **Grow a Garden**

This system monitors in-game stock rotations for:

- 🌱 Rare Seeds
- 🔧 High-tier Gear
- 🥚 Special Eggs
- ✨ Prismatic Items

Instead of manually checking stock, the bot automatically alerts you when valuable items restock.

---

## 🌟 Target Items Monitored

### Seeds
- Giant Pinecone  
- Elder Strawberry  
- Burning Bud  
- Sugar Apple  
- Ember Lily  
- Beanstalk  

### Gear
- Master Sprinkler  
- Grandmaster Sprinkler  

### Eggs
- Bug Egg  
- Paradise Egg  

The bot only sends alerts when stock **increases compared to the previous check** to prevent spam.

### 🔧 Fully Customisable

All monitored items are configurable.

You can customise:
- Target seeds
- Target gear
- Target eggs
- Alert logic
- Stock filters

Simply update the item names to match the correct placeholders found in the API response.

---

## 🧠 Key Programming Concepts Used

This project demonstrates:

- Node.js backend development
- Express server creation
- HTTPS requests & web scraping
- API formatting & data transformation
- Asynchronous programming (async / await)
- Discord bot integration
- Embed message generation
- State tracking using Maps
- Terminal UI development (blessed)
- Performance monitoring (RAM, CPU, uptime)
- IP whitelisting security
- Modular endpoint loading system

---

## 📦 Requirements

- Node.js v18+
- A Discord Bot Token
- Internet connection
- npm

Required packages:

```
discord.js
express
chalk
blessed
cors
node-fetch
```

---

## ⚙️ Installation

1️⃣ Clone the repository:

```
git clone https://github.com/yourusername/GrowGuardian.git
cd GrowGuardian
```

2️⃣ Install dependencies:

```
npm install
```

3️⃣ Configure:

Edit:

```
config.json
```

Set:
- Port
- IP Whitelist settings
- Dashboard toggle

4️⃣ Add your Discord bot token:

Inside your bot file:

```js
const BOT_TOKEN = 'YOUR_BOT_TOKEN';
const USER_IDS = ['USER_ID_1'];
```

5️⃣ Start the API server:

```
node server.js
```

6️⃣ Start the Discord bot:

```
node bot.js
```

---

## 🖥 Terminal Dashboard Features

When enabled in `config.json`, the dashboard displays:

- Live request logs
- IP tracking
- RAM usage
- CPU load averages
- Server uptime
- Activity feed
- Console output

Built using the `blessed` library for a real-time terminal UI experience.

---

## 🔐 Security Features

- Optional IP Whitelisting
- Config-based settings
- Localhost API access
- Controlled Discord DM delivery

⚠️ Never upload your real Discord bot token to GitHub.  
If exposed, regenerate it immediately in the Discord Developer Portal.

---

## 🚀 How It Works (System Flow)

1. Server scrapes growagarden.gg stock API  
2. Data is cleaned and formatted  
3. Local endpoint exposes structured stock data  
4. Discord bot polls the endpoint every 60 seconds  
5. Bot compares previous stock values  
6. If stock increases → sends embed DM alert  

---

## 💡 Future Improvements

- Slash command integration
- Web dashboard UI
- MongoDB logging
- Docker container support
- VPS deployment guide
- Multi-server Discord support
- Webhook support
- Configurable target items via config file

---

## 📜 Credits

Grow a Garden API scraping logic based on the public endpoint at:  
https://growagarden.gg

Terminal dashboard inspired by system monitoring tools.

---

## 📄 License

MIT
