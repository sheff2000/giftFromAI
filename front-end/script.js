document.addEventListener("DOMContentLoaded", function() {
    const port = 3027;
    fetch(`http://localhost:${port}/all-graph`)
        .then(response => response.json())
        .then(data => {
           // let newsContainer = document.getElementById('newsContainer');
           
           console.log('DATA GRAPH - ', data);
           
           data.forEach(news => {
                let newsItem = document.createElement('div');
                newsItem.textContent = news.title; // Здесь выводим только заголовок, но можно добавить и другую информацию
                newsContainer.appendChild(newsItem);
            });
        });

    const country = "UK"; 
    fetch(`http://localhost:${port}/live-graph/${country}`)
            .then(response => response.json())
            .then(data => {
                

                const transformedData = [['date_news', 'Rating']];
                data.forEach(item => {
                    transformedData.push([item.date_news, item.rating]);
                });
                console.log(transformedData);

                google.charts.load('current', {'packages':['corechart']});
                google.charts.setOnLoadCallback(drawChart);

                function drawChart() {
                    var data = google.visualization.arrayToDataTable(transformedData);

                    var options = {
                    title: 'News from - '+ country,
                    hAxis: {title: 'Day',  titleTextStyle: {color: '#333'}},
                    vAxis: {minValue: 0}
                    };

                    var chart = new google.visualization.AreaChart(document.getElementById('chart_div'));
                    chart.draw(data, options);
                }


            })
            .catch(error => {
                console.error("Error fetching data from server:", error);
            });
});
