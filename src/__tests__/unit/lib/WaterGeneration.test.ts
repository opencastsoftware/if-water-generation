import {WaterGeneration} from '../../../lib/water-generation/index';
//import {fetchPowerConsumption} from '../../../lib/water-generation/electricityMap';

import { jest } from '@jest/globals';

jest.mock('../../../lib/water-generation/electricityMap');

// Define types for input and config
interface Input {
  energy: number;
  geolocation: string;
}

interface Config {}

// Mock the WaterGeneration function
describe('WaterGeneration', () => {
  const waterGeneration = WaterGeneration({} as Config);

  describe('execute', () => {

    test('should throw error if input energy is invalid', async () => {
      const inputs: Input[] = [{ energy: 'test' as unknown as number, geolocation: '36.778259,-119.417931' }];
      const config: Config[] = [];
      await expect(waterGeneration.execute(inputs, config)).rejects.toThrow('energy must be a number');
    });

    test.each([
      ['36.778259'],
      ['36.778259,36.778259,-119.417931'],
      [''],
    ])('should throw error if input geolocation is invalid', async (coordinates) => {
      const inputs: Input[] = [{ energy: 10, geolocation: coordinates }];
      const config: Config[] = [];
      await expect(waterGeneration.execute(inputs, config)).rejects.toThrow(
        'not a comma-separated string consisting of `latitude` and `longitude`'
      );
    });

    // test('should return valid output if input is valid', async () => {
    //   fetchPowerConsumption.mockResolvedValue({ totalConsumption: 30, country: 'England' });
    //   const inputs: Input[] = [{ energy: 10, geolocation: '36.778259,-119.417931' }];
    //   const config: Config[] = [];
    //   const result = await waterGeneration.execute(inputs, config);
    //   expect(result[0]).toStrictEqual({
    //     country: 'England',
    //     energy: 10,
    //     geolocation: '36.778259,-119.417931',
    //     'water-power': 300,
    //   });
    // });
  });
});
