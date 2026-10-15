
var latitude = 35.6895;
var longitude = 139.6917;

var weatherUrl =
    "https://api.open-meteo.com/v1/forecast" +
    "?latitude=" + latitude +
    "&longitude=" + longitude +
    "&current=temperature_2m,weather_code" +
    "&timezone=Asia%2FTokyo";

fetch(weatherUrl)
    .then(function(response){
        return response.json();
    })
    .then(function(data) {
        var weatherCode = data.current.weather_code;
        var temperature = data.current.temperature_2m;

        showWeather(weatherCode);

        document.getElementById("weather-temperature").textContent =
            Math.round(temperature) + "°C";
    })
    .catch(function(error) {
        console.log("天気の取得に失敗しました", error);
    });

function showWeather(code) {
    var icon = document.getElementById("weather-icon");

    // 前の天気クラスを削除する
    document.body.classList.remove(
        "weather-sunny",
        "weather-cloudy",
        "weather-rainy"
    );

    if (code === 0){
        icon.textContent = "☀";
        document.body.classList.add("weather-sunny");
    }
    else if (code >= 1 && code <= 3){
        icon.textContent = "☁";
        document.body.classList.add("weather-cloudy");
    }
    else if (code >= 51 && code <= 67){
        icon.textContent = "☂";
        document.body.classList.add("weather-rainy");
    }
    else {
        icon.textContent = "☁";
        document.body.classList.add("weather-cloudy");
    }
}


fetch("works.csv")
    .then(function(response){
        return response.text();
    })
    .then(function(data){

        // CSVを行ごとに分類
        var rows = data.trim().split(/\r?\n/);

        // 1行目は見出し
        var headers = rows[0].split(",");

        // 2行目以降を作品データにする
        var works = rows.slice(1).map(function(row){
            var values = row.split(",");

            var work = {};
            headers.forEach(function(header, index){
                work[header.trim()] = (values[index] || "").trim();
            });

            return work;
        });

        // Worksを表示する場所
        var grid = document.getElementById("works-grid");
        var categorySelect = document.getElementById("category");
        var sortSelect = document.getElementById("sort");

        // カテゴリー一覧を作る
        var categories = [];

        works.forEach(function(work){
            // まだ追加されていないカテゴリーならリストに追加
            if (
                work.category &&
                !categories.includes(work.category)
            ){
                categories.push(work.category);
            }
        });

        // selectにカテゴリーを追加しWebページに表示する
        categories.forEach(function(category) {
            var option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });

        // 作品を表示する
        function displayWorks() {
            // 選択されたカテゴリーを取得
            var selectedCategory = categorySelect.value;

            // 選択されたソート方法を取得
            var sortType = sortSelect.value;

            // 元のworksをコピー
            var filteredWorks = works.slice();

            // カテゴリーの絞り込み
            if (selectedCategory !== "all") {
                filteredWorks = filteredWorks.filter(function(work){
                    return work.category === selectedCategory;
                });
            }

            // ソート
            if (sortType === "new"){
                filteredWorks.sort(function(a,b){
                    return Number(b.year) - Number(a.year);
                });
            }
            else if (sortType === "old") {
                filteredWorks.sort(function(a,b){
                    return Number(a.year) - Number(b.year);
                });
            }
            else if (sortType === "title"){
                filteredWorks.sort(function(a,b){
                    return a.title.localeCompare(b.title, "ja");
                });
            }

            // 画面を一度空にする
            grid.innerHTML = "";

            // 作品を一つずつ表示
            filteredWorks.forEach(function(work){

                var card = document.createElement("article");
                card.className = "work-card";

                card.innerHTML =
                    '<a href="' + work.link + '">' +
                        '<img src="' + work.image + '" alt="' + work.title + '">' +
                        '<div class="work-info">' +
                            '<p class="work-category">' + work.category + '</p>' +
                            '<h3>' + work.title + '</h3>' +
                            '<p class="work-description">' + work.description + '</p>' +
                            '<p class="work-year">' + work.year + '</p>' +
                        '</div>' +
                    '</a>';

                grid.appendChild(card);
            });
        }

        // 最初に表示
        displayWorks();

        // カテゴリー変更時
        categorySelect.addEventListener("change", function(){
            displayWorks();
        });

        // ソート変更時
        sortSelect.addEventListener("change", function(){
            displayWorks();
        });
    })
    .catch(function(error) {
        console.log("作品データの読み込みに失敗しました", error);
    });
