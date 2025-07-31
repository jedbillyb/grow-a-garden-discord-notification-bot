const https = require("https");

const options = {
    method: "GET",
    hostname: "growagarden.gg",
    port: null,
    path: "/api/stock",
    headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "application/json",
        priority: "u=1, i",
        referer: "https://growagarden.gg/stocks",
        "trpc-accept": "application/json",
        "x-trpc-source": "gag"
    }
};

function fetchStocks() {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            const chunks = [];
            res.on("data", (chunk) => {
                chunks.push(chunk);
            });

            res.on("end", () => {
                try {
                    const body = Buffer.concat(chunks);
                    const parsedData = JSON.parse(body.toString());
                    resolve(parsedData);
                } catch (err) {
                    reject(err);
                }
            });
        });

        req.on("error", (e) => {
            reject(e);
        });

        req.end();
    });
}

// Function to format stock items
function formatStockItems(items, imageData) {
    if (!Array.isArray(items) || items.length === 0) return [];

    return items.map(item => {
        const image = imageData?.[item.name] || null;
        return {
            name: item?.name || "Unknown Item",
            value: item?.value ?? null,
            ...(image && { image })
        };
    });
}

// Function to format stock embeding
function formatLastSeenItems(items, imageData) {
    if (!Array.isArray(items) || items.length === 0) return [];

    return items.map(item => {
        const image = imageData?.[item.name] || null;
        return {
            name: item?.name || "Unknown",
            emoji: item?.emoji || "❓",
            seen: item?.seen ?? null,
            ...(image && { image })
        };
    });
}

// Function to format stock embed
function formatStocks(stocks) {
    const imageData = stocks.imageData || {};

    return {
        seedsStock: formatStockItems(stocks.seedsStock, imageData),
        gearStock: formatStockItems(stocks.gearStock, imageData),
        eggStock: formatStockItems(stocks.eggStock, imageData),
        cosmeticsStock: formatStockItems(stocks.cosmeticsStock, imageData),
        eventStock: formatStockItems(stocks.eventStock, imageData),
        merchantsStock: formatStockItems(stocks.merchantsStock, imageData),

        restockTimers: stocks.restockTimers || {},
    };
}

// Function to format stock embeding
async function FetchStockData() {
    try {
        const data = await fetchStocks();
        return formatStocks(data);
    } catch (err) {
        console.error("Error fetching stock data:", err);
        return null;
    }
}

// Function to register the API endpoint
function register(app) {
    app.get('/api/stock/GetStock', async (req, res) => {
        try {
            const stockData = await FetchStockData();
            if (!stockData) {
                res.status(500).json({ error: "Failed to fetch stock data" });
                return;
            }
            res.json(stockData);
        } catch (err) {
            res.status(500).json({ error: "Error fetching stock data" });
        }
    });
}

module.exports = { register };
