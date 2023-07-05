import Button from 'phaser3-rex-plugins/plugins/input/button/Button.js';
import Phaser from 'phaser'
import VirtualJoystickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js';
import openSocket from 'socket.io-client';
import _ from 'lodash'; // Import lodash for throttling
import ToggleButton from './ToggleButton';
import SwapButton from './SwapButton';

const PBM_enums = require('../../enums.json');
const ERAS_actions = PBM_enums.ERAS_Action;

var socket = null;

export default class MobileScene extends Phaser.Scene {
  constructor() {
    super('mobile')
    this.didBroadcastJSNeutral = false;
    this.deviceOrientation = { alpha: 0, beta: 0, gamma: 0 };
    this.lastDeviceOrientation = {alpha: 0, beta: 0, gamma: 0};
    this.orientationBroadcasting = false;
    this.orientationBroadcastInterval = null;
    this.handleDeviceOrientation = this.handleDeviceOrientation.bind(this);
    this.isGantryView = false; //true if user is viewing camera mounted on gantry
  } 

  preload() {
    this.load.atlas('buttons', 'assets/buttons-spritesheet.png', 'assets/buttons.json');
    this.load.image('base', './assets/base.png');
    this.load.image('thumb', './assets/thumb.png');
    this.load.plugin('rex-virtual-joystick-plugin"', VirtualJoystickPlugin, true);   
		// sprites, note: see free sprite atlas creation tool here https://www.leshylabs.com/apps/sstool/
  }

  init() {
    socket = openSocket(process.env.REACT_APP_NGROK_URL);   
    this.activeSyringeId = null;
    socket.on('syringe', function(data){
      console.log('got syringe data: ' + data);
      this.activeSyringeId = data;
    });

    this.isBusy = false;
    socket.on('finished', function(){
      console.log('we finnished');
      this.isBusy = false;
    });

    this.gameHeight = this.sys.game.config.width;
    this.gameWidth = this.sys.game.config.height;    

    this.joystickAConfig = {
      x: this.gameHeight/6,
      y: this.gameWidth/9,
    }
    this.isDispensing = false;
    this.isRotatingCW = false;
    this.isRotatingCCW = false;
    this.isRecording = false;
    this.isReplaying = false;
  }
   
  create() {
    this.cursorDebugTextA = this.add.text(100, 200);
    this.input.addPointer(1);

    this.joystickA= this.createVirtualJoystick(this.joystickAConfig);
    this.joysticks = [this.joystickA];

    if (window.DeviceOrientationEvent) {
      console.log('Device Orientation is supported');
    
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        // iOS 13+ requires permission to access device orientation
        DeviceOrientationEvent.requestPermission()
          .then(permissionState => {
            if (permissionState === 'granted') {
              window.addEventListener('deviceorientation', this.handleDeviceOrientation, true);
            } else {
              console.log('Device orientation permission not granted');
            }
          })
          .catch(console.error);
      } else {
        // non iOS 13+
        window.addEventListener('deviceorientation', this.handleDeviceOrientation, true);
      }
    } else {
      console.log('Device orientation is not supported');
    }
    //#region ToggleButtons
    let dispenseButton = new ToggleButton(
      this, this.gameHeight/2, this.gameWidth/9,
      'buttons',
      ['silver-!arrowdown', 'silver-!arrowdown-pushed'],
      (frameName) => {
        console.log('dispenseButton was toggled to frame', frameName);
        if(this.isDispensing){
          this.isDispensing = false;
          socket.emit('ERAS_action', ERAS_actions.Toggle_Dispense);
  
        }
        else{
          this.isDispensing = true;
          socket.emit('ERAS_action', ERAS_actions.Toggle_Dispense);
        }
      },
      5,
    );
    this.add.existing(dispenseButton);

