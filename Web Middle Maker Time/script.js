document.addEventListener('DOMContentLoaded', () => {
    const cityInput = document.getElementById('city-input');
    const searchButton = document.getElementById('search-button');
    const weatherDisplay = document.getElementById('weather-display');
    const forecastDisplay = document.getElementById('forecast-display');
    const forecastCardsContainer = document.getElementById('forecast-cards');
    const weatherContainer = document.getElementById('weatherContainer');
    const rainLayer = document.getElementById('rainLayer');
    const snowLayer = document.getElementById('snowLayer');
    const body = document.body;

    // !!! ЗАМІНІТЬ 'YOUR_API_KEY' НА ВАШ СПРАВЖНІЙ API КЛЮЧ ВІД OPENWEATHERMAP !!!
    const apiKey = '0e8a885fa4f5b83849ef93b58a42e710';
    const currentApiUrl = 'https://api.openweathermap.org/data/2.5/weather';
    const forecastApiUrl = 'https://api.openweathermap.org/data/2.5/forecast';

    searchButton.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherData(city);
            getForecastData(city);
        } else {
            weatherDisplay.innerHTML = '<p>Будь ласка, введіть назву міста.</p>';
            forecastCardsContainer.innerHTML = '';
            forecastDisplay.style.display = 'none'; // Приховуємо блок прогнозу
            resetWeatherEffects();
        }
    });

    async function getWeatherData(city) {
        try {
            const response = await fetch(`${currentApiUrl}?q=${city}&appid=${apiKey}&units=metric&lang=ua`);
            const data = await response.json();

            if (response.ok) {
                displayWeather(data);
            } else {
                weatherDisplay.innerHTML = `<p>Місто не знайдено або помилка: ${data.message}</p>`;
                resetWeatherEffects();
            }
        } catch (error) {
            console.error('Помилка отримання даних про поточну погоду:', error);
            weatherDisplay.innerHTML = '<p>Виникла проблема під час завантаження даних про поточну погоду. Спробуйте пізніше.</p>';
            resetWeatherEffects();
        }
    }

    async function getForecastData(city) {
        try {
            const response = await fetch(`${forecastApiUrl}?q=${city}&appid=${apiKey}&units=metric&lang=ua`);
            const data = await response.json();

            if (response.ok) {
                displayForecast(data);
                forecastDisplay.style.display = 'block'; // Показуємо блок прогнозу
            } else {
                forecastCardsContainer.innerHTML = `<p>Не вдалося отримати прогноз: ${data.message}</p>`;
                forecastDisplay.style.display = 'none'; // Приховуємо блок прогнозу
            }
        } catch (error) {
            console.error('Помилка отримання даних про прогноз погоди:', error);
            forecastCardsContainer.innerHTML = '<p>Виникла проблема під час завантаження даних прогнозу. Спробуйте пізніше.</p>';
            forecastDisplay.style.display = 'none'; // Приховуємо блок прогнозу
        }
    }

    function displayWeather(data) {
        const { name, main, weather, wind } = data;
        const temperature = main.temp.toFixed(1);
        const feelsLike = main.feels_like.toFixed(1);
        const description = weather[0].description;
        const humidity = main.humidity;
        const windSpeed = wind.speed.toFixed(1);
        const weatherCondition = weather[0].main;

        weatherDisplay.innerHTML = `
            <h2>${name}</h2>
            <p class="temperature">${temperature}°C</p>
            <p>Відчувається як: ${feelsLike}°C</p>
            <p>${description.charAt(0).toUpperCase() + description.slice(1)}</p>
            <p>Вологість: ${humidity}%</p>
            <p>Швидкість вітру: ${windSpeed} м/с</p>
        `;

        applyWeatherEffects(weatherCondition);
    }

    function displayForecast(data) {
        forecastCardsContainer.innerHTML = ''; // Очищаємо попередні картки

        // Використовуємо Set для відстеження унікальних днів
        const uniqueDays = new Set();
        const dailyForecasts = [];

        // Проходимо по всіх 3-годинних прогнозах
        data.list.forEach(forecast => {
            const date = new Date(forecast.dt * 1000);
            const dayKey = date.toLocaleDateString('uk-UA'); // Використовуємо дату як ключ
            
            // Якщо цей день ще не був доданий
            if (!uniqueDays.has(dayKey) && dailyForecasts.length < 5) { // Обмежуємо до 5 днів
                dailyForecasts.push(forecast);
                uniqueDays.add(dayKey);
            }
        });

        // Додаємо картки для кожного унікального дня
        dailyForecasts.forEach(forecast => {
            const date = new Date(forecast.dt * 1000);
            // Використовуємо 'uk-UA' для українських назв днів/місяців
            const day = date.toLocaleDateString('uk-UA', { weekday: 'short', day: 'numeric', month: 'short' });
            
            // Якщо ви хочете відобразити температуру на день, а не на конкретний 3-годинний інтервал,
            // вам потрібно буде агрегувати min/max температури за весь день.
            // Для спрощення, тут ми беремо температуру з обраного 3-годинного інтервалу.
            const tempMin = forecast.main.temp_min.toFixed(0);
            const tempMax = forecast.main.temp_max.toFixed(0);
            const description = forecast.weather[0].description;
            const iconCode = forecast.weather[0].icon;
            const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`; // Використовуємо @2x для більших іконок

            const forecastCard = document.createElement('div');
            forecastCard.classList.add('forecast-card');
            forecastCard.innerHTML = `
                <p class="date">${day}</p>
                <img src="${iconUrl}" alt="${description}" title="${description}">
                <p class="temp-range">${tempMin}°C / ${tempMax}°C</p>
                <p>${description.charAt(0).toUpperCase() + description.slice(1)}</p>
            `;
            forecastCardsContainer.appendChild(forecastCard);
        });
    }

    function resetWeatherEffects() {
        if (rainLayer) rainLayer.innerHTML = '';
        if (snowLayer) snowLayer.innerHTML = '';
        body.classList.remove('clear', 'clouds', 'rain', 'drizzle', 'thunderstorm', 'snow', 'mist', 'smoke', 'haze', 'dust', 'fog', 'sand', 'ash', 'squall', 'tornado');
        forecastCardsContainer.innerHTML = ''; // Очищаємо прогноз
        forecastDisplay.style.display = 'none'; // Приховуємо блок прогнозу
    }

    function applyWeatherEffects(condition) {
        resetWeatherEffects();
        body.classList.add(condition.toLowerCase());

        if (condition === 'Rain' || condition === 'Drizzle') {
            if (rainLayer) createRainDrops();
        } else if (condition === 'Snow') {
            if (snowLayer) createSnowFlakes();
        }
    }

    function createRainDrops(count = 100) {
        if (!rainLayer) return;
        rainLayer.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const drop = document.createElement('div');
            drop.classList.add('drop');
            drop.style.left = Math.random() * 100 + 'vw';
            drop.style.animationDuration = (0.5 + Math.random()) + 's';
            drop.style.animationDelay = (Math.random() * 0.5) + 's';
            rainLayer.appendChild(drop);
        }
    }

    function createSnowFlakes(count = 50) {
        if (!snowLayer) return;
        snowLayer.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const flake = document.createElement('div');
            flake.classList.add('flake');
            flake.style.left = Math.random() * 100 + 'vw';
            flake.style.animationDuration = (3 + Math.random() * 2) + 's';
            flake.style.animationDelay = (Math.random() * 2) + 's';
            flake.style.opacity = (0.5 + Math.random() * 0.5);
            snowLayer.appendChild(flake);
        }
    }

    resetWeatherEffects(); // Початкове очищення ефектів та приховування прогнозу
});