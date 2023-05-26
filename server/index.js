const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const cors = require("cors");
const path = require("path");
var converter = require('./input_converter');

// add middlewares
app.use(express.static(path.join(__dirname, "..", "build")));
app.use(express.static("public"));
app.use(cors({ origin: true, credentials: true }));

app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "..", "build", "index.html"));
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "DELETE, PUT, GET, POST");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

io.on('connection',(socket)=>{
  console.log('client connected: ',socket.id)
  converter.Begin_Session()
  // socket.on('deviceOrientation', (data) => {
  //   console.log('Received device orientation:', data);
  // });

  socket.on('disconnect',(reason)=>{
    console.log(reason)
  })


  socket.on('action_keydown', function (action_data)
  {
    console.log('got action_keydown: ' + action_data);
    converter.handle_action_keydown(action_data);
  });
  socket.on('keyboard_input', function (keyboard_data)
  {
    console.log('got keyboard_data: ' + keyboard_data);
    converter.handle_keyboard_data(keyboard_data);
  });
  socket.on('joystick_input', function(joystick_data)
  {
    console.log('got joystick_data: ' + joystick_data);
    converter.handle_joystick_data(joystick_data);
  });
  
  socket.on('device_orientation', function(device_orientation_data)
  {
    console.log('got device_orientation_data: ' + device_orientation_data);
    converter.handle_device_orientation_data(device_orientation_data);
  });

})


setInterval(()=>{
  io.to('clock-room').emit('time',new Date())
},1000)

// start express server on port 5000
server.listen(5000, () => {
  console.log("server started on port 5000");
});