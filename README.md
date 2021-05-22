# Chrome Extension (built with TypeScript + React) with Live Reload

> This project is a boilerplate project to allow you to quickly build chrome extensions using TypeScript and React.

## Building

1.  Clone repo
2.  `npm i`
3.  `npm run dev` to compile once or `npm start` to run the dev task in watch mode
4.  `npm run build` to build a production (minified) version

## Installation

1.  Complete the steps to build the project above
2.  Go to [_chrome://extensions_](chrome://extensions) in Google Chrome
3.  With the developer mode checkbox ticked, click **Load unpacked extension...** and select the _dist_ folder from this repo


## Hot Reload functionality

To let popup and window reload automatically insert this code
`
import hotreload from '../utils/hotreload'; hotreload();
`

Backgroud and Content hot reload working bcs of https://www.npmjs.com/package/webpack-chrome-extension-reloader