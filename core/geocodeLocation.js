import axios from "axios";

export const geocodeLocation = async (placeName, cityName) => {
  try {
    const query = `${placeName}, ${cityName}, India`;

    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: query,
          format: "json",
          limit: 1
        },
        headers: {
          "User-Agent": "ride-with-guide-app"
        }
      }
    );

    if (response.data.length === 0) {
      return null;
    }

    return {
      lat: parseFloat(response.data[0].lat),
      lng: parseFloat(response.data[0].lon)
    };

  } catch (error) {
    console.log("Geocoding Error:", error.message);
    return null;
  }
};