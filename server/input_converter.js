/**
 * Translates data from client processes into messages
 * for IPC that comply with SIE command syntax
 */

util = require('util');
net = require('net');
const PBM_enums = require('./enums.json');
const SIE_actions = PBM_enums.SIE_Action;

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
    "E":jog_vectors['plus_z'],
    "Q":jog_vectors['minus_z'],
};

//TODO be able to record multiple motifs in a run
const keyboard_action_dict = {
    "B":SIE_actions.Begin_Run,
    "N":SIE_actions.End_Run,
    "H":SIE_actions.Home_Syringe,
    "J":SIE_actions.Swap_Next_Syringe,
    "K":SIE_actions.Swap_Previous_Syringe,
    "L":SIE_actions.Unload_Syringe,
    "P":SIE_actions.Power_Off,
    "R":SIE_actions.Replay_Motif,
    "T":SIE_actions.Replay_Run,
    "SPACE":SIE_actions.Toggle_Dispense,
    "V":SIE_actions.Toggle_Withdraw,
    "X":SIE_actions.Substrate_Neutral,
    "G":SIE_actions.Syringe_CNC_Mid,
    "0":SIE_actions.Swap_Syringe,
    "1":SIE_actions.Swap_Syringe,
    //commented out because not yet physically active
    "2":SIE_actions.Swap_Syringe,
    "3":SIE_actions.Swap_Syringe,
    //"4":SIE_actions.Swap_Syringe,
    //"5":SIE_actions.Swap_Syringe,
    //"6":SIE_actions.Swap_Syringe,
};

const action_dict_keys = Object.keys(keyboard_action_dict);
const jog_dict_keys = Object.keys(keyboard_jog_dict);

//send a message through a socket to the Python process
const send_tcp_msg = message => {
    return new Promise((resolve, reject) => {
        let socket = net.connect(
            {host: '127.0.0.1', port: 5623}, () => resolve (socket)
            //{host: '192.168.1.12', port: '5623'}, () => resolve (socket)
        )
    }).then(socket => {
        socket.on('data', (data) => {
            //TODO: verify echoed data is identical to message
            //console.log('>>>' + data.toString())
            socket.end()
        });
        console.log('send_tcp_msg: ' + message);
        socket.write(message);
    });  
}

function handle_joystick_data(joystick_data)
{
    //we receive data almost in the way we need with | delimiters
    //we're always going to be sending a Jog_All command:
    var command = SIE_actions.Jog_All;
    command += ',' + joystick_data;
    console.log('sending command from joystick: ' + command);
    send_tcp_msg(command);

}


function handle_device_orientation_data(device_orientation_data)
{
    //we receive data almost in the way we need with | delimiters
    //we're always going to be sending a Jog_All command:
    var command = SIE_actions.Device_Orientation;
    command += ',' + device_orientation_data;
    console.log('sending command from device_orientation: ' + command);
    send_tcp_msg(command);

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
        if(command == SIE_actions.Swap_Syringe)
        {//add the syringe number data
            command_data = [key];
        }
    }
    else{console.log('key not in action_dict_keys!')}

    if(command_data.length==1)
    {//the SIE_Action includes data, but is not jogging
        command = command + ',' + command_data[0];
        console.log('action command data detected: ' + command);
    }
    console.log('command is: ' + command);
    send_tcp_msg(command);
}


//convert keyboard keys down to commands
function handle_keyboard_data(keyboard_data)
{
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
            if(command == SIE_actions.Swap_Syringe)
            {//add the syringe number data
                command_data = [element];
            }
            //exit the every() with the first detected action
            return false;
        }
        else if(jog_dict_keys.includes(element))
        {
            command = SIE_actions.Jog_All;
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
    {//the SIE_Action includes data, but is not jogging
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
    send_tcp_msg(SIE_actions.Begin_Session)
}

function End_Session(){
    send_tcp_msg(SIE_actions.End_Session)
}

function Begin_Run(){
    send_tcp_msg(SIE_actions.Begin_Run)
}

function End_Run(){
    send_tcp_msg(SIE_actions.End_Run)
}

exports.Begin_Session = Begin_Session;
exports.End_Session = End_Session;
exports.handle_keyboard_data = handle_keyboard_data;
exports.handle_action_keydown = handle_action_keydown;
exports.handle_joystick_data = handle_joystick_data;
exports.handle_device_orientation_data = handle_device_orientation_data;
