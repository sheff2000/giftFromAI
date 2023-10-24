const express = require('express');
const Parser = require('rss-parser');
const cors = require('cors');

const parser = new Parser();
const app = express();
const PORT = 3001;

app.use(cors()); // Добавьте эту строку для включения CORS для всех маршрутов

app.get('/news', async (req, res) => {
    let feed = await parser.parseURL('https://www.unian.net/rss/');
    res.json(feed.items);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
