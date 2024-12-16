const provinces = window.vietnamProvinces
  .getProvinces()
  .map((province) =>
    province.name.replace("Tỉnh", "").replace("Thành phố", "").trim()
  );
console.log("window.vietnamProvinces:", window.vietnamProvinces);

const API_KEY = "d7bac82c476a4aff996151609241212"; // Thay bằng API key từ WeatherAPI
const CURRENT_API_URL = "https://api.weatherapi.com/v1/current.json";
const FORECAST_API_URL = "https://api.weatherapi.com/v1/forecast.json";
const weatherForm = document.getElementById("weather-form");
const cityInput = document.getElementById("city-input");
const submitButton = document.querySelector("#submit-btn");
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

function removeVnSign(str) {
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  return str;
}

function partialSearch(query, dataset) {
  // Normalize the query
  const normalizedQuery = removeVnSign(query.trim().toLowerCase());

  // Search the dataset
  return dataset.filter((item) => {
    const normalizedItem = removeVnSign(item.toLowerCase());
    return normalizedItem.includes(normalizedQuery);
  });
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

const getWeatherData = async () => {
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
};

const handleSelectSearchValue = (el) => {
  const searchValue = removeVnSign(el.innerHTML?.trim());

  if (!cityInput || !searchValue) return;

  // set search input and remove autocomplete data to see weather data
  cityInput.value = searchValue;
  autocompleteResults.innerHTML = "";
  getWeatherData();
};

const searchProvinces = (e) => {
  const searchValue = e.target.value;

  // validate is existing autocompleteResults element
  if (!autocompleteResults) return;

  let searchResult = "";

  if (!searchValue) {
    autocompleteResults.innerHTML = searchResult;
    return;
  }

  const searchData = partialSearch(searchValue, provinces);

  searchData.forEach((province) => {
    searchResult += `<div onclick="handleSelectSearchValue(this)" class="px-3 py-2 cursor-pointer hover:bg-zinc-100 transition-all hover:font-medium">
      ${province}
    </div>`;
  });

  autocompleteResults.innerHTML = searchResult;
};

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

const clearAutocompleteResult = () => {
  // wait for click on element then clear data
  setTimeout(() => {
    autocompleteResults.innerHTML = "";
  }, 100);
};

// Handle form submission
weatherForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  autocompleteResults.innerHTML = "";
  await getWeatherData();
});

// Handle close button click
closeButton.addEventListener("click", () => {
  window.location.reload();
});

// Handle close button click
closeButton.addEventListener("click", () => {
  // Đóng trang
  window.close();
});

cityInput.addEventListener("input", searchProvinces);
cityInput.addEventListener("focus", searchProvinces);
cityInput.addEventListener("blur", clearAutocompleteResult);
