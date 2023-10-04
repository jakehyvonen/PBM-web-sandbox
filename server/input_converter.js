/**
 * Translates data from client processes into messages
 * for IPC that comply with ERAS command syntax
 */

util = require('util');
net = require('net');
const PBM_enums = require('./enums.json');
const ERAS_actions = PBM_enums.ERAS_Action;
const socket = require('./socket')
const io = socket.getIO();

io.on('connection', (socket) => {
    console.log('ting works');
})

const jog_vectors = {
    "plus_u":[1, 0, 0.0, 0.0, 0.0],
    "minus_u":[-1, 0, 0.0, 0.0, 0.0],
    "plus_v":[0, 1, 0.0, 0.0, 0.0],
    "minus_v":[0, -1, 0.0, 0.0, 0.0],
    "plus_x":[0, 0, 1.0, 0.0, 0.0],
    "minus_x":[0, 0, -1.0, 0.0, 0.0],
    "plus_y":[0, 0, 0.0, 1.0, 0.0],
    "minus_y":[0, 0, 0.0, -1.0, 0.0],
    "plus_z":[0, 0, 0.0, 0.0, 1.0],
    "minus_z":[0, 0, 0.0, 0.0, -1.0],
}

function add_vectors(vec_A, vec_B)
{
    var vec_C = [];
    for(let i = 0; i<vec_A.length; i++)
    {
        console.log('vec_A[i]: ' + vec_A[i]);
        console.log('vec_B[i]: ' + vec_B[i]);
        var to_add = vec_A[i] + vec_B[i];
        vec_C = vec_C.concat(to_add);
    }
    for(let i = 0; i<vec_C.length; i++)
    {
        console.log('vec_C[i]: ' + vec_C[i]);
    }
    return vec_C;
}

const keyboard_jog_dict = {
    "A":jog_vectors['plus_u'],
    "D":jog_vectors['minus_u'],
    "S":jog_vectors['plus_v'],
    "W":jog_vectors['minus_v'],
    "DOWN":jog_vectors['plus_x'],
    "UP":jog_vectors['minus_x'],
    "RIGHT":jog_vectors['plus_y'],
    "LEFT":jog_vectors['minus_y'],
    // "E":jog_vectors['plus_z'], no longer jogging rotation
    // "Q":jog_vectors['minus_z'],
};

//TODO be able to record multiple motifs in a run
const keyboard_action_dict = {
    "B":ERAS_actions.Begin_Run,
    "N":ERAS_actions.End_Run,
    "H":ERAS_actions.Home_Syringe,
    "J":ERAS_actions.Swap_Next_Syringe,
    "K":ERAS_actions.Swap_Previous_Syringe,
    "L":ERAS_actions.Unload_Syringe,
    "P":ERAS_actions.Power_Off,
    "R":ERAS_actions.Replay_Motif,
    "T":ERAS_actions.Replay_Run,
    "E":ERAS_actions.Toggle_Rotation_CW,
    "Q":ERAS_actions.Toggle_Rotation_CCW,
    "SPACE":ERAS_actions.Toggle_Dispense,
    "V":ERAS_actions.Toggle_Withdraw,
    "X":ERAS_actions.Substrate_Neutral,
    "G":ERAS_actions.Syringe_CNC_Mid,
    "0":ERAS_actions.Swap_Syringe,
    "1":ERAS_actions.Swap_Syringe,
    "2":ERAS_actions.Swap_Syringe,
    "3":ERAS_actions.Swap_Syringe,
    //"4":ERAS_actions.Swap_Syringe,
    //"5":ERAS_actions.Swap_Syringe,
    //"6":ERAS_actions.Swap_Syringe,
};

const action_dict_keys = Object.keys(keyboard_action_dict);
const jog_dict_keys = Object.keys(keyboard_jog_dict);

