const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));
const BOT_TOKEN = 'MTM5OTE2NDg3Mjc0MjE0MTk3Mg.Gh4K7-.iqQMmcqgDOToVJc_2XHtdhnRxjYpESy-Qqvnq0'; // Replace with your bot token
const USER_IDS = [
  '1162693800590848030', // You
  '1085337880022483014',
  '1358644289198100611',
  '838205645307248671',
  '869152480724938793',   // Friend 1
  '1283307434579988596'    // Friend 2
  // Add more here
];
const client = new Client({ intents: [GatewayIntentBits.DirectMessages, GatewayIntentBits.Guilds] });

let lastActiveEvents = new Set(); // Track previous active events
let lastStockState = {
  gears: new Map(),
  seeds: new Map(), 
  eggs: new Map(),
  events: new Map()
}; // Track previous stock states

// Filter arrays for specific items you want to be pinged for
const targetSeeds = ['Giant Pinecone', 'Elder Strawberry', 'Burning Bud', 'Sugar Apple', 'Ember Lily', 'Beanstalk'];
const targetGear = ['Master Sprinkler', 'Godly Sprinkler'];
const targetEggs = ['Bug Egg', 'Paradise Egg', 'Mythical Egg', 'Rare Summer Egg'];
const targetEvents = ['Raiju', 'Koi', 'Zen Egg', 'Pet Shard Tranquill', 'Pet Shard Corrupted'];

async function sendToUsers(embed) {
  for (const id of USER_IDS) {
    try {
      const user = await client.users.fetch(id);
      await user.send({ embeds: [embed] });
      console.log(`✅ Sent DM to ${user.username}`);
    } catch (e) {
      console.log(`❌ Could not DM ${id}: ${e.message}`);
    }
  }
}

const prismaticColors = {
  'Prismatic Apple': 0xFF69B4,
  'Prismatic Carrot': 0xFF4500, 
  'Prismatic Tomato': 0xFF0000,
  'Prismatic Blueberry': 0x0000FF,
  'Prismatic Strawberry': 0xFF1493,
  'Prismatic Bamboo': 0x228B22
};

function formatStockEmbed(title, items, stockId) {
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setColor(0x5865F2)
    .setTimestamp()
    .setFooter({ 
      text: `Stock ID: ${stockId} • Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` 
    });

  if (items.length === 0) {
    embed.setDescription('No items in stock');
    return embed;
  }

  // Check if this is a prismatic item category and set special color
  const firstItem = items[0];
  if (firstItem && firstItem.name && firstItem.name.includes('Prismatic')) {
    const prismaticColor = prismaticColors[firstItem.name];
    if (prismaticColor) {
      embed.setColor(prismaticColor);
    }
  }

  const description = items.map(item => {
    const emoji = getItemEmoji(item.name) || '📦';
    return `${emoji} **${item.name}** (${item.value} in stock)`;
  }).join('\n');

  embed.setDescription(description);
  return embed;
}

function getItemEmoji(itemName) {
  const emojiMap = {
    // Target Gears
    'Master Sprinkler': '💧👑',
    'Godly Sprinkler': '💧✨',
    
    // Target Seeds
    'Giant Pinecone': '🌲🔮',
    'Elder Strawberry': '🍓👴',
    'Burning Bud': '🔥🌸',
    'Sugar Apple': '🍎🍯',
    'Ember Lily': '🔥🌺',
    'Beanstalk': '🌱📏',
    
    // Target Eggs
    'Bug Egg': '🐛🥚',
    'Paradise Egg': '🏝️🥚',
    'Mythical Egg': '✨🥚',
    'Rare Summer Egg': '☀️🥚',
    
    // Target Events
    'Raiju': '⚡🐺',
    'Koi': '🐟🌸',
    'Zen Egg': '🧘🥚',
    'Pet Shard Tranquill': '💎😌',
    'Pet Shard Corrupted': '💎😈',
    
    // Generic fallbacks
    'Trowel': '🔨',
    'Harvest Tool': '🧰', 
    'Favorite Tool': '💖',
    'Magnifying Glass': '🔍',
    'Recall Wrench': '🔧',
    'Watering Can': '💧',
    'Cleaning Spray': '🧴',
    
    // Seeds
    'Apple': '🍎',
    'Carrot': '🥕',
    'Tomato': '🍅',
    'Blueberry': '🫐',
    'Strawberry': '🍓',
    'Bamboo': '🎋',
    
    // Prismatic versions
    'Prismatic Apple': '✨🍎',
    'Prismatic Carrot': '✨🥕',
    'Prismatic Tomato': '✨🍅',
    'Prismatic Blueberry': '✨🫐',
    'Prismatic Strawberry': '✨🍓',
    'Prismatic Bamboo': '✨🎋',
    
    // Eggs
    'Chicken Egg': '🥚',
    'Duck Egg': '🦆',
    'Goose Egg': '🪿'
  };
  
  return emojiMap[itemName] || '📦';
}

 

