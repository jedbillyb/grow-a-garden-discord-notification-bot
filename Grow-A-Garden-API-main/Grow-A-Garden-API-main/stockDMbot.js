const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));
const BOT_TOKEN = 'MTM5OTE2NDg3Mjc0MjE0MTk3Mg.Gh4K7-.iqQMmcqgDOToVJc_2XHtdhnRxjYpESy-Qqvnq0'; // Replace with your bot token
const USER_ID = '1162693800590848030';     // Replace with your Discord user ID

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

async function checkWeatherEvents() {
  try {
    const weatherRes = await fetch('https://api.joshlei.com/v2/growagarden/weather');
    const weatherData = await weatherRes.json();
    console.log('Weather API Response:', JSON.stringify(weatherData, null, 2));
    const activeEvents = (weatherData.weather || []).filter(ev => ev.active);
    
    // Create set of current active event names
    const currentActiveEvents = new Set(activeEvents.map(ev => ev.weather_id));
    
    // Check if events have changed
    const eventsChanged = 
      currentActiveEvents.size !== lastActiveEvents.size ||
      [...currentActiveEvents].some(event => !lastActiveEvents.has(event));
    
    if (eventsChanged) {
      const user = await client.users.fetch(USER_ID);
      
      if (activeEvents.length > 0) {
        const emojiMap = {
          rain: '🌧️', thunderstorm: '⛈️', bloodnight: '🌑', meteorshower: '☄️',
          disco: '🪩', jandelstorm: '🌪️', night: '🌙', volcano: '🌋',
          chocolaterain: '🍫🌧️', blackhole: '🕳️', frost: '❄️', bloodmoonevent: '🩸🌕',
          gale: '💨', megaharvest: '🌾', sungod: '☀️', nightevent: '🌚',
          tropicalrain: '🌴🌧️', auroraborealis: '🌌', windy: '💨', tornado: '🌪️',
          summerharvest: '🌻', heatwave: '🔥'
        };
        
        const weatherEmbed = new EmbedBuilder()
          .setTitle('🌤️ Weather Event Update!')
          .setColor(0xFFD700)
          .setDescription(activeEvents.map(ev =>
            `${emojiMap[ev.weather_id] || '🌟'} **${ev.weather_id}** - Active now!`
          ).join('\n'))
          .setTimestamp()
          .setFooter({ text: 'Grow A Garden Weather Alert' });
          
        await user.send({ embeds: [weatherEmbed] });
      } else {
        const weatherEmbed = new EmbedBuilder()
          .setTitle('🌤️ Weather Clear')
          .setColor(0x87CEEB)
          .setDescription('No weather events currently active.')
          .setTimestamp()
          .setFooter({ text: 'Grow A Garden Weather Alert' });
          
        await user.send({ embeds: [weatherEmbed] });
      }
      
      // Update last active events
      lastActiveEvents = currentActiveEvents;
    }
  } catch (err) {
    console.error('Error checking weather events:', err);
  }
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
    const user = await client.users.fetch(USER_ID);

    // Gears - Only send when stock actually changes
    const currentGears = (data.gearStock || []).filter(item => 
      item.value > 0 && targetGear.includes(item.name)
    );
    const newGears = hasStockChanged(currentGears, lastStockState.gears, 'gears');
    if (newGears.length > 0) {
      const embed = formatStockEmbed('🔧 Stock Alert - Target Gears', newGears, Date.now());
      await user.send({ embeds: [embed] });
    }

    // Seeds - Only send when stock actually changes
    const currentSeeds = (data.seedsStock || []).filter(item => 
      item.value > 0 && targetSeeds.includes(item.name)
    );
    const newSeeds = hasStockChanged(currentSeeds, lastStockState.seeds, 'seeds');
    if (newSeeds.length > 0) {
      const embed = formatStockEmbed('🌱 Stock Alert - Target Seeds', newSeeds, Date.now());
      await user.send({ embeds: [embed] });
    }

    // Eggs - Only send when stock actually changes
    const currentEggs = (data.eggStock || []).filter(item => 
      item.value > 0 && targetEggs.includes(item.name)
    );
    const newEggs = hasStockChanged(currentEggs, lastStockState.eggs, 'eggs');
    if (newEggs.length > 0) {
      const embed = formatStockEmbed('🥚 Stock Alert - Target Eggs', newEggs, Date.now());
      await user.send({ embeds: [embed] });
    }

    // Events - Only send when stock actually changes
    const currentEvents = (data.eventStock || []).filter(item => 
      item.value > 0 && targetEvents.includes(item.name)
    );
    const newEvents = hasStockChanged(currentEvents, lastStockState.events, 'events');
    if (newEvents.length > 0) {
      const embed = formatStockEmbed('🎉 Stock Alert - Target Events', newEvents, Date.now());
      await user.send({ embeds: [embed] });
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