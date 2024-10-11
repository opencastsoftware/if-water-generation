import axios from 'axios';
import * as fs from 'fs';



interface PowerBreakdownHistory {
  zone: string;
  history: Array<{
    createdAt: string;
    powerConsumptionBreakdown: {
      [key: string]: number;
    };
  }>;
}

interface ConsumptionResult {
  totalConsumption: number;
  country: string;
}


async function fetchPowerConsumption(latitude: number, longitude: number): Promise<ConsumptionResult | null> {
  const base_url = `https://api.electricitymap.org/v3/power-breakdown/history?lat=${latitude}&lon=${longitude}`;

  try {
    const response = await axios.get(base_url);
    if (response.status === 200) {
      const total_consumption = getPowerConsumption(response.data);
      const country = getCountry(response.data.zone);
      return { totalConsumption: total_consumption, country };
    } else {
      console.log("Failed to retrieve data. Status code:", response.status);
      return null;
    }
  } catch (error) {
    console.log("Error:", error);
    return null;
  }
}


// Function to calculate total power consumption from the breakdown
function getPowerConsumption(data: PowerBreakdownHistory): number {
  const zone = data.zone;
  const history = data.history[0];
  const created_at = history.createdAt;
  const breakdown = history.powerConsumptionBreakdown;
  const created_at_datetime = new Date(created_at);
  const created_at_readable = created_at_datetime
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  // Calculate total consumption
  let total_consumption = Object.values(breakdown).reduce(
    (sum, value) => sum + value,
    0
  );

  // Process breakdown and make necessary modifications
  const rows_to_add = Object.entries(breakdown).map(([source, value]) => {
    return {
      zone: zone,
      created: created_at_readable,
      energy_source: source === 'biomass' ? 'biofuel' : source === 'geothermal' ? 'other_renewable_exc_biofuel' : source,
      value: value,
    };
  });

  // Filter out unwanted energy sources
  const filteredArray = rows_to_add.filter(
    (x) =>
      x.energy_source !== "hydro" &&
      x.energy_source !== "hydro discharge" &&
      x.energy_source !== "battery discharge" &&
      x.energy_source !== "unknown"
  );

  // Recalculate total consumption based on filtered data
  total_consumption = filteredArray.reduce((sum, value) => sum + value.value, 0);

  return total_consumption;
}

// Function to get country based on the zone
function getCountry(zone: string): string {
  const jsonData = fs.readFileSync('src/lib/water-generation/data/zone-country.json', 'utf8');
  const data = JSON.parse(jsonData);

  return data[zone]["countryName"];
}

export { fetchPowerConsumption };