function hasStockChanged(currentItems, lastStockMap, stockType) {
  const newItems = [];
  
  for (const item of currentItems) {
    const lastQuantity = lastStockMap.get(item.name) || 0;
    if (item.value > lastQuantity) {
      newItems.push(item);
    }
    lastStockMap.set(item.name, item.value);
  }
  
  // Remove items that are no longer in stock
  for (const [itemName, quantity] of lastStockMap.entries()) {
    if (!currentItems.find(item => item.name === itemName)) {
      lastStockMap.set(itemName, 0);
    }
  }
  
  return newItems;
}

async function checkStockAndDM() {
  try {
    const res = await fetch('http://localhost:3000/api/stock/GetStock');
    const data = await res.json();
   

    // Gears - Only send when stock actually changes
    const currentGears = (data.gearStock || []).filter(item => 
      item.value > 0 && targetGear.includes(item.name)
    );
    const newGears = hasStockChanged(currentGears, lastStockState.gears, 'gears');
    if (newGears.length > 0) {
      const embed = formatStockEmbed('🔧 Stock Alert - Target Gears', newGears, Date.now());
      await sendToUsers(embed);
    }

    // Seeds - Only send when stock actually changes
    const currentSeeds = (data.seedsStock || []).filter(item => 
      item.value > 0 && targetSeeds.includes(item.name)
    );
    const newSeeds = hasStockChanged(currentSeeds, lastStockState.seeds, 'seeds');
    if (newSeeds.length > 0) {
      const embed = formatStockEmbed('🌱 Stock Alert - Target Seeds', newSeeds, Date.now());
      await sendToUsers(embed);
    }

    // Eggs - Only send when stock actually changes
    const currentEggs = (data.eggStock || []).filter(item => 
      item.value > 0 && targetEggs.includes(item.name)
    );
    const newEggs = hasStockChanged(currentEggs, lastStockState.eggs, 'eggs');
    if (newEggs.length > 0) {
      const embed = formatStockEmbed('🥚 Stock Alert - Target Eggs', newEggs, Date.now());
      await sendToUsers(embed);
    }

    // Events - Only send when stock actually changes
    const currentEvents = (data.eventStock || []).filter(item => 
      item.value > 0 && targetEvents.includes(item.name)
    );
    const newEvents = hasStockChanged(currentEvents, lastStockState.events, 'events');
    if (newEvents.length > 0) {
      const embed = formatStockEmbed('🎉 Stock Alert - Target Events', newEvents, Date.now());
      await sendToUsers(embed);
    }
  } catch (err) {
    console.error('Error checking stock for DM:', err);
  }
}

client.once('ready', () => {
  console.log(`Discord bot ready as ${client.user.tag}`);
  setInterval(checkStockAndDM, 60000); // check stock every 60s
  //setInterval(checkWeatherEvents, 3000); // check weather events every 3s for faster detection
});

client.login(BOT_TOKEN);

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function promptMessage() {
  rl.question('Enter a message to send to all users (or type "exit" to quit): ', async (message) => {
    if (message.toLowerCase() === 'exit') {
      rl.close();
      process.exit(0);
    }

    for (const id of USER_IDS) {
      try {
        const user = await client.users.fetch(id);
        await user.send(message);
        console.log(`✅ Sent to ${user.username}`);
      } catch (e) {
        console.log(`❌ Could not send to ${id}: ${e.message}`);
      }
    }

    promptMessage(); // Prompt again
  });
}

// Wait until bot is ready before prompting
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  promptMessage(); // Start terminal prompt after ready
});
