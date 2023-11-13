# Core Registry Config
[npm package](https://www.npmjs.com/package/@chia-carbon/core-registry-config) used for configuring Core Registry applications. 

### Example usage

```javascript
const defaultConfig = require("./defaultConfig.json");
const configManager = new ConfigManager(defaultConfig);

const CONFIG = configManager.getConfig();
```
