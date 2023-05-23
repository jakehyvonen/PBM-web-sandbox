import React, { useEffect, useState, useRef } from "react";
import "./styles.css";
import {io} from 'socket.io-client'
import _ from 'lodash'; // Import lodash for throttling
import PhaserGame from './components/PhaserGame/PhaserGame';

const App = () => {
  const [time, setTime] = useState('fetching')
  const [orientation, setOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 });  
  const socket = useRef(null);

  useEffect(()=>{
    socket.current = io(process.env.REACT_APP_NGROK_URL)
    socket.current.on('connect', ()=>console.log(socket.current.id))
    socket.current.on('connect_error', ()=>{
      setTimeout(()=>socket.current.connect(),5000)
    })
    socket.current.on('disconnect',()=>setTime('server disconnected'))

    // const handleOrientation = _.throttle((e) => {
    //   const { alpha, beta, gamma } = e;
    //   const roundedAlpha = parseFloat(alpha.toFixed(2));
    //   const roundedBeta = parseFloat(beta.toFixed(2));
    //   const roundedGamma = parseFloat(gamma.toFixed(2));
    //   setOrientation({ alpha: roundedAlpha, beta: roundedBeta, gamma: roundedGamma });
    //   socket.current.emit('deviceOrientation', { alpha: roundedAlpha, beta: roundedBeta, gamma: roundedGamma });
    // }, 1000);  // Emit the event at most once per second

    // window.addEventListener('deviceorientation', handleOrientation);
  
    // return () => {
    //   window.removeEventListener('deviceorientation', handleOrientation);
    // };
  }, []);

  return (
  <div id="container">
    <div id="phasergame">
      <PhaserGame></PhaserGame>
    </div>
  </div>
  );
}

export default App;

