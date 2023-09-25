const _ = require("lodash");
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const { getChiaRoot } = require("chia-root-resolver");
require("dotenv").config();

/**
 * @file Manages the configuration for Core Registry.
 * @module core-registry-config
 */

/**
 * @typedef {object} Config
 */

class ConfigManager {
  /**
   * Create a new instance of ConfigManager
   * @param {object} defaultConfig - Default configuration object
   */
  constructor(namespace, defaultConfig) {
    if(!namespace) {
      throw new Error('namespace is required');
    }

    if(!defaultConfig) {
      throw new Error('defaultConfig is required');
    }

    this.defaultConfig = defaultConfig;
    this.chiaRoot = getChiaRoot();
    this.persistanceFolderPath = `${this.chiaRoot}/${namespace}`;
    this.configFilePath = path.resolve(
      `${this.persistanceFolderPath}/config.yaml`
    );
    this.config = this.getConfig();
  }

  /**
   * Recursively override configuration keys with environment variables.
   * @param {object} configObject - The configuration object
   * @param {string} parentKey - The parent key for nested objects
   */
  applyEnvOverrides(configObject, parentKey = "") {
    for (const key in configObject) {
      const fullKey = parentKey ? `${parentKey}_${key}` : key;
      if (typeof configObject[key] === "object" && configObject[key] !== null) {
        this.applyEnvOverrides(configObject[key], fullKey);
      } else if (process.env[fullKey] !== undefined) {
        console.log(`Overriding ${parentKey}.${key} from environment variable`);
        configObject[key] = process.env[fullKey];
      }
    }
  }

  /**
   * Load configuration from file or return default.
   * @private
   * @returns {Config} - Configuration object
   */
  getConfig() {
    try {
      if (!fs.existsSync(this.persistanceFolderPath)) {
        fs.mkdirSync(this.persistanceFolderPath, { recursive: true });
      }

      if (!fs.existsSync(this.configFilePath)) {
        fs.writeFileSync(
          this.configFilePath,
          yaml.dump(this.defaultConfig),
          "utf8"
        );
        return this.defaultConfig;
      }

      const existingConfig = yaml.load(
        fs.readFileSync(this.configFilePath, "utf8")
      );
      const mergedConfig = _.merge({}, this.defaultConfig, existingConfig);

      if (!_.isEqual(existingConfig, mergedConfig)) {
        fs.writeFileSync(this.configFilePath, yaml.dump(mergedConfig), "utf8");
      }

      this.applyEnvOverrides(mergedConfig);

      console.log("Loaded Config", mergedConfig);
      return mergedConfig;
    } catch (e) {
      console.log(`Config file not found at ${this.configFilePath}`, e);
      return this.defaultConfig;
    }
  }

  /**
   * Update the configuration file with new settings.
   * @param {object} updates - New settings
   */
  updateConfig(updates) {
    try {
      const updatedConfig = _.merge({}, this.config, updates);
      fs.writeFileSync(this.configFilePath, yaml.dump(updatedConfig), "utf8");
      this.config = this.getConfig();
    } catch (e) {
      console.log("Could not update config file", e);
    }
  }
}

module.exports = ConfigManager;
