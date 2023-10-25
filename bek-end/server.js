import cors from 'cors';
import express from 'express';
import mysql from 'mysql';
import { db, RSS } from '../config.js';
import {getRating} from './gpt.js';
import Parser from 'rss-parser';
import {getDataFromAllGraph, getDataFromCountryGraph} from './getDatafunc.js';

const app = express();
app.use(cors());
app.use(express.json());

const port = 3029;

const parser = new Parser();


const connection = mysql.createConnection(db);


async function addNewsToDatabase(newsItem, rssInfo) {
    //console.log(newsItem);
    const { title, link, isoDate, content, enclosure } = newsItem;
    const imageUrl = enclosure && enclosure.url ? enclosure.url : null;
    const { country } = rssInfo;

    const pubDate = new Date(isoDate).toISOString().slice(0, 19).replace('T', ' ');

    const query = `
        INSERT INTO news (title, url_news, date_news, desc_news, country, url_foto) 
        SELECT * FROM (
            SELECT ? AS title, 
                   ? AS url_news, 
                   ? AS date_news,
                   ? AS desc_news,
                   ? AS country,
                   ? AS url_foto
        ) AS tmp
        WHERE NOT EXISTS (
            SELECT url_news FROM news WHERE url_news = ?
        ) LIMIT 1;
    `;

    connection.query(query, [title, link, pubDate, content, country, imageUrl, link], (err, results) => {
        if (err) throw err;
        //console.log(`Added news DESCRIPTION: ${content}`);
    });
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function analyzeNews() {
    console.log('Analyzing news...');
    
    const getNewsQuery = "SELECT id, title, desc_news FROM news WHERE rating = -1";
    
    connection.query(getNewsQuery, async (err, results) => {
        if (err) throw err;
        
        for (const newsItem of results) {
            await delay(10000);  // Задержка в 10 секунд перед каждым вызовом getRating

            let rating;
            try {
                rating = await getRating({
                    title: newsItem.title,
                    content: newsItem.desc_news
                });
            } catch (error) {
                console.error('Error getting rating. Retrying after 20 seconds...');
                await delay(20000);  // Задержка в 20 секунд перед повторным вызовом
                try {
                    rating = await getRating({
                        title: newsItem.title,
                        desc_news: newsItem.desc_news
                    });
                } catch (secondError) {
                    console.error('Failed to get rating again:', secondError);
                    continue;  // Переходим к следующему элементу
                }
            }

            const updateQuery = "UPDATE news SET rating = ? WHERE id = ?";
            connection.query(updateQuery, [rating, newsItem.id], (err) => {
                if (err) throw err;
                console.log(`Updated rating for news ID: ${newsItem.id} with rating: ${rating}`);
            });
        }
    });
}

async function fetchNewsAndAddToDatabase() {
    for (const rss of RSS) {
        let feed;
        try {
            feed = await parser.parseURL(rss.rss_url);
        } catch (error) {
            console.error('Error fetching the RSS feed:', error, rss);
            continue;  // переход к следующей RSS-ленте
        }

        console.log('Success parse RSS - ', rss.country);
        for (const item of feed.items) {
            await addNewsToDatabase(item, rss);
        }

        await delay(600000);  // Пауза в 10 минут (10 минут * 60 секунд * 1000 миллисекунд)
    }
}

// Роут для запуска функции чтения RSS и добавления новостей в базу данных
app.get('/news', async (req, res) => {
    try {
        await fetchNewsAndAddToDatabase();
        res.send('News fetched and added to database.');
    } catch (error) {
        res.status(500).send('Error fetching the news.');
    }
});

app.get('/all-graph', async (req, res) => {
    try {
        const data = await getDataFromAllGraph(connection);
        res.json(data);  
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send('Error fetching the data.');
    }
});

app.get('/live-graph/:country', async (req, res) => {
    const { country } = req.params;

    try {
        const data = await getDataFromCountryGraph(connection, country);
        res.json(data);  
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send('Error fetching the data.');
    }
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});


Promise.all([
    fetchNewsAndAddToDatabase(),
    analyzeNews()
]).then(() => {
    console.log('Both functions completed.');
}).catch((error) => {
    console.error('Error running the functions:', error);
});
