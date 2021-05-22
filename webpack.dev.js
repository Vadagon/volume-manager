const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const ChromeExtensionReloader  = require('webpack-chrome-extension-reloader');

module.exports = merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  watch: true,
  entry: {
      'content-script': './src/content/main.ts',
      background: './src/background/main.ts'
  },
  //...
  plugins: [
      new ChromeExtensionReloader({
        // port: 9090, // Which port use to create the server
        reloadPage: true, // Force the reload of the page also
        entries: { // The entries used for the content/background scripts
          contentScript: 'content-script', // Use the entry names, not the file name or the path
          background: 'background' // *REQUIRED
        }
      })
  ]
});
