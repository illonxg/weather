async function getWeather() {
    const city = document.getElementById('cityInput').value.trim();
    const apiKey = 'fe422ef8afa44e64a74140551252505';
    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&lang=uk`;
  
    const weatherDiv = document.getElementById('weather');
  
    if (!city) {
      weatherDiv.innerHTML = `<span style="color: yellow;">⚠️ Введіть назву міста.</span>`;
      return;
    }
  
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Місто не знайдено");
  
      const data = await response.json();
  
      weatherDiv.innerHTML = `
        <h2>${data.location.name}, ${data.location.country}</h2>
        <p>🌡 Температура: ${data.current.temp_c} °C</p>
        <p>☁️ Погода: ${data.current.condition.text}</p>
        <p>💧 Вологість: ${data.current.humidity}%</p>
        <p>🌬 Вітер: ${data.current.wind_kph} км/год</p>
        <img src="https:${data.current.condition.icon}" alt="icon">
      `;
    } catch (error) {
      weatherDiv.innerHTML = `<span style="color: red;">❌ ${error.message}</span>`;
    }
  }