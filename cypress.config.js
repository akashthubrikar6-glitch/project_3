const { defineConfig } = require("cypress");

const createBundler = require("@bahmutov/cypress-esbuild-preprocessor");
const addCucumberPreprocessorPlugin =
  require("@badeball/cypress-cucumber-preprocessor").addCucumberPreprocessorPlugin;
const createEsbuildPlugin =
  require("@badeball/cypress-cucumber-preprocessor/esbuild").createEsbuildPlugin;

module.exports = defineConfig({

  // ❌ reporter aani reporterOptions REMOVE kela - Cucumber sobat conflict hoto

  env: {
    TAGS: "@smoke or @regression"
  },

  e2e: {
    specPattern: "cypress/e2e/features/**/*.feature",

    async setupNodeEvents(on, config) {

      // ❌ mochawesome plugin pan REMOVE kara
      // require("cypress-mochawesome-reporter/plugin")(on);

      await addCucumberPreprocessorPlugin(on, config);

      on(
        "file:preprocessor",
        createBundler({
          plugins: [createEsbuildPlugin(config)],
        })
      );

      return config;
    },
  },
});