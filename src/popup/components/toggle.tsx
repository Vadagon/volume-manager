import React, { useState, useEffect } from "react";
import { addAbortSignal } from "stream";
import {get, save} from "../../utils/storage";

function Toggle(props){

  const [on, turn] = useState(false);


  useEffect(() => {
    get(props.id, (e)=>{
      turn(!!e);
    })
  }, []);

  function change(){
    save(props.id, !on); 
    turn(!on); 
    if(props.id == 'darkmode') document.documentElement.classList.toggle('dark');
  }

    return (
        <div className="flex items-center justify-center">
  
  <label htmlFor={props.id} className="flex items-center cursor-pointer">
    <div className="relative">
      <input type="checkbox" id={props.id} className="sr-only" checked={on} onChange={change}/>
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