
const API_KEY = "6a5c2ddd9d8d71b40c2eafbe2bf32c5b";

const cityInput = document.getElementById("cityInput");
const suggestions = document.getElementById("suggestions");
let selectedIndex = -1;

document.getElementById("searchBtn").addEventListener("click", () => {
    const city = document.getElementById("cityInput").value.trim();

    if (city) {
        fetchWeather(city);
    }
});

async function fetchSuggestions(query) {

    if (query.length < 2) {
        suggestions.innerHTML = "";
        return;
    }

    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    suggestions.innerHTML = "";
    selectedIndex = -1;

    data.forEach(city => {
        const item = document.createElement("div");
        item.className = "suggestion-item";
        item.textContent =
            `${city.name}, ${city.state ? city.state + ", " : ""}${city.country}`;

        item.onclick = () => {
            cityInput.value = `${city.name}, ${city.country}`;
            suggestions.innerHTML = "";
            fetchWeather(city.name);

        };

        suggestions.appendChild(item);

    });

}

function updateSelection() {

    const items = document.querySelectorAll(".suggestion-item");

    items.forEach((item, index) => {
        if (index === selectedIndex) {
            item.style.background = "#2563eb";
        }
        else {
            item.style.background = "";
        }

    });

}

async function fetchWeather(city) {
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;

    try {

        // Fetch both APIs together
        const [currentRes, forecastRes] = await Promise.all([
            fetch(currentUrl),
            fetch(forecastUrl)
        ]);

        if (!currentRes.ok || !forecastRes.ok) {
            throw new Error("City not found");
        }

        const currentData = await currentRes.json();
        const forecastData = await forecastRes.json();

        // Create date & time according to the selected city's timezone
        const utc = Date.now() + new Date().getTimezoneOffset() * 60000;
        const cityDate = new Date(utc + currentData.timezone * 1000);

        const weatherInfo = document.getElementById("weatherInfo");

        // One forecast card per day
        const dailyForecast = forecastData.list.filter(item =>
            item.dt_txt.includes("12:00:00")
        );

        const forecastHTML = dailyForecast.map(day => {

            const date = new Date(day.dt_txt).toLocaleDateString("en-US", {
                weekday: "short"
            });

            return `
                <div class="forecast-card">
                    <div>${date}</div>

                    <img
                        src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png"
                        alt="icon">

                    <div>${Math.round(day.main.temp)}°C</div>
                </div>
            `;

        }).join("");

        weatherInfo.innerHTML = `
<div class="city">
    📍 ${currentData.name}, ${currentData.sys.country}
</div>

<div class="date-time">
    ${cityDate.toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "short",
            year: "numeric"
        })}
    •
    ${cityDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        })}
</div>

<div class="weather-main">

    <img src="https://openweathermap.org/img/wn/${currentData.weather[0].icon}@4x.png" alt="weather">

    <div class="temperature">
        ${Math.round(currentData.main.temp)}°
    </div>

</div>

<div class="condition">
    ${currentData.weather[0].description}
</div>

<div class="feels-like">
    Feels Like ${Math.round(currentData.main.feels_like)}°
</div>

<div class="details">
    <div class="detail-card">
        <div class="detail-icon">💧</div>
        <div class="detail-title">Humidity</div>
        <div class="detail-value">${currentData.main.humidity}%</div>
    </div>

    <div class="detail-card">
        <div class="detail-icon">🌬️</div>
        <div class="detail-title">Wind Speed</div>
        <div class="detail-value">${currentData.wind.speed} m/s</div>
    </div>
</div>


<div class="forecast">
    ${forecastHTML}
</div>
        `;

    } catch (error) {

        document.getElementById("weatherInfo").innerHTML =
            `<p>${error.message}</p>`;
    }
}

cityInput.addEventListener("input", (e) => {
    fetchSuggestions(e.target.value);
});

cityInput.addEventListener("keydown", (e) => {
    const items = document.querySelectorAll(".suggestion-item");
    if (!items.length) return;

    if (e.key === "ArrowDown") {
        e.preventDefault();
        selectedIndex++;

        if (selectedIndex >= items.length)
            selectedIndex = 0;
        updateSelection();

    }

    else if (e.key === "ArrowUp") {
        e.preventDefault();
        selectedIndex--;
        if (selectedIndex < 0)
            selectedIndex = items.length - 1;
        updateSelection();

    }

    else if (e.key === "Enter") {
        e.preventDefault();
        if (selectedIndex >= 0)
            items[selectedIndex].click();

    }
});

document.addEventListener("click", (e) => {
    if (!cityInput.contains(e.target) && !suggestions.contains(e.target)) {
        suggestions.innerHTML = "";
    }
});

window.addEventListener("DOMContentLoaded", () => {
    fetchWeather("Kolkata");
});