    this.updateRotateButtonFrames = function(){
      if (this.isRotatingCW) {
        rotateCWButton.setFrame(rotateCWButton.frames[1]);//right pushed
        rotateCCWButton.setFrame(rotateCCWButton.frames[0]);//left up
      } else if (this.isRotatingCCW) {
        rotateCWButton.setFrame(rotateCWButton.frames[0]);//right up
        rotateCCWButton.setFrame(rotateCCWButton.frames[1]);//left pushed
      } else {
        rotateCWButton.setFrame(rotateCWButton.frames[0]);//right up
        rotateCCWButton.setFrame(rotateCCWButton.frames[0]);//left up
      }
    };

    let rotateCWButton = new ToggleButton(
      this, this.gameHeight/6, this.gameWidth*2.7/3,
      'buttons', ['silver-!arrowright', 'silver-!arrowright-pushed'],
      (frameName) => {
        console.log('rotateCWButton was toggled to frame', frameName);
        if(this.isRotatingCW){
          this.isRotatingCW = false;
          socket.emit('ERAS_action', ERAS_actions.Toggle_Rotation_CW);
        } else if(this.isRotatingCCW){
          this.isRotatingCW = true;
          this.isRotatingCCW = false;
          socket.emit('ERAS_action', ERAS_actions.Toggle_Rotation_CW);
        } else {
          this.isRotatingCW = true;
          socket.emit('ERAS_action', ERAS_actions.Toggle_Rotation_CW);
        }
        this.updateRotateButtonFrames();
      },
      4,
    );
    this.add.existing(rotateCWButton);
    
    let rotateCCWButton = new ToggleButton(
      this, this.gameHeight/6, this.gameWidth*2.3/3,
      'buttons', ['silver-!arrowleft', 'silver-!arrowleft-pushed'],
      (frameName) => {
        console.log('rotateCCWButton was toggled to frame', frameName);
        if(this.isRotatingCCW){
          this.isRotatingCCW = false;
          socket.emit('ERAS_action', ERAS_actions.Toggle_Rotation_CCW);
        } else if(this.isRotatingCW){
          this.isRotatingCCW = true;
          this.isRotatingCW = false;
          socket.emit('ERAS_action', ERAS_actions.Toggle_Rotation_CCW);
        } else {
          this.isRotatingCCW = true;
          socket.emit('ERAS_action', ERAS_actions.Toggle_Rotation_CCW);
        }
        this.updateRotateButtonFrames();
      },
      4,
    );
    this.add.existing(rotateCCWButton);

    let orientationButton = new ToggleButton(
      this, this.gameHeight/2, this.gameWidth*2.7/3,
      'buttons', ['silver-T', 'silver-T-pushed'],
      (frameName) => {
      console.log('orientationButton was toggled to frame', frameName);
      if(this.orientationBroadcasting){
        this.orientationBroadcasting = false;
        // Stop broadcasting orientation data
        clearInterval(this.orientationBroadcastInterval);
        this.orientationBroadcastInterval = null;
        }
        else{
          this.orientationBroadcasting = true;
          this.orientationBroadcastInterval = setInterval(this.broadcastDeviceOrientation.bind(this), 50);

        }
      },
    );
    this.add.existing(orientationButton);

    let centerButton = new ToggleButton(
      this, this.gameHeight/2, this.gameWidth*5/6,
      'buttons', ['silver-C'],
      (frameName) => {
        console.log('orientationButton was toggled to frame', frameName);
        if(this.orientationBroadcasting){
          this.orientationBroadcasting = false;
          // Stop broadcasting orientation data
          clearInterval(this.orientationBroadcastInterval);
          this.orientationBroadcastInterval = null;
          orientationButton.setFrame(orientationButton.frames[0]);//un-pushed image
        }
        socket.emit('ERAS_action', ERAS_actions.Substrate_Neutral);
      },
    );
    this.add.existing(centerButton);
    //#endregion

    this.swapSyringe = function(syringeId){
      if(!this.isBusy){
        if(this.isDispensing){
          socket.emit('ERAS_action', ERAS_actions.Toggle_Dispense);
        }
        this.isBusy = true;
        var message = ERAS_actions.Swap_Syringe + ',' + syringeId;
        socket.emit('ERAS_action',message);
        this.activeSyringeId = syringeId;
      }
    };

