
const API_KEY = "6a5c2ddd9d8d71b40c2eafbe2bf32c5b";

document.getElementById("searchBtn").addEventListener("click", () => {
    const city = document.getElementById("cityInput").value.trim();

    if (city) {
        fetchWeather(city);
    }
});


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

window.addEventListener("DOMContentLoaded", () => {
    fetchWeather("Kolkata");
});