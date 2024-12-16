const API_KEY = "d7bac82c476a4aff996151609241212"; // Thay bằng API key từ WeatherAPI
const CURRENT_API_URL = "https://api.weatherapi.com/v1/current.json";
const FORECAST_API_URL = "https://api.weatherapi.com/v1/forecast.json";

const weatherForm = document.getElementById("weather-form");
const cityInput = document.getElementById("city-input");
const autocompleteResults = document.getElementById("autocomplete-results");
const weatherContainer = document.getElementById("weather-container");
const forecastContainer = document.getElementById("forecast-container");
const forecastDays = document.getElementById("forecast-days");
const errorContainer = document.getElementById("error-container");
const loadingContainer = document.getElementById("loading-container");
const closeButton = document.getElementById("close-button");

const locationElement = document.getElementById("location");
const temperatureElement = document.getElementById("temperature");
const conditionElement = document.getElementById("condition");
const humidityElement = document.getElementById("humidity");

// Dịch các điều kiện thời tiết sang tiếng Việt
function translateCondition(condition) {
  if (!condition) return "Không xác định";
  const conditions = {
    Clear: "Trời quang đãng",
    "Partly Cloudy": "Có mây",
    Cloudy: "Có mây",
    Overcast: "Trời âm u",
    Mist: "Sương mù nhẹ",
    Fog: "Sương mù dày",
    Rain: "Mưa",
    Drizzle: "Mưa phùn",
    Thunderstorm: "Dông bão",
    Snow: "Tuyết",
    Hail: "Mưa đá",
    Windy: "Gió mạnh",
    Tornado: "Lốc xoáy",
    Blizzard: "Bão tuyết",
    Dust: "Bụi",
    Sand: "Cát",
    Freezing: "Lạnh có băng",
    Sunny: "Nắng",
    "Patchy rain nearby": "Mưa rải rác",
    Showers: "Mưa rào",
    overcast: "Nhiều mây",
  };
  return conditions[condition] || condition;
}

// Fetch weather data
async function fetchWeather(city) {
  try {
    const response = await fetch(
      `${FORECAST_API_URL}?key=${API_KEY}&q=${city}&days=7`
    );
    if (!response.ok) {
      if (response.status === 400)
        throw new Error("Tên thành phố không hợp lệ.");
      if (response.status === 401) throw new Error("API Key không hợp lệ.");
      throw new Error("Không thể lấy dữ liệu thời tiết.");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Display current weather information
function displayWeather(data) {
  if (!data || !data.current || !data.location) {
    errorContainer.textContent = "Dữ liệu thời tiết không đầy đủ.";
    return;
  }

  weatherContainer.classList.remove("hidden");
  errorContainer.classList.add("hidden");
  loadingContainer.classList.add("hidden");

  locationElement.textContent = `${data.location.name}, ${data.location.country}`;
  temperatureElement.textContent = `${data.current.temp_c}°C`;
  conditionElement.textContent = translateCondition(
    data.current.condition.text
  );
  humidityElement.textContent = `Độ ẩm: ${data.current.humidity}%`;
}

// Display forecast information with icons
function displayForecast(data) {
  if (!data || !data.forecast || !data.forecast.forecastday) {
    errorContainer.textContent = "Dữ liệu dự báo thời tiết không đầy đủ.";
    return;
  }

  forecastContainer.classList.remove("hidden");
  forecastDays.innerHTML = ""; // Clear previous forecast data

  data.forecast.forecastday.forEach((day) => {
    const forecastHTML = `
      <div class="p-4 border rounded shadow bg-blue-50 w-1/7 text-center">
        <h4 class="font-bold">${new Date(day.date).toLocaleDateString("vi-VN", {
          weekday: "long",
          day: "numeric",
          month: "numeric",
        })}</h4>
        <img src="https:${
          day.day.condition.icon
        }" alt="Weather Icon" class="mx-auto w-16 h-16"/>
        <p class="text-sm">${translateCondition(day.day.condition.text)}</p>
        <p class="text-sm">Nhiệt độ: ${day.day.maxtemp_c}°C / ${
      day.day.mintemp_c
    }°C</p>
        <p class="text-sm">Khả năng mưa: ${day.day.daily_chance_of_rain}%</p>
      </div>
    `;
    forecastDays.innerHTML += forecastHTML;
  });
}

// Google Places API Autocomplete
function initAutocomplete() {
  const autocomplete = new google.maps.places.Autocomplete(cityInput, {
    types: ["(cities)"],
  });

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (place.geometry && place.formatted_address) {
      cityInput.value = place.formatted_address;
      autocompleteResults.classList.add("hidden");
    }
  });
}

// Handle form submission
weatherForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();
  if (!city) return alert("Vui lòng nhập tên thành phố!");

  loadingContainer.classList.remove("hidden");
  weatherContainer.classList.add("hidden");
  forecastContainer.classList.add("hidden");
  errorContainer.classList.add("hidden");

  try {
    const weatherData = await fetchWeather(city);
    displayWeather(weatherData);
    displayForecast(weatherData);
  } catch (error) {
    errorContainer.textContent =
      error.message || "Đã xảy ra lỗi. Vui lòng thử lại.";
    errorContainer.classList.remove("hidden");
    loadingContainer.classList.add("hidden");
  }
});

// Handle close button click
closeButton.addEventListener("click", () => {
  window.location.reload();
});

// Initialize Autocomplete on page load
window.onload = initAutocomplete;
// Handle close button click
closeButton.addEventListener("click", () => {
  // Đóng trang
  window.close();
});