    this.updateSwapButtonFrames = function(){

    };


    let swapButton0 = new SwapButton(
      this, this.gameHeight*5/6, this.gameWidth*2.8/3,
      'buttons', ['blue-0','blue-0-pushed'], 0,
      (btnNum) => {
        this.swapSyringe(btnNum);
      },
    );
    this.add.existing(swapButton0);

    // var button0sprite = this.add.sprite(this.gameHeight*5/6, this.gameWidth*2.8/3, 'blue0');
    // button0sprite.scale = 3;
    // button0sprite.setAngle(90);

    // this.button0 = new Button(button0sprite);
    // this.button0.on('click', function()
    // {
    //   console.log('clicky0');      
    //     //just hardcoding output for now
    //     // TODO find some way to share commands as a base class between mobile and desktop
    //     socket.emit('action_keydown','0');
      
    // })

    var button1sprite = this.add.sprite(this.gameHeight*5/6, this.gameWidth*2.5/3, 'blue1');
    button1sprite.scale = 3;
    button1sprite.setAngle(90);

    this.button1 = new Button(button1sprite);
    this.button1.on('click', function()
    {
      console.log('clicky1');      
      socket.emit('action_keydown','1');
        
      
    })


    var button2sprite = this.add.sprite(this.gameHeight*5/6, this.gameWidth*2.2/3, 'blue2');
    button2sprite.scale = 3;
    button2sprite.setAngle(90);

    this.button2 = new Button(button2sprite);
    this.button2.on('click', function()
    {
      console.log('clicky2');      
      socket.emit('action_keydown','2');
      
    })

    var button3sprite = this.add.sprite(this.gameHeight*5/6, this.gameWidth*1.9/3, 'blue3');
    button3sprite.scale = 3;
    button3sprite.setAngle(90);

    this.button3 = new Button(button3sprite);
    this.button3.on('click', function()
    {
      console.log('clicky3');      
      //hardcode mapped to Unload_Syringe
      socket.emit('action_keydown','3');
      
    })


    
    var recordButtonSprite = this.add.sprite(this.gameHeight*5/6, this.gameWidth/9, 'redr');
    recordButtonSprite.scale = 5;
    recordButtonSprite.setAngle(90);

    var replayButtonSprite = this.add.sprite(this.gameHeight*5/6, this.gameWidth/3, 'greentriangle');
    replayButtonSprite.scale = 3;
    replayButtonSprite.setAngle(90);

    this.recordButton = new Button(recordButtonSprite);
    this.recordButton.on('click', function()
    {
      console.log('clickyrec');      

      if(this.isRecording){
        recordButtonSprite.setTexture('redr')
        this.isRecording = false;
        //hardcode mapped to End_Run
        socket.emit('action_keydown','N');
      }
      else{
        recordButtonSprite.setTexture('redrpush')
        this.isRecording = true;
        //hardcode mapped to Begin_Run
        socket.emit('action_keydown','B');
      }
    })

    this.replayButton = new Button(replayButtonSprite);
    this.replayButton.on('click', function()
    {
      console.log('clicky3');      
      //hardcode mapped to Replay_Motif
      socket.emit('action_keydown','R');      
    })

