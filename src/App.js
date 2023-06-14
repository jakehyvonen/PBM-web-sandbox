
import React, { useEffect } from "react";
import "./styles.css";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import PhaserGame from './components/PhaserGame/PhaserGame';

const App = () => {
  const handle = useFullScreenHandle();

  // useEffect(() => {
  //   // Lock the screen to landscape mode if the API exists
  //   // eslint-disable-next-line no-restricted-globals
  //   if (screen.orientation && screen.orientation.lock) {
  //     // eslint-disable-next-line no-restricted-globals
  //     screen.orientation.lock('landscape').catch(error => {
  //       console.log("Could not lock screen orientation:", error);
  //     });
  //   }
  // }, []);

  return (
    <div id="container">
      <button id="fsbutton" onClick={handle.enter}>
        Enter fullscreen
      </button>
      <FullScreen handle={handle}>
        <div id="phasergame">
          <PhaserGame></PhaserGame>
        </div>
      </FullScreen>
    </div>
  );
}

export default App;


// import React, { useEffect, useState, useRef } from "react";
// import "./styles.css";
// import { FullScreen, useFullScreenHandle } from "react-full-screen";
// import _ from 'lodash'; // Import lodash for throttling
// import PhaserGame from './components/PhaserGame/PhaserGame';

// const App = () => {
//   const handle = useFullScreenHandle();
 
//   return (
//     <div id="container">
//       <button id="fsbutton" onClick={handle.enter}>
//         Enter fullscreen
//       </button>
//       <FullScreen handle={handle}>
//         <div id="phasergame">
//           <PhaserGame></PhaserGame>
//         </div>
//       </FullScreen>
//     </div>
//   );
// }

// export default App;
