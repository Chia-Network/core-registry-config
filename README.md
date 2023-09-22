# node-template
Template repo for NodeJS-based projects

example usage

```javascript
const defaultConfig = require("./defaultConfig.json");
const configManager = new ConfigManager(defaultConfig);

const CONFIG = configManager.getConfig();
```