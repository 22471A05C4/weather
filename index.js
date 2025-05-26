let apiKey = "e25ddb66337bc8c7f6c572ffe0527d30";
let apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
let forecastApiBase = "https://api.openweathermap.org/data/2.5/forecast?units=metric&";

let searchInput = document.getElementById("search_input");
let searchButton = document.getElementById("search_btn");

document.getElementById("darkMode_btn").addEventListener("click", () => {
    document.body.classList.add("dark-mode");
    document.body.classList.remove("light-mode");
});

document.getElementById("lightMode_btn").addEventListener("click", () => {
    document.body.classList.remove("dark-mode");
    document.body.classList.add("light-mode");
});

let currentTempCelsius = null;

searchButton.addEventListener("click", async () => {
    let city = searchInput.value.trim();
    if (city !== "") {
        await getWeather(city);
    }
});

async function getWeather(city) {
    try {
        let response = await fetch(`${apiUrl}${city}&appid=${apiKey}`);
        let data = await response.json();

        if (data.cod !== 200) throw new Error(data.message);

        document.querySelector('.card-title').innerHTML = data.name;
        currentTempCelsius = Math.round(data.main.temp);
        document.querySelector('.temp_display').innerHTML = `${currentTempCelsius}°C`;
        document.querySelector('.card-text').innerHTML = data.weather[0].description;

        let weatherImg = document.getElementById("weatherImg");
        if (currentTempCelsius < 0) weatherImg.src = 'img/freez.jpg';
        else if (currentTempCelsius < 10) weatherImg.src = 'img/cold.jpg';
        else if (currentTempCelsius < 20) weatherImg.src = 'img/cool.jpg';
        else if (currentTempCelsius < 30) weatherImg.src = 'img/warm.jpg';
        else weatherImg.src = 'img/hot.jpg';

        document.getElementById("degree_celsius").onclick = () => {
            document.querySelector('.temp_display').innerHTML = `${currentTempCelsius}°C`;
        };

        document.getElementById("fahreinheit").onclick = () => {
            let f = (currentTempCelsius * 9 / 5) + 32;
            document.querySelector('.temp_display').innerHTML = `${f.toFixed(2)}°F`;
        };

        await getForecast(data.coord.lat, data.coord.lon);
    } catch (err) {
        alert("City not found or API error: " + err.message);
    }
}

async function getForecast(lat, lon) {
    let url = `${forecastApiBase}lat=${lat}&lon=${lon}&appid=${apiKey}`;
    let res = await fetch(url);
    let data = await res.json();

    let container = document.querySelector("#Future_data .row");
    container.innerHTML = "";
    let addedDays = new Set();

    for (let item of data.list) {
        let date = new Date(item.dt * 1000);
        let dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        if (addedDays.has(dayName)) continue;
        addedDays.add(dayName);
        if (addedDays.size > 6) break;

        let temp = Math.round(item.main.temp);
        let icon = item.weather[0].icon;
        let desc = item.weather[0].description;

        container.innerHTML += `
            <div class="card">
                <h5>${dayName}</h5>
                <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="">
                <p>${temp}°C</p>
                <p>${desc}</p>
            </div>
        `;
    }
}
