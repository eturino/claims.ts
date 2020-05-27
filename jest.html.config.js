const config = require("./jest.config");

module.exports = {
  ...config,
  coverageReporters: ["html"],
};