const tcp_server = net.createServer((callback_socket) => {
    console.log('Client connected:', callback_socket.remoteAddress, callback_socket.remotePort);
  
    callback_socket.on('data', (data) => {
      const message = data.toString().trim();
      console.log('Received message:', message);
      if (message.includes('finished')){
        console.log('emitting to listeners via socketio');
        const updatedMessage = message.substring(9);
        io.emit('finished',updatedMessage);
      }
      if (message.includes('syringe')){
        let parts = message.split(":"); // split the string by ':'
        let number = parseInt(parts[1].trim(), 10); // parse the second part to an integer
        console.log('emitting syringe number: ', number)
        io.emit('syringe', number);
      }
  
      // Send a response back to the Python client
    //   const response = 'This is a response from Node.js';
    //   callback_socket.write(response);
    callback_socket.end()
    });
  
    callback_socket.on('end', () => {
      console.log('Client disconnected:', callback_socket.remoteAddress, callback_socket.remotePort);
    });
  
    callback_socket.on('error', (error) => {
      console.error('callback_socket error:', error);
    });
  });

tcp_server.on('error', (err) => {
    console.error('TCP server error:', err);
});


const tcp_listen_port = 5676; // Port number to listen on
tcp_server.listen(tcp_listen_port, () => {
    console.log('TCP server listening on port', tcp_listen_port);
});

let hasLoggedECONNREFUSED = false; // flag to indicate if we've already logged this error

const send_tcp_msg = message => {
    return new Promise((resolve, reject) => {
        let socket = net.connect({host: '127.0.0.1', port: 5623});

        socket.on('connect', () => {
            hasLoggedECONNREFUSED = false; // Reset flag on successful connection
            resolve(socket);
        });

        socket.on('error', (err) => {
            if (err.code === 'ECONNREFUSED') {
                if (!hasLoggedECONNREFUSED) {
                    console.error('TCP client error:', err.message);
                    hasLoggedECONNREFUSED = true; // Set the flag to true so we don't log again
                }
            } else {
                console.error('TCP client error:', err.message); // Log other errors as usual
            }
            reject(err);
        });

        socket.on('data', (data) => {
            socket.end();
        });
    }).then(socket => {
        console.log('send_tcp_msg: ' + message);
        socket.write(message);
    }).catch(err => {
        // Handle the error here if needed
    });
}

function handle_joystick_data(joystick_data)
{
    //we receive data almost in the way we need with | delimiters
    //we're always going to be sending a Jog_All command:
    var command = ERAS_actions.Jog_All;
    command += ',' + joystick_data;
    console.log('sending command from joystick: ' + command);
    send_tcp_msg(command);

}

function handle_ERAS_action(action_data)
{
    console.log('sending direct ERAS_Action: ' + action_data);
    send_tcp_msg(action_data);
}

function handle_device_orientation_data(deviceOrientationData)
{
    //we receive data with | delimiters, but only care about beta and gamma
    const values = deviceOrientationData.split("|");
    const beta = parseFloat(values[1]);
    const gamma = parseFloat(values[2]);    
    const betaServoAngle = convertToServoAngle(beta).toString();
    const gammaServoAngle = convertToServoAngle(gamma).toString();
    
    // Use betaServoAngle and gammaServoAngle as needed
    console.log("Beta Servo Angle:", betaServoAngle);
    console.log("Gamma Servo Angle:", gammaServoAngle);
  
    // Send the servo angles as strings to the Python process
    const command = `Substrate_Target_Orientation,${betaServoAngle}|${gammaServoAngle}`;
    send_tcp_msg(command);  

}

function convertToServoAngle(deviceOrientationValue) {
    let servoAngle = 0;

    sensitivityAngle = 67;

    if (deviceOrientationValue <= -1 * sensitivityAngle) {
        servoAngle = 0;
    } else if (deviceOrientationValue >= sensitivityAngle) {
        servoAngle = 180;
    } else {
        // Map the beta value to the servo angle between 0 and 180
        servoAngle = Math.round(((deviceOrientationValue + sensitivityAngle) / (2 * sensitivityAngle)) * 180);
    }

    return servoAngle.toString();
}

