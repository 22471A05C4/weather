const apiKey = "e25ddb66337bc8c7f6c572ffe0527d30"; 
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const forecastApiBase = "https://api.openweathermap.org/data/2.5/forecast?units=metric&";

const searchInput = document.getElementById("search_input");
const searchButton = document.getElementById("search_btn");
const videoBg = document.getElementById("bgVideo");
const weatherImg = document.getElementById("weatherImg");

let currentTempCelsius = null;

searchButton.addEventListener("click", async () => {
  const city = searchInput.value.trim();
  if (city !== "") {
    await getWeather(city);
  }
});

window.addEventListener("load", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      await getWeatherByCoords(latitude, longitude);
    }, (err) => {
      console.warn("Geolocation error:", err.message);
    });
  }
});

async function getWeatherByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  await renderWeather(data);
  await getForecast(lat, lon);
}

async function getWeather(city) {
  const response = await fetch(`${apiUrl}${city}&appid=${apiKey}`);
  const data = await response.json();
  console.log(data);

  if (data.cod !== 200) {
    alert("City not found");
    return;
  }

  await renderWeather(data);
  await getForecast(data.coord.lat, data.coord.lon);
}

function updateVideoBackground(temp) {
  let video = "";
  if (temp < 0) {
    video = "bgfreez.mp4";
  } else if (temp < 10) {
    video = "bgcold.mp4";
  } else if (temp < 20) {
    video = "bgwarm2.mp4";
  } else if (temp < 30) {
    video = "bgveryhot.mp4";
  } else {
    video = "bgveryhot.mp4";
  }
  videoBg.src = video;
}

function updateWeatherImage(temp) {
  let imgSrc = "img/default.jpg"; // fallback default

  if (temp < 0) {
    imgSrc = "icon1.png";
  } else if (temp < 10) {
    imgSrc = "icon2.png";
  } else if (temp < 20) {
    imgSrc = "icon3.png";
  } else if (temp < 30) {
    imgSrc = "icon4.png";
  } else {
    imgSrc = "icon5.png";
  }

  weatherImg.src = imgSrc;
}

async function renderWeather(data) {
  document.querySelector(".card-title").textContent = data.name;
  currentTempCelsius = Math.round(data.main.temp);
  document.querySelector(".temp_display").textContent = `${currentTempCelsius}°C`;
  document.querySelector(".card-text").textContent = data.weather[0].description;

  updateVideoBackground(currentTempCelsius);
  updateWeatherImage(currentTempCelsius);

  document.getElementById("degree_celsius").onclick = () => {
    document.querySelector(".temp_display").textContent = `${currentTempCelsius}°C`;
  };

  document.getElementById("fahreinheit").onclick = () => {
    const f = (currentTempCelsius * 9) / 5 + 32;
    document.querySelector(".temp_display").textContent = `${f.toFixed(2)}°F`;
  };
}

function getIconByTemp(temp) {
  if (temp < 0) {
    return "icon1.png";  // your cold icon/image
  } else if (temp < 10) {
    return "icon2.png";  // your warm icon/image
  } else if (temp < 20) {
    return "icon3.png";
  } else if (temp < 30) {
    return "icon4.png";
  } else {
    return "icon5.png";
  }
}

async function getForecast(lat, lon) {
  const res = await fetch(`${forecastApiBase}lat=${lat}&lon=${lon}&appid=${apiKey}`);
  const data = await res.json();

  const container = document.querySelector("#Future_data .row");
  container.innerHTML = "";

  const addedDays = new Set();
  let dayCount = 0;

  for (let item of data.list) {
    const date = new Date(item.dt * 1000);
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });

    if (addedDays.has(dayName)) continue;
    addedDays.add(dayName);
    dayCount++;
    if (dayCount > 6) break;

    const temp = Math.round(item.main.temp);
    const desc = item.weather[0].description;

    const iconSrc = getIconByTemp(temp);

    // Add class for layout control for splitting rows (3 cards per row)
    const cardClass = (dayCount <= 3) ? "card first-row" : "card second-row";

    container.innerHTML += `
      <div class="${cardClass}">
        <h5>${dayName}</h5>
        <img src="${iconSrc}" alt="${desc}">
        <p>${temp}°C</p>
        <p>${desc}</p>
      </div>
    `;
  }
}



