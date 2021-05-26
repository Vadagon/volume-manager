import React, { Component } from "react";
import Toggle from "../components/toggle";

function Settings() {
  return (
  <div className="mt-5">
    


    <label className="flex flex-row items-center text-base my-1 py-2 -mx-2 px-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 mb-0" htmlFor="darkmode">
      <span className="flex flex-grow">Dark Mode</span>
      <div>
        <Toggle id="darkmode"/>
      </div>
    </label>

    <label className="flex flex-row items-center text-base my-1 py-2 -mx-2 px-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 mb-0" htmlFor="fullscreen">
      <span className="flex flex-grow"><b className="text-gray-500 mr-3">Beta</b> Forced Full-screen View</span>
      <div>
        <Toggle id="fullscreen"/>
      </div>
    </label>

    <label className="flex flex-row items-center text-base my-1 py-2 -mx-2 px-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 mb-0" htmlFor="disabled">
      <span className="flex flex-grow">Mute all tabs by default</span>
      <div>
        <Toggle id="muteall"/>
      </div>
    </label>

    <label className="flex flex-row items-center text-base my-1 py-2 -mx-2 px-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 mb-0" htmlFor="disabled">
      <span className="flex flex-grow">Disable Extension</span>
      <div>
        <Toggle id="disabled"/>
      </div>
    </label>


    

    
    <p className="mt-4 text-center hover:underline text-base">
      <a href={`https://chrome.google.com/webstore/detail/${chrome.runtime.id}/review`} target="_blank">
        {/* Could you take a few seconds to ⭐️ my work? */}
        {/* Please, ⭐️ us. */}
        Please, rate us! - ⭐️⭐️⭐️⭐️⭐️
      </a>
    </p>
    {/* <p className="mt-5 text-center">
      Developed with ❤️ by <a href="#">VerbLike Studio</a>
    </p> */}
  </div>
  );
}

export default Settings;
