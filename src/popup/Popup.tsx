import React, { useEffect } from "react";
import "./Popup.scss";

export default function Popup() {
  useEffect(() => {
    // Example of how to send a message to eventPage.ts.
    chrome.runtime.sendMessage({ popupMounted: true });
  }, []);

  return (<div className="popupContainer">
  <span>Hello, world!</span>
  <br/>
  <p className="text-center">Lorem 12ipsum dolor sit amet ...</p>
  </div>);
}
