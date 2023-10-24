document.addEventListener("DOMContentLoaded", function() {
    fetch('http://localhost:3001/news')
        .then(response => response.json())
        .then(data => {
            let newsContainer = document.getElementById('newsContainer');
            data.forEach(news => {
                let newsItem = document.createElement('div');
                newsItem.textContent = news.title; // Здесь выводим только заголовок, но можно добавить и другую информацию
                newsContainer.appendChild(newsItem);
            });
        });
});
