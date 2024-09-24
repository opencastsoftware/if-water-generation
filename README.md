# if-water-cloud

![MIT License](https://img.shields.io/badge/license-MIT-brightgreen)

## Overview
An IF plugin for calculating the water consumption for power generation. It currently uses the energy consumed multiplied by the amount of hydro powered electricity using Electricity Maps API.

## Usage
To run the plugin, you must first create an instance of `water-generation`. Then, you can call the `execute()`.

```javascript
const { fetchPowerConsumption } = require('./electricityMap');

const WaterGeneration = (globalConfig) => {
  const metadata = {
    kind: "execute",
  };

  const execute = async (inputs, config) => {
    var result = [];

    for(i=0; i<inputs.length; i++){
      var energy = inputs[i].energy;
      const [latitude, longitude] = inputs[i].geolocation.split(',');
      const consumptionResult = await fetchPowerConsumption(latitude, longitude);
      var waterConsumption = energy * consumptionResult.totalConsumption;

      result[i] = {
        ...inputs[i],
        ["water-power"]: waterConsumption,
        ["country"]: consumptionResult.country
      }
    }

    return result;
  };

  return {
    metadata,
    execute,
  };
};

exports.WaterGeneration = WaterGeneration;
```

You can run this example by saving it as `./examples/manifests/water-generation.yml` and executing the following command from the project root:

```sh
npm link water-generation
ie --manifest ./examples/manifests/water-generation/water-generation.yml --output ./examples/outputs/water-generation.yml
```

The results will be saved to a new `yaml` file in `./examples/outputs`

## Global Config

Not required.

## Input Parameters

- `energy`: energy used. (kWh)
- `geolocation`: the geolocation of the country. (lat,long)

## Error Handling
Throws an exception if energy is not a number and if geolocation is not a valid latitude and logitude number.

## Plugin Algorithm
```pseudocode
output = energy * consumptionResult.totalConsumption;
```

## Returns

- `water-power`: the amount of hydro power used.
- `country`: the name of the country.

```yaml
name: water-generation manifest
description: example impl invoking water-generation plugin
tags:
initialize:
  plugins:
    water-generation:
      method: WaterGeneration
      path: 'water-generation'
      global-config:
        keep-exisiting: true
tree:
  pipeline:
    - water-generation
  config:
    water-generation:
  inputs:
    - timestamp: 2024-04-01T00:00 
      duration: 100
      energy: 10
      geolocation: 36.778259,-119.417931
    - timestamp: 2024-04-01T00:00 
      duration: 200
      energy: 20
      geolocation: 36.778259,-119.417931
    - timestamp: 2024-04-01T00:00 
      duration: 300
      energy: 30
      geolocation: 36.778259,-119.417931
```

Example outputs:

```yaml
  outputs:
    - timestamp: 2024-04-01T00:00
      duration: 100
      energy: 10
      geolocation: 36.778259,-119.417931
      water-power: 400
      country: USA
    - timestamp: 2024-04-01T00:00
      duration: 200
      energy: 20
      geolocation: 36.778259,-119.417931
      water-power: 400
      country: USA
    - timestamp: 2024-04-01T00:00
      duration: 300
      energy: 30
      geolocation: 36.778259,-119.417931
      water-power: 400
      country: USA
```

## License
The MIT License (MIT)

Copyright (c) 2015 Chris Kibble

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.