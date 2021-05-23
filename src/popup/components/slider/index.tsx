import React, { Component } from "react";
import Sliders, { Range } from "rc-slider";
import "rc-slider/assets/index.css";
import './slider.scss';


function Slider(propsss) {
  return (
    <Sliders
      {...propsss}
      trackStyle={{ backgroundColor: propsss.color, height: 5 }}
      handleStyle={{
        // borderColor: "#fff",
        borderWidth: 5,
        height: 28,
        width: 28,
        marginTop: -11.5,
        backgroundColor: propsss.color,
      }}
      railStyle={{ backgroundColor: "#777777", height: 5 }}
    />
  );
}

// class Slider extends Component<props> {

//   render() {
//     return ;
//     // return <input ref={this.myRef}  className={`rounded-lg appearance-none bg-yellow-100 h-1 `+ this.props.class} type="range" min="1" max="100" step="1" />

//     // return (
//     // <input
//     //     type="range"
//     //     min="10"                    // default 0
//     //     max="1000"                  // default 100
//     //     step="10"                   // default 1
//     //     value="300"                 // default min + (max-min)/2
//     //     data-orientation="vertical" // default horizontal
//     // />
//     //   );
//   }
// }
export default Slider;
