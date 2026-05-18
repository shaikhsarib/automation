const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

const DATA_FILE = path.join(__dirname, 'database.json');

async function loadData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return {
      products: [],
      dealers: [],
      orders: [],
      transactions: [],
      activityLog: [],
      notifications: [],
      settings: { companyName: 'DealerHub Pro', initialWallet: 5000, currency: 'INR' }
    };
  }
}

async function saveData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// API Routes
app.get('/api/data', async (req, res) => {
  try {
    const data = await loadData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/save', async (req, res) => {
  try {
    const currentData = await loadData();
    const newData = req.body;
    
    // Merge new data over current data
    if (newData.products) currentData.products = newData.products;
    if (newData.dealers) currentData.dealers = newData.dealers;
    if (newData.orders) currentData.orders = newData.orders;
    if (newData.transactions) currentData.transactions = newData.transactions;
    if (newData.activityLog) currentData.activityLog = newData.activityLog;
    if (newData.notifications) currentData.notifications = newData.notifications;
    if (newData.settings) currentData.settings = newData.settings;

    await saveData(currentData);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reset', async (req, res) => {
  try {
    await fs.unlink(DATA_FILE).catch(e => null);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Initialization routine to inject default data if db is empty
app.post('/api/init_defaults', async (req, res) => {
  try {
    const currentData = await loadData();
    if (!currentData.products || currentData.products.length === 0) {
      const defaultData = req.body;
      await saveData(defaultData);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
