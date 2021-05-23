import React, { useEffect } from "react";
// import Slider, { Range } from "rc-slider";
// import "rc-slider/assets/index.css";
import "./Popup.scss";
import "./main.scss";
import Home from "./pages/home";
import Settings from "./pages/settings";
import {save} from "../utils/storage";


interface IProps {}
interface IState {
  isToggleOn?: boolean;
}
export default class Popup extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = { isToggleOn: true };


    if (localStorage.darkmode  == 'true' || (!('darkmode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark')
      localStorage.darkmode = true;
      save('darkmode', true)
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.darkmode = false;
      save('darkmode', false)
    }
    // localStorage.theme = 'dark'

    // This binding is necessary to make `this` work in the callback
  }
  

  // useEffect(() => {
  //   // Example of how to send a message to eventPage.ts.
  //   chrome.runtime.sendMessage({ popupMounted: true });
  // }, []);
  render() {
    return (
      <div className="popupContainer p-2 bg-white dark:bg-gray-800 dark:text-white">
        <div className="flex flex-row items-center">
          <img
            className="w-10 mr-2"
            src="assets/images/icon128.png"
            alt="logo"
          />
          <span className="text-2xl flex-grow">Volume Controller</span>
          <span
            className={`cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 p-1 rounded ${
              !this.state.isToggleOn ? "bg-gray-200 dark:bg-gray-700" : ""
            }`}
            onClick={() =>
              this.setState((state) => ({ isToggleOn: !state.isToggleOn }))
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </div>

        {this.state.isToggleOn ? <Home /> : <Settings />}
      </div>
    );
  }
}

// chrome-extension://phkbmbggphffoaokdecppnbbbepojjfe/popup.html