    this.setCursorDebugInfo();
    this.updateJoystickState();
    this.broadcastInterval = setInterval(() => this.broadcastJoysticks(), 50);

  }

  createVirtualJoystick(config) {
    let newJoyStick = this.plugins.get('rex-virtual-joystick-plugin"').add(
        this,
        Object.assign({}, config, {
            enabled: true,
            radius: 100,
            base: this.add.image(0, 0, 'base').setDisplaySize(200, 200),
            thumb: this.add.image(0, 0, 'thumb').setDisplaySize(75, 75),
            normalizedX : 0.00,
            normalizedY : 0.00,
        })
    ).on('update', this.updateJoystickState, this);
    
    return newJoyStick;
  }


  normalizedXAndYFromForce(){
    this.joysticks.forEach(function(joystick){
      var newX = joystick.forceX;
      var newY = joystick.forceY;
      
      if (joystick.force > joystick.radius) { // Exceed radius
        const angle = Math.floor(joystick.angle * 100) / 100;
        const rad = angle * Math.PI / 180;   
        //force x and y to be values intersecting radius at joystick.angle
        newX = Math.cos(rad) * joystick.radius;
        newY = Math.sin(rad) * joystick.radius;
      }
      joystick.normalizedX = newX/joystick.radius;//radius = max force
      joystick.normalizedY = newY/joystick.radius;
     
      joystick.normalizedX = (joystick.normalizedX).toPrecision(3);
      joystick.normalizedY = (joystick.normalizedY).toPrecision(3);
      // console.log('normalizedX: ' + joystick.normalizedX);
      // console.log('normalizedY: ' + joystick.normalizedY);
    });
  }


  broadcastJoysticks() {
    var positions = [this.joystickA.normalizedX, this.joystickA.normalizedY]

    if(positions.some(el => el>0 || el<0)) {
      var msg = null;
      if (this.isGantryView){//reverse directions for gantry camera
        this.joystickA.normalizedX = this.joystickA.normalizedX * -1.0;
        this.joystickA.normalizedY = this.joystickA.normalizedY * -1.0;
      }
      //construct a msg if anything is nonzero
      //we only have one joystick for mobile
      msg = '0|0|';
      msg += this.joystickA.normalizedY + '|';
      msg += this.joystickA.normalizedX + '|';
      msg += '0';
      console.log('msg: ' + msg);

      socket.emit('joystick_input',msg);
      this.didBroadcastJSNeutral = false;
    }
    else if(!this.didBroadcastJSNeutral){
      socket.emit('joystick_input','0|0|0|0|0');
      this.didBroadcastJSNeutral = true;
    }
  }

  handleDeviceOrientation = (event) => {
    //console.log('event.alpha: ', event.alpha);
    const { alpha, beta, gamma } = event;
    //alpha is phone rotation, beta and gamma are tilt axes
    const roundedAlpha = parseFloat(alpha.toFixed(2));
    const roundedBeta = parseFloat(beta.toFixed(2));
    const roundedGamma = parseFloat(gamma.toFixed(2));
    this.deviceOrientation = {
      alpha: roundedAlpha,
      beta: roundedBeta,
      gamma: roundedGamma
    };
  };

  broadcastDeviceOrientation() {
    if (this.orientationBroadcasting) {
      if(!this.areObjectsEqual(this.deviceOrientation, this.lastDeviceOrientation)){
        var data = this.deviceOrientation.alpha + '|';
        data += this.deviceOrientation.beta + '|';
        data += this.deviceOrientation.gamma;
        socket.emit('device_orientation', data);
        this.lastDeviceOrientation = this.deviceOrientation;
      }
      else{
        console.log('no change in deviceOrientation');
      }     
    }
  }


  update() {
    this.updateJoystickState();   
  }
  
  updateJoystickState() {     
    // Set debug info about the cursor
    this.normalizedXAndYFromForce()
    this.setCursorDebugInfo();
  }

  setCursorDebugInfo = function() {
    const force = Math.floor(this.joystickA.force * 100) / 100;
    const angle = Math.floor(this.joystickA.angle * 100) / 100;
    const x_pos = this.joystickA.normalizedX;
    const y_pos = this.joystickA.normalizedY;
    let text = `Force: ${force}\n`;
    text += `Angle: ${angle}\n`;
    text += `X: ${x_pos}\n`;
    text += `Y: ${y_pos}\n`;
    text += `FPS: ${this.sys.game.loop.actualFps}\n`;
    //this.cursorDebugTextA.setText(text);
    //this.joystickA.cursorDebugText.setText(text);
  }


  // Helper function to compare two objects
  areObjectsEqual = (obj1, obj2) => {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

}
