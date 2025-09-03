/**
 * Weather service for fetching current weather data
 * Uses OpenWeatherMap API (free tier)
 */

const API_KEY = 'demo_key'; // In production, this should be in environment variables
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Mock weather data for development/demo purposes
const MOCK_WEATHER_DATA = {
  temperature: 22,
  condition: 'Partly Cloudy',
  description: 'Partly cloudy with some sun',
  icon: '⛅',
  humidity: 65,
  windSpeed: 12,
  forecast: {
    hourly: [
      { time: '12:00', temp: 22, rainChance: 10, icon: '⛅' },
      { time: '15:00', temp: 24, rainChance: 5, icon: '☀️' },
      { time: '18:00', temp: 21, rainChance: 20, icon: '⛅' },
      { time: '21:00', temp: 18, rainChance: 15, icon: '🌙' }
    ],
    tomorrow: {
      high: 26,
      low: 16,
      condition: 'Sunny',
      rainChance: 5,
      icon: '☀️'
    }
  }
};

/**
 * Get current weather for a location
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Weather data
 */
export async function getCurrentWeather(lat = null, lon = null) {
  try {
    // For demo purposes, return mock data
    // In production, you would use the actual API:
    /*
    const response = await fetch(
      `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error('Weather data unavailable');
    }
    
    const data = await response.json();
    
    return {
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main,
      description: data.weather[0].description,
      icon: getWeatherIcon(data.weather[0].icon),
      humidity: data.main.humidity,
      windSpeed: data.wind.speed
    };
    */
    
    // Return mock data for now
    return MOCK_WEATHER_DATA;
  } catch (error) {
    console.error('Error fetching weather:', error);
    return MOCK_WEATHER_DATA; // Fallback to mock data
  }
}

/**
 * Get weather icon based on OpenWeatherMap icon code
 * @param {string} iconCode - Icon code from API
 * @returns {string} Emoji representation
 */
function getWeatherIcon(iconCode) {
  const iconMap = {
    '01d': '☀️', // clear sky day
    '01n': '🌙', // clear sky night
    '02d': '⛅', // few clouds day
    '02n': '☁️', // few clouds night
    '03d': '☁️', // scattered clouds
    '03n': '☁️',
    '04d': '☁️', // broken clouds
    '04n': '☁️',
    '09d': '🌧️', // shower rain
    '09n': '🌧️',
    '10d': '🌦️', // rain day
    '10n': '🌧️', // rain night
    '11d': '⛈️', // thunderstorm
    '11n': '⛈️',
    '13d': '❄️', // snow
    '13n': '❄️',
    '50d': '🌫️', // mist
    '50n': '🌫️'
  };
  
  return iconMap[iconCode] || '🌤️';
}

/**
 * Get weather-based background gradient
 * @param {Object} weather - Weather data
 * @returns {string} CSS gradient string
 */
export function getWeatherGradient(weather) {
  const condition = weather.condition.toLowerCase();
  const temp = weather.temperature;
  
  if (condition.includes('sunny') || condition.includes('clear')) {
    return 'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)'; // Warm sunny gradient
  } else if (condition.includes('cloudy') || condition.includes('overcast')) {
    return 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)'; // Cloudy gradient
  } else if (condition.includes('rain')) {
    return 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)'; // Rainy gradient
  } else if (condition.includes('snow')) {
    return 'linear-gradient(135deg, #ddd6fe 0%, #8b5cf6 100%)'; // Snowy gradient
  } else if (temp < 10) {
    return 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'; // Cold gradient
  } else if (temp > 25) {
    return 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'; // Hot gradient
  } else {
    return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'; // Default gradient
  }
}

/**
 * Get weather-based clothing recommendations
 * @param {Object} weather - Weather data
 * @returns {Array} Array of clothing recommendations
 */
export function getWeatherRecommendations(weather) {
  const temp = weather.temperature;
  const condition = weather.condition.toLowerCase();
  
  const recommendations = [];
  
  if (temp < 10) {
    recommendations.push('Heavy jacket', 'Warm layers', 'Gloves');
  } else if (temp < 20) {
    recommendations.push('Light jacket', 'Long sleeves');
  } else if (temp > 25) {
    recommendations.push('Light clothing', 'Shorts', 'T-shirt');
  }
  
  if (condition.includes('rain')) {
    recommendations.push('Rain jacket', 'Waterproof shoes');
  }
  
  if (condition.includes('snow')) {
    recommendations.push('Winter boots', 'Warm hat');
  }
  
  return recommendations;
}
