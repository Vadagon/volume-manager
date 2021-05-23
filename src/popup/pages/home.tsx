import React, { Component } from "react";
import Slider from "../components/slider";

// interface IProps {}
// interface IState {
//   volume: number;
// }

function Home() {
  const [volume, setVolume] = React.useState<number>(30);

  return (
    <div>
      <p className="mt-1">
        You can control volume of the current tab with the slider below or{" "}
        <a href="#">Alt + ↓↑</a>
      </p>

      <div className="flex flex-row items-start my-5 mt-6 flex-wrap">
        <img
          className="w-10 z-10 pr-2"
          src="assets/images/icon128.png"
          alt="favicon"
        />
        <div className="flex flex-col flex-grow">
          <div className="px-2">
            <Slider
              max={100}
              defaultValue={30}
              // value={volume}
              value={volume}
              step={5}
              color="#ff8a04"
              onChange={setVolume}
            />
          </div>
          <div className="flex flex-row pl-2 z-10">
            <span className="flex-grow">VOLUME: {volume}%</span>
            <span className="w-20">BOOST: {(volume/100-1) <= 0 ? 0 : (volume/100-1)}x</span>
          </div>
          <div className="flex flex-row">
            <div className="flex-grow"></div>
            <div className="w-20 px-2">
              <Slider
                max={600}
                min={100}
                step={50}
                value={volume}
                onChange={setVolume}
                color="#ff1004"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-base text-gray-400">
          Tabs playing audio right now
        </h2>
        <div className="flex flex-row items-center text-sm my-1 py-1 -mx-2 px-2 cursor-pointer hover:bg-gray-700 mb-0">
          <img
            className="w-10 pr-2"
            src="assets/images/icon128.png"
            alt="favicon"
          />
          <span>Name of the tab</span>
        </div>
      </div>
    </div>
  );
}
export default Home;