// TODO: combine handle_action_keydown and handle_keyboard_data into one thing

function handle_action_keydown(key)
{
    //receives key as an array of [phaser.key, "Key"] for some reason
    //the command to send
    var command;
    var command_data = [];
    console.log('action_keydown: ' + key);
    if(action_dict_keys.includes(key))
    {
        console.log('element in action_dict_keys: ' + key);
        //console.log('corresponding action: ' + keyboard_action_dict[element]);
        command = keyboard_action_dict[key]
        if(command == ERAS_actions.Swap_Syringe)
        {//add the syringe number data
            command_data = [key];
        }
    }
    else{console.log('key not in action_dict_keys!')}

    if(command_data.length==1)
    {//the ERAS_Action includes data, but is not jogging
        command = command + ',' + command_data[0];
        console.log('action command data detected: ' + command);
    }
    console.log('command is: ' + command);
    send_tcp_msg(command);
}


//convert keyboard keys down to commands
function handle_keyboard_data(keyboard_data)
{
    if (!Array.isArray(keyboard_data)) {
        console.log('keyboard_data is not an array');
        return;
      }
    //the command to send
    var command;
    var command_data = [];
    keyboard_data.every(element => {
        console.log('element: ' + element);
        if(action_dict_keys.includes(element))
        {
            console.log('element in action_dict_keys: ' + element);
            //console.log('corresponding action: ' + keyboard_action_dict[element]);
            command = keyboard_action_dict[element]
            if(command == ERAS_actions.Swap_Syringe)
            {//add the syringe number data
                command_data = [element];
            }
            //exit the every() with the first detected action
            return false;
        }
        else if(jog_dict_keys.includes(element))
        {
            command = ERAS_actions.Jog_All;
            if(command_data.length>1)
            {//we're adding to an established vector
                command_data = add_vectors(command_data, keyboard_jog_dict[element]);
            }
            else
            {//set data to the key's vector
                command_data = keyboard_jog_dict[element];
            }
            return true;
        }
    });
    if(command_data.length==1)
    {//the ERAS_Action includes data, but is not jogging
        command = command + ',' + command_data[0];
        console.log('action command data detected: ' + command);
    }
    if(command_data.length>1)
    {//it's a Jogging action
        command = command+','+command_data[0]+'|'+command_data[1]
        +'|'+command_data[2]+'|'+command_data[3]+'|'+command_data[4];
        console.log('jog command data detected: ' + command);

    }
    send_tcp_msg(command);
}

function Begin_Session(){
    // TODO include the user in this message
    send_tcp_msg(ERAS_actions.Begin_Session)
}

function End_Session(){
    send_tcp_msg(ERAS_actions.End_Session)
}

function Begin_Run(){
    send_tcp_msg(ERAS_actions.Begin_Run)
}

function End_Run(){
    send_tcp_msg(ERAS_actions.End_Run)
}

function User_Joined(user_id){
    console.log('user joined with id: ' + user_id);
    message = ERAS_actions.User_Joined + ',' + user_id;
    send_tcp_msg(message);
}

function User_Left(user_id){
    console.log('user left with id: ' + user_id);
    message = ERAS_actions.User_Left + ',' + user_id;
    send_tcp_msg(message);
}

exports.Begin_Session = Begin_Session;
exports.End_Session = End_Session;
exports.Begin_Run = Begin_Run;
exports.End_Run = End_Run;
exports.User_Joined = User_Joined;
exports.User_Left = User_Left;
exports.handle_keyboard_data = handle_keyboard_data;
exports.handle_action_keydown = handle_action_keydown;
exports.handle_joystick_data = handle_joystick_data;
exports.handle_device_orientation_data = handle_device_orientation_data;
exports.handle_ERAS_action = handle_ERAS_action;
