import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./styles.css";
import {io} from 'socket.io-client'
import _ from 'lodash'; // Import lodash for throttling

const App = () => {
  const [time, setTime] = useState('fetching')
  const [orientation, setOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 });  
  const socket = useRef(null);

  useEffect(()=>{
    socket.current = io('https://5863-154-6-81-27.ngrok-free.app')
    socket.current.on('connect', ()=>console.log(socket.current.id))
    socket.current.on('connect_error', ()=>{
      setTimeout(()=>socket.current.connect(),5000)
    })
    socket.current.on('time', (data)=>setTime(data))
    socket.current.on('disconnect',()=>setTime('server disconnected'))

    const handleOrientation = _.throttle((e) => {
      const { alpha, beta, gamma } = e;
      const roundedAlpha = parseFloat(alpha.toFixed(2));
      const roundedBeta = parseFloat(beta.toFixed(2));
      const roundedGamma = parseFloat(gamma.toFixed(2));
      setOrientation({ alpha: roundedAlpha, beta: roundedBeta, gamma: roundedGamma });
      socket.current.emit('deviceOrientation', { alpha: roundedAlpha, beta: roundedBeta, gamma: roundedGamma });
    }, 1000);  // Emit the event at most once per second

    window.addEventListener('deviceorientation', handleOrientation);
  
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  return (
    <div className="App">
      {time}
      <p>Device orientation: {JSON.stringify(orientation)}</p>
      <button>
        words
      </button>  
    </div>
  );
}

export default App;


// import React from "react";
// import axios from "axios";
// import "./styles.css";
// import {io} from 'socket.io-client'

// const App = () => {
//   const [time, setTime] = React.useState('fetching')
//   const [orientation, setOrientation] = React.useState({ alpha: 0, beta: 0, gamma: 0 });  
//   const socket = React.useRef(null);  // Use a ref to keep the same socket instance across renders

//   React.useEffect(()=>{
//     socket.current = io('https://5863-154-6-81-27.ngrok-free.app')
//     socket.current.on('connect', ()=>console.log(socket.current.id))
//     socket.current.on('connect_error', ()=>{
//       setTimeout(()=>socket.current.connect(),5000)
//     })
//     socket.current.on('time', (data)=>setTime(data))
//     socket.current.on('disconnect',()=>setTime('server disconnected'))
//   }, []);

//   const handleOrientation = (e) => {
//     const { alpha, beta, gamma } = e;
//     setOrientation({ alpha, beta, gamma });
//     socket.current.emit('deviceOrientation', { alpha, beta, gamma });
//   };

//   const requestPermissions = () => {
//     if (typeof DeviceOrientationEvent.requestPermission === 'function') {
//       DeviceOrientationEvent.requestPermission()
//         .then(permissionState => {
//           if (permissionState === 'granted') {
//             console.log('permission granted')
//             window.addEventListener('deviceorientation', handleOrientation);
//           }
//         })
//         .catch(console.error);
//     } else {
//       console.log('not iOS 13+ device, not asking for permission')
//       window.addEventListener('deviceorientation', handleOrientation);
//     }
//   };

//   React.useEffect(() => {
//     return () => {
//       window.removeEventListener('deviceorientation', handleOrientation);
//     };
//   }, []);

//   return (
//     <div className="App">
//       {time}
//       <p>Device orientation: {JSON.stringify(orientation)}</p>
//       <button onClick={requestPermissions}>
//         Request Permissions
//       </button>  

//     </div>
//   );
// }

// export default App
