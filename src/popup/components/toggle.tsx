import React, { Component } from "react";

function Toggle(props){
    return (
        <div className="flex items-center justify-center">
  
  <label htmlFor={props.id} className="flex items-center cursor-pointer">
    <div className="relative">
      <input type="checkbox" id={props.id} className="sr-only" />
      <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
      <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${props.id}`}></div>
    </div>
    {/* <div className="ml-3 text-gray-700 font-medium">
      Toggle Me!
    </div> */}
  </label>

</div>
    );
}
export default Toggle;