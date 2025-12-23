

const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Replace with your bot token
const TELEGRAM_BOT_TOKEN = '7716367578:AAGY4DAgFq5M77VGaBtRPOR0WvGiak-RP4E';
// Replace with your chat ID after you get it
const TELEGRAM_CHAT_ID = '5662731888';

app.use(cors());
app.use(express.json());

// Helper to send message to Telegram
function sendToTelegram(message) {
    if (!TELEGRAM_CHAT_ID || TELEGRAM_CHAT_ID === 'YOUR_CHAT_ID_HERE') return;
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    return axios.post(url, {
        chat_id: TELEGRAM_CHAT_ID,
        text: message
    });
}

// POST endpoint to receive visitor data
app.post('/log', (req, res) => {
    const logFile = path.join(__dirname, 'logs.json');
    const entry = {
        ...req.body,
        timestamp: new Date().toISOString()
    };
    // Append entry to logs.json
    fs.readFile(logFile, 'utf8', (err, data) => {
        let logs = [];
        if (!err && data) {
            try { logs = JSON.parse(data); } catch (e) { logs = []; }
        }
        logs.push(entry);
        fs.writeFile(logFile, JSON.stringify(logs, null, 2), err => {
            if (err) {
                console.error('Error writing log:', err);
                return res.status(500).json({ success: false });
            }
            // Send to Telegram
            sendToTelegram(`New visitor: ${JSON.stringify(entry, null, 2)}`)
                .then(() => res.json({ success: true }))
                .catch(() => res.json({ success: true, telegram: false }));
        });
    });
});

app.listen(PORT, () => {
    console.log(`Visitor logger backend running on http://localhost:${PORT}`);
});
