async function getWeather() {
    const city = document.getElementById('cityInput').value;
    const apiKey = 'YOUR_API_KEY'; // 🔁 Заміни на свій ключ
    const url = ;
  
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Місто не знайдено");
      const data = await response.json();
  
      const temp = data.main.temp;
      const description = data.weather[0].description;
      const humidity = data.main.humidity;
      const wind = data.wind.speed;
  
      document.getElementById('weather').innerHTML = `
        <strong>${city}</strong><br>
        Температура: ${temp} °C<br>
        Погода: ${description}<br>
        Вологість: ${humidity}%<br>
        Вітер: ${wind} м/с
      `;
    } catch (error) {
      document.getElementById('weather').innerText = `Помилка: ${error.message}`;
    }
  }