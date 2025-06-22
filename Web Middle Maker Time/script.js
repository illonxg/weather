document.addEventListener('DOMContentLoaded', () => {
    const cityInput = document.getElementById('city-input');
    const searchButton = document.getElementById('search-button');
    const weatherDisplay = document.getElementById('weather-display');
    const forecastDisplay = document.getElementById('forecast-display');
    const forecastCardsContainer = document.getElementById('forecast-cards');
    const rainLayer = document.getElementById('rainLayer');
    const snowLayer = document.getElementById('snowLayer');
    const body = document.body;

    // !!! ЗАМІНІТЬ 'YOUR_API_KEY' НА ВАШ СПРАВЖНІЙ API КЛЮЧ ВІД OPENWEATHERMAP !!!
    const apiKey = '0e8a885fa4f5b83849ef93b58a42e710'; 
    const currentApiUrl = 'https://api.openweathermap.org/data/2.5/weather';
    const forecastApiUrl = 'https://api.openweathermap.org/data/2.5/forecast';

    // URL для Nominatim API (для підказок міст)
    const nominatimApiUrl = 'https://nominatim.openstreetmap.org/search';
    let autocompleteTimeout; // Для затримки запитів автодоповнення

    
    // Функція для динамічного створення datalist (якщо його немає)
    function ensureDatalistExists() {
        let datalist = document.getElementById('cities');
        if (!datalist) {
            datalist = document.createElement('datalist');
            datalist.id = 'cities';
            document.body.appendChild(datalist);
        }
        return datalist;
    }

    // Обробник події для поля введення міста (для автодоповнення)
    cityInput.addEventListener('input', () => {
        clearTimeout(autocompleteTimeout); // Очищаємо попередній таймер
        const query = cityInput.value.trim();

        if (query.length < 3) { // Починаємо шукати після 3 символів
            ensureDatalistExists().innerHTML = ''; // Очищаємо підказки, якщо мало символів
            return;
        }

        autocompleteTimeout = setTimeout(() => {
            fetchCitySuggestions(query);
        }, 300); // Затримка 300 мс перед відправкою запиту
    });

    async function fetchCitySuggestions(query) {
        const datalist = ensureDatalistExists();
        datalist.innerHTML = ''; // Очищаємо попередні підказки

        try {
            // Запит до Nominatim API
            const response = await fetch(`${nominatimApiUrl}?q=${query}&format=json&limit=10&city=1&addressdetails=0&accept-language=uk`);
            const data = await response.json();

            if (data && data.length > 0) {
                // Фільтруємо, щоб показувати тільки міста/населені пункти
                const cities = data.filter(item => 
                    item.type === 'city' || 
                    item.type === 'town' || 
                    item.type === 'village' ||
                    item.osm_type === 'relation' && item.addresstype === 'city' // Для деяких великих міст
                );

                cities.forEach(item => {
                    const option = document.createElement('option');
                    // Використовуємо display_name, але можемо його обрізати, щоб показати тільки місто
                    // Nominatim може повертати "Київ, Київська область, Україна"
                    // Спробуємо витягнути лише назву міста
                    let cityName = item.name || item.display_name.split(',')[0].trim();
                    option.value = cityName;
                    datalist.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Помилка отримання підказок міст:', error);
        }
    }

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
        const { name, main, weather, wind, sys, timezone } = data; 
        const temperature = main.temp.toFixed(1);
        const feelsLike = main.feels_like.toFixed(1);
        const description = weather[0].description;
        const humidity = main.humidity;
        const windSpeed = wind.speed.toFixed(1);
        const weatherCondition = weather[0].main;

        const sunriseTimestamp = sys.sunrise;
        const sunsetTimestamp = sys.sunset;

        const cityUtcOffsetSeconds = timezone; 

        const formatTime = (timestamp, utcOffset) => {
            const date = new Date((timestamp + utcOffset) * 1000); 
            return date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'UTC' });
        };

        const sunriseTime = formatTime(sunriseTimestamp, cityUtcOffsetSeconds);
        const sunsetTime = formatTime(sunsetTimestamp, cityUtcOffsetSeconds);


        weatherDisplay.innerHTML = `
            <h2>${name}</h2>
            <p class="temperature">${temperature}°C</p>
            <p>Відчувається як: ${feelsLike}°C</p>
            <p>${description.charAt(0).toUpperCase() + description.slice(1)}</p>
            <p>Вологість: ${humidity}%</p>
            <p>Швидкість вітру: ${windSpeed} м/с</p>
            <p>Схід сонця: ${sunriseTime}</p>
            <p>Захід сонця: ${sunsetTime}</p>
        `;

        applyWeatherEffects(weatherCondition);
    }

    function displayForecast(data) {
        forecastCardsContainer.innerHTML = ''; 

        const uniqueDays = new Set();
        const dailyForecasts = [];

        data.list.forEach(forecast => {
            const date = new Date(forecast.dt * 1000);
            const dayKey = date.toLocaleDateString('uk-UA'); 
            
            if (!uniqueDays.has(dayKey) && dailyForecasts.length < 5) { 
                dailyForecasts.push(forecast);
                uniqueDays.add(dayKey);
            }
        });

        dailyForecasts.forEach(forecast => {
            const date = new Date(forecast.dt * 1000);
            const day = date.toLocaleDateString('uk-UA', { weekday: 'short', day: 'numeric', month: 'short' });
            
            const tempMin = forecast.main.temp_min.toFixed(0);
            const tempMax = forecast.main.temp_max.toFixed(0);
            const description = forecast.weather[0].description;
            const iconCode = forecast.weather[0].icon;
            const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;

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
        forecastCardsContainer.innerHTML = ''; 
        forecastDisplay.style.display = 'none'; 
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

    function createRainDrops(count = 250) { 
        if (!rainLayer) return;
        rainLayer.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const drop = document.createElement('div');
            drop.classList.add('drop');
            drop.style.left = Math.random() * 100 + 'vw';
            drop.style.width = (1 + Math.random() * 2) + 'px'; 
            drop.style.height = (8 + Math.random() * 7) + 'px'; 
            drop.style.animationDuration = (0.4 + Math.random() * 0.8) + 's'; 
            drop.style.animationDelay = (Math.random() * 0.5) + 's';
            drop.style.opacity = (0.5 + Math.random() * 0.5); 
            rainLayer.appendChild(drop);
        }
    }

    function createSnowFlakes(count = 150) { 
        if (!snowLayer) return;
        snowLayer.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const flake = document.createElement('div');
            flake.classList.add('flake');
            flake.style.left = Math.random() * 100 + 'vw';
            flake.style.width = (3 + Math.random() * 4) + 'px'; 
            flake.style.height = flake.style.width; 
            flake.style.animationDuration = (3 + Math.random() * 2) + 's';
            flake.style.animationDelay = (Math.random() * 2) + 's';
            flake.style.opacity = (0.5 + Math.random() * 0.5);
            snowLayer.appendChild(flake);
        }
    }

    // Забезпечуємо існування datalist при завантаженні сторінки
    ensureDatalistExists();
    resetWeatherEffects(); 
});