
export async function getDataFromAllGraph(connection) {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT 
            country, 
            DATE(date_news) as day_news, 
            AVG(rating) as avgRait
        FROM 
            news
        WHERE 
            rating != -1
            AND DATE(date_news) >= '2023-10-23'
        GROUP BY 
            country, DATE(date_news)
        ORDER BY 
            country, DATE(date_news) ASC
    `;

        connection.query(query, (err, results) => {
            if (err) return reject(err);

            const organizedData = organizeData(results);
            resolve(organizedData);
        });
    });
}


function organizeData(data) {
    const countries = {};

    data.forEach(row => {
        if (!countries[row.country]) {
            countries[row.country] = {
                country: row.country,
                ratings: []
            };
        }
        countries[row.country].ratings.push({
            date_news: row.day_news,
            avgRait: row.avgRait
        });
    });

    return Object.values(countries);
}


export async function getDataFromCountryGraph(connection, country){
    return new Promise((resolve, reject) => {
        const query = `
            SELECT * FROM news
            WHERE country = ?
            AND rating != -1
            AND date_news >= NOW() - INTERVAL 10 DAY
            ORDER by date_news ASC;
        `;

        connection.query(query, [country], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}