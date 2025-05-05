import axios from "axios";
import { configDotenv } from "dotenv";

configDotenv();

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

export const getWeather = async (req, res) => {
  try {
    const weather = await axios.get(
      `http://api.weatherapi.com/v1/forecast.json`,
      {
        params: {
          q: `14.4613,120.9658`,
          key: WEATHER_API_KEY,
          days: 3,
        },
      }
    );

    // CURRENT WEATHER (TEMPERATURE, WIND, CONDITION)
    const {
      temp_c,
      wind_kph,
      condition: { text },
    } = weather.data.current;

    // CURRENT WEATHER (HIGH AND LOW TEMPERATURE)
    const { maxtemp_c, mintemp_c } = weather.data.forecast.forecastday[0].day;

    // CURRENT WEATHER (HOURLY FORECAST)
    const hourlyData = weather.data.forecast.forecastday[0].hour;

    const hourlyWeather = hourlyData.map((hour) => {
      const time = new Date(hour.time_epoch * 1000);

      const formattedTime = time.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      return {
        time: formattedTime,
        temperature: hour.temp_c,
        condition: hour.condition.text,
      };
    });

    // 2 DAYS FORECAST (DATE, HIGH AND LOW TEMPERATURE)

    const {
      maxtemp_c: maxtemp_tomorrow,
      mintemp_c: mintemp_tomorrow,
      condition: { text: condition_tomorrow },
    } = weather.data.forecast.forecastday[1].day;

    const {
      maxtemp_c: maxtemp_dayAfterTomorrow,
      mintemp_c: mintemp_dayAfterTomorrow,
      condition: { text: condition_dayAfterTomorrow },
    } = weather.data.forecast.forecastday[2].day;

    return res.json({
      currenttemp: temp_c,
      currentwind: wind_kph,
      currentcondition: text,
      currenthigh: maxtemp_c,
      currentlow: mintemp_c,
      hourlyForecast: hourlyWeather,
      tomorrow: {
        high: maxtemp_tomorrow,
        low: mintemp_tomorrow,
        condition: condition_tomorrow,
      },
      dayAfterTomorrow: {
        high: maxtemp_dayAfterTomorrow,
        low: mintemp_dayAfterTomorrow,
        condition: condition_dayAfterTomorrow,
      },
    });
  } catch (error) {
    console.error("Error fetching weather data:", error.message || error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
