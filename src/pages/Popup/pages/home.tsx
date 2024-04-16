import React, { Component, useEffect } from 'react';
import Slider from '../components/slider';

import * as volume from '../volumeController';
import { currentLevel } from '../volumeController';

// interface IProps {}
// interface IState {
//   volume: number;
// }

function Home() {
  const [sliderValue, setSliderValue] = React.useState<number>(30);
  const [tabs, updateTabs] = React.useState<any[]>([]);
  const [OS, updateOS] = React.useState(false);
  const [currentTabFavicon, setCurrentTabFavicon] = React.useState(
    '/assets/images/file.png'
  );

  useEffect(() => {
    volume.init(() => {
      console.log(volume);
      var tabbs = [...volume.controlledTabs, ...volume.noizeTabs];
      // tabbs = tabbs.filter(e=>e.id != volume.curTab.id)
      updateTabs(tabbs);
      setSliderValue(volume.currentLevel);
      if (volume.OS == 'mac') updateOS(true);
      if (
        volume.curTab &&
        volume.curTab.favIconUrl &&
        volume.curTab.favIconUrl.length
      )
        setCurrentTabFavicon(volume.curTab.favIconUrl);
    });
  }, []);

  return (
    <div>
      <p className="mt-1">
        You can control volume of the current tab with the slider below or{' '}
        <span
          className="text-blue-500 cursor-pointer"
          onClick={() =>
            chrome.tabs.create({
              url: 'chrome://extensions/shortcuts',
              active: !0,
              selected: !0,
            })
          }
        >
          {OS ? '⌥' : 'Alt'} + ↓↑
        </span>
      </p>
      <div className="flex flex-row items-start my-5 mt-6 flex-wrap">
        <img className="w-10 z-10 pr-2" src={currentTabFavicon} alt="favicon" />
        <div className="flex flex-col flex-grow">
          <div className="px-2">
            <Slider
              max={100}
              defaultValue={100}
              // value={volume}
              value={sliderValue}
              step={5}
              color="#ff8a04"
              onChange={(e: any) => {
                setSliderValue(e);
                volume.changeCurrentVolume(e);
              }}
            />
          </div>
          <div className="flex flex-row pl-2 z-10">
            <span className="flex-grow">
              VOLUME: {Math.round(sliderValue)}%
            </span>
            <span className="w-20">
              BOOST:{' '}
              {sliderValue / 100 - 1 <= 0
                ? 0
                : Math.round(sliderValue) / 100 - 1}
              x
            </span>
          </div>
          <div className="flex flex-row">
            <div className="flex-grow"></div>
            <div className="w-20 px-2">
              <Slider
                max={700}
                min={100}
                step={50}
                value={sliderValue}
                onChange={(e: any) => {
                  setSliderValue(e);
                  volume.changeCurrentVolume(e);
                }}
                color="#ff1004"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        {tabs.length ? (
          <h2 className="text-base text-gray-400">
            Tabs playing audio right now
          </h2>
        ) : null}

        {tabs.map((e, n) => (
          <div
            key={n}
            className="flex flex-row items-center text-sm my-1 py-1 -mx-2 px-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 mb-0"
            onClick={() => {
              chrome.tabs.update(e.id, { active: true }, function (e: any) {
                chrome.windows.update(e.windowId, { focused: true });
              });
            }}
          >
            <img className="w-10 pr-2" src={e.favIconUrl} alt="favicon" />
            <span className="truncate">{e.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
export default Home;
