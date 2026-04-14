const { defineConfig } = require("cypress");
const allureWriter = require("@shelex/cypress-allure-plugin/writer");

const createBundler = require("@bahmutov/cypress-esbuild-preprocessor");
const addCucumberPreprocessorPlugin =
  require("@badeball/cypress-cucumber-preprocessor").addCucumberPreprocessorPlugin;
const createEsbuildPlugin =
  require("@badeball/cypress-cucumber-preprocessor/esbuild").createEsbuildPlugin;

module.exports = defineConfig({

  env: {
    TAGS: "@smoke or @regression"
  },

  e2e: {
    specPattern: "cypress/e2e/features/**/*.feature",
    setupNodeEvents(on, config) {
      allureWriter(on, config);
      addCucumberPreprocessorPlugin(on, config);

      on(
        "file:preprocessor",
        createBundler({
          plugins: [createEsbuildPlugin(config)],
        })
      );

      return config;
    },
  },

  reporter: "cypress-multi-reporters",
  reporterOptions: {
    reporterEnabled: "cucumber-html-reporter",
    cucumberHtmlReporterOptions: {
      theme: "bootstrap",
      jsonFile: "cypress/reports/cucumber-json/output.json",
      output: "cypress/reports/cucumber-report.html",
      reportSuiteAsScenarios: true,
      launchReport: false,
      metadata: {
        "Test Environment": "GitHub Actions",
        "Browser": "Chrome",
        "Executed": "GitHub CI/CD"
      }
    }
  }
});