// Importing the `fetchPowerConsumption` function from the 'electricityMap' module
import { fetchPowerConsumption } from '../water-generation/electricityMap';

// Define types for the input, output, and consumption result
interface Input {
  energy: number;
  geolocation: string; // Should be a comma-separated string of latitude, longitude
}

interface Config {
  // Define other global config options if needed
}

interface ConsumptionResult {
  totalConsumption: number;
  country: string;
}

interface Output extends Input {
  'water-power': number;
  country: string;
}

// WaterGeneration function in TypeScript
const WaterGeneration = (globalConfig: Config) => {
  const metadata = {
    kind: 'execute',
  };

  // Validate the input object
  const validateInput = (input: Input): Input => {
    if (typeof input.energy !== 'number') {
      throw new Error('energy must be a number');
    }

    const regex = new RegExp('^\\-?\\d{1,3}\\.\\d+,-?\\d{1,3}\\.\\d+$');

    if (!regex.test(input.geolocation)) {
      throw new Error('geolocation must be a comma-separated string consisting of `latitude` and `longitude`');
    }

    return input;
  };

  // Main execution logic
  const execute = async (inputs: Input[], config: Config): Promise<Output[]> => {
    const result: Output[] = [];

    for (let i = 0; i < inputs.length; i++) {
      const safeInput = validateInput(inputs[i]);

      const energy = safeInput.energy;
      const [latitude, longitude] = safeInput.geolocation.split(',').map(Number); // Convert strings to numbers
      const consumptionResult = await fetchPowerConsumption(latitude, longitude);
      if (consumptionResult === null) {
        throw new Error("Failed to fetch power consumption data");
      }
      const waterConsumption = energy * consumptionResult.totalConsumption;

      result[i] = {
        ...safeInput,
        'water-power': waterConsumption,
        country: consumptionResult.country,
      };
    }

    return result;
  };

  return {
    metadata,
    execute,
  };
};

// Export the WaterGeneration function
export { WaterGeneration };
