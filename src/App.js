
import React, { useState } from "react";
import "./styles.css";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import PhaserGame from './components/PhaserGame/PhaserGame';
import 'bootstrap/dist/css/bootstrap.min.css';



const App = () => {
  const handle = useFullScreenHandle();

  // State variable to keep track of orientation permission
  const [hasOrientationPermission, setHasOrientationPermission] = useState(false);

  const requestDeviceOrientation = () => {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
          DeviceOrientationEvent.requestPermission()
              .then(permissionState => {
                  if (permissionState === 'granted') {
                      setHasOrientationPermission(true); // Update state variable when permission is granted
                      window.addEventListener('deviceorientation', (event) => {
                          console.log(`Alpha: ${event.alpha}, Beta: ${event.beta}, Gamma: ${event.gamma}`);
                      });
                  }
              })
              .catch(console.error);
      } 
      else if(isNotAppleDevice()) {
        setHasOrientationPermission(true); // Update state variable when permission is granted

      }else {
          console.log("Device Orientation is not supported");
      }
  }

  return (
      <div id="container">
          {hasOrientationPermission ? (
              <FullScreen handle={handle}>
                  <div id="phasergame">
                      <PhaserGame></PhaserGame>
                  </div>
              </FullScreen>
          ) : (

          <div id="stackPanel">
            <div>Please lock screen rotation </div>
            <button id="beginButton" onClick={requestDeviceOrientation}>Begin Painting</button>
          </div>

            )}
      </div>
  );
}


function isNotAppleDevice() {
    const userAgent = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
      return false;
    } else {
      return true;
    }
  }
  

export default App;


// const App = () => {
//   const handle = useFullScreenHandle();

//   return (
//     <div id="container">
//       {/* <button id="fsbutton" onClick={handle.enter}>
//         Enter fullscreen
//       </button> */}
//       <FullScreen handle={handle}>
//         <div id="phasergame">
//           <PhaserGame></PhaserGame>
//         </div>
//       </FullScreen>
//     </div>
//   );
// }