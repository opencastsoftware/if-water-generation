import axios from 'axios';
//import { fetchPowerConsumption } from '../water-generation/electricityMap';
import {fetchPowerConsumption} from '../../../lib/water-generation/electricityMap';

// Mock axios for HTTP requests
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('fetchPowerConsumption', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mock history after each test
  });

  test('should return valid power consumption data for valid coordinates', async () => {
    // Mocking a valid API response
    const mockApiResponse = {
      status: 200,
      data: {
        zone: 'US-CAL',
        history: [
          {
            createdAt: '2023-10-11T00:00:00Z',
            powerConsumptionBreakdown: {
              biomass: 20,
              solar: 30,
              wind: 50,
            },
          },
        ],
      },
    };

    // Mock the axios GET request
    mockedAxios.get.mockResolvedValue(mockApiResponse);

    const latitude = 36.778259;
    const longitude = -119.417931;

    // Invoke the function
    const result = await fetchPowerConsumption(latitude, longitude);

    expect(result).toStrictEqual({
      totalConsumption: 100, // 20 + 30 + 50
      country: 'United States',
    });
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `https://api.electricitymap.org/v3/power-breakdown/history?lat=${latitude}&lon=${longitude}`
    );
  });

  test('should return null if API returns non-200 status', async () => {
    // Mocking a non-200 response
    mockedAxios.get.mockResolvedValue({
      status: 404,
      data: {},
    });

    const latitude = 36.778259;
    const longitude = -119.417931;

    const result = await fetchPowerConsumption(latitude, longitude);

    expect(result).toBeNull();
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  test('should return null if axios throws an error', async () => {
    // Mocking an error thrown by axios
    mockedAxios.get.mockRejectedValue(new Error('Network Error'));

    const latitude = 36.778259;
    const longitude = -119.417931;

    const result = await fetchPowerConsumption(latitude, longitude);

    expect(result).toBeNull();
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  test('should return zero consumption if powerConsumptionBreakdown is missing', async () => {
    // Mocking a response with missing powerConsumptionBreakdown
    const mockApiResponse = {
      status: 200,
      data: {
        zone: 'US-CAL',
        history: [
          {
            createdAt: '2023-10-11T00:00:00Z',
          },
        ],
      },
    };

    mockedAxios.get.mockResolvedValue(mockApiResponse);

    const latitude = 36.778259;
    const longitude = -119.417931;

    const result = await fetchPowerConsumption(latitude, longitude);

    expect(result).toStrictEqual({
      totalConsumption: 0,
      country: 'United States',
    });
  });
});
