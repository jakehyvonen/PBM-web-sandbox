const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const cors = require("cors");
const path = require("path");

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
  socket.join('clock-room')
  socket.on('disconnect',(reason)=>{
    console.log(reason)
  })
})

setInterval(()=>{
  io.to('clock-room').emit('time',new Date())
},1000)

// start express server on port 5000
server.listen(5000, () => {
  console.log("server started on port 5000");
});