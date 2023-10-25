const port = 3029;
document.addEventListener("DOMContentLoaded", function() {
    
    fetch(`http://localhost:${port}/all-graph`)
        .then(response => response.json())
        .then(data => {
           // let newsContainer = document.getElementById('newsContainer');
           
           console.log('DATA GRAPH - ', data);

           
            // Шаг 1: Получить список всех дат
            let allDates = new Set();
            data.forEach(countryData => {
                countryData.ratings.forEach(rating => {
                    allDates.add(rating.date_news.split('T')[0]);
                });
            });
            allDates = [...allDates].sort();

            // Шаг 2: Создать итоговый массив
            let result = [['Day'].concat(data.map(countryData => countryData.country))];

            allDates.forEach(date => {
                let row = [date];
                data.forEach(countryData => {
                    const ratingForDate = countryData.ratings.find(rating => rating.date_news.split('T')[0] === date);
                    row.push(ratingForDate ? ratingForDate.avgRait : null);
                });
                result.push(row);
            });

            console.log(result);



           google.charts.load('current', {'packages':['corechart']});
           google.charts.setOnLoadCallback(drawChart);
     
           function drawChart() {
             var data = google.visualization.arrayToDataTable(result);
     
             var options = {
               title: 'Sentiment chart in countries | AVG by Day',
               curveType: 'function',
               legend: { position: 'bottom' }
             };
     
             var chart = new google.visualization.LineChart(document.getElementById('summary-graph'));
     
             chart.draw(data, options);
           }
           
        });

    const country = "UK"; 
    getPraphCountry(country);

    document.getElementById('btn-getGraph').addEventListener('click', ()=>{

        const country = document.getElementById('select-country').value;
        getPraphCountry(country);

    });
});



function getPraphCountry(country) {
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
}