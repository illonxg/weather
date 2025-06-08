document.addEventListener('DOMContentLoaded', () => {
  const cityInput = document.getElementById('city-input');
  const searchButton = document.getElementById('search-button');
  const weatherDisplay = document.getElementById('weather-display');

  // !!! ЗАМІНІТЬ 'YOUR_API_KEY' НА ВАШ СПРАВЖНІЙ API КЛЮЧ ВІД OPENWEATHERMAP !!!
  const apiKey = '0e8a885fa4f5b83849ef93b58a42e710'; 
  const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';

  searchButton.addEventListener('click', () => {
      const city = cityInput.value.trim();
      if (city) {
          getWeatherData(city);
      } else {
          weatherDisplay.innerHTML = '<p>Будь ласка, введіть назву міста.</p>';
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
          }
      } catch (error) {
          console.error('Помилка отримання даних про погоду:', error);
          weatherDisplay.innerHTML = '<p>Виникла проблема під час завантаження даних про погоду. Спробуйте пізніше.</p>';
      }
  }

  function displayWeather(data) {
      const { name, main, weather, wind } = data;
      const temperature = main.temp.toFixed(1); // Температура з одним знаком після коми
      const feelsLike = main.feels_like.toFixed(1);
      const description = weather[0].description;
      const humidity = main.humidity;
      const windSpeed = wind.speed.toFixed(1); // Швидкість вітру

      weatherDisplay.innerHTML = `
          <h2>${name}</h2>
          <p class="temperature">${temperature}°C</p>
          <p>Відчувається як: ${feelsLike}°C</p>
          <p>${description.charAt(0).toUpperCase() + description.slice(1)}</p>
          <p>Вологість: ${humidity}%</p>
          <p>Швидкість вітру: ${windSpeed} м/с</p>
      `;
  }
});