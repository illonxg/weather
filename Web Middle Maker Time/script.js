document.addEventListener('DOMContentLoaded', () => {
    const cityInput = document.getElementById('city-input');
    const searchButton = document.getElementById('search-button');
    const weatherDisplay = document.getElementById('weather-display');
    const weatherContainer = document.getElementById('weatherContainer'); // Перейменував для уникнення конфлікту
    const rainLayer = document.getElementById('rainLayer');
    const snowLayer = document.getElementById('snowLayer');
    const body = document.body; // Отримуємо посилання на <body> для зміни фону

    // !!! ЗАМІНІТЬ 'YOUR_API_KEY' НА ВАШ СПРАВЖНІЙ API КЛЮЧ ВІД OPENWEATHERMAP !!!
    const apiKey = '0e8a885fa4f5b83849ef93b58a42e710';
    const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';

    searchButton.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherData(city);
        } else {
            weatherDisplay.innerHTML = '<p>Будь ласка, введіть назву міста.</p>';
            resetWeatherEffects(); // Очищаємо ефекти, якщо місто не введено
        }
    });

    async function getWeatherData(city) {
        try {
            const response = await fetch(`${apiUrl}?q=${city}&appid=${apiKey}&units=metric&lang=ua`);
            const data = await response.json();

            if (response.ok) {
                displayWeather(data);
            } else {
                weatherDisplay.innerHTML = `<p>Місто не знайдено або помилка: ${data.message}</p>`;
                resetWeatherEffects(); // Очищаємо ефекти при помилці
            }
        } catch (error) {
            console.error('Помилка отримання даних про погоду:', error);
            weatherDisplay.innerHTML = '<p>Виникла проблема під час завантаження даних про погоду. Спробуйте пізніше.</p>';
            resetWeatherEffects(); // Очищаємо ефекти при помилці
        }
    }

    function displayWeather(data) {
        const { name, main, weather, wind } = data;
        const temperature = main.temp.toFixed(1);
        const feelsLike = main.feels_like.toFixed(1);
        const description = weather[0].description;
        const humidity = main.humidity;
        const windSpeed = wind.speed.toFixed(1);
        const weatherCondition = weather[0].main; // Основна категорія погоди (наприклад, 'Rain', 'Clear', 'Clouds')

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

    // Функція для очищення всіх погодних ефектів
    function resetWeatherEffects() {
        if (rainLayer) rainLayer.innerHTML = '';
        if (snowLayer) snowLayer.innerHTML = '';
        // Скидаємо всі класи фону на body
        body.classList.remove('clear', 'clouds', 'rain', 'drizzle', 'thunderstorm', 'snow', 'mist', 'smoke', 'haze', 'dust', 'fog', 'sand', 'ash', 'squall', 'tornado');
        // Можливо, повернути дефолтний фон, якщо він відрізняється від початкового body
        // body.style.background = 'linear-gradient(to right, #6a11cb, #2575fc)';
    }

    // Функція для застосування ефектів відповідно до погодних умов
    function applyWeatherEffects(condition) {
        resetWeatherEffects(); // Спочатку очищаємо попередні ефекти

        // Додаємо клас до <body> для зміни фону
        // Перетворюємо у нижній регістр, бо класи CSS в нижньому регістрі
        body.classList.add(condition.toLowerCase()); 

        if (condition === 'Rain' || condition === 'Drizzle') {
            if (rainLayer) createRainDrops();
        } else if (condition === 'Snow') {
            if (snowLayer) createSnowFlakes();
        }
        // Для інших умов (Clear, Clouds тощо) анімації не потрібні, тільки зміна фону
    }

    function createRainDrops(count = 100) {
        if (!rainLayer) return; // Перевірка, чи існує rainLayer
        rainLayer.innerHTML = ''; // Очищаємо перед створенням нових
        for (let i = 0; i < count; i++) {
            const drop = document.createElement('div');
            drop.classList.add('drop');
            drop.style.left = Math.random() * 100 + 'vw';
            drop.style.animationDuration = (0.5 + Math.random()) + 's';
            drop.style.animationDelay = (Math.random() * 0.5) + 's'; // Додаємо затримку для варіативності
            rainLayer.appendChild(drop);
        }
    }

    function createSnowFlakes(count = 50) {
        if (!snowLayer) return; // Перевірка, чи існує snowLayer
        snowLayer.innerHTML = ''; // Очищаємо перед створенням нових
        for (let i = 0; i < count; i++) {
            const flake = document.createElement('div');
            flake.classList.add('flake');
            flake.style.left = Math.random() * 100 + 'vw';
            flake.style.animationDuration = (3 + Math.random() * 2) + 's';
            flake.style.animationDelay = (Math.random() * 2) + 's'; // Додаємо затримку
            flake.style.opacity = (0.5 + Math.random() * 0.5); // Варіативна прозорість
            snowLayer.appendChild(flake);
        }
    }

    // При першому завантаженні сторінки або коли не введено місто, переконайтеся, що анімацій немає
    resetWeatherEffects();
});