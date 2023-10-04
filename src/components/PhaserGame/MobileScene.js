
import Button from 'phaser3-rex-plugins/plugins/input/button/Button.js';
import Phaser from 'phaser'
import VirtualJoystickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js';
import openSocket from 'socket.io-client';
import _ from 'lodash'; // Import lodash for throttling
import ToggleButton from './ToggleButton';
import TaskButton from './TaskButton';

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
    

    this.gameHeight = this.sys.game.config.width;
    this.gameWidth = this.sys.game.config.height;    

    this.joystickAConfig = {
      x: this.gameHeight/3,
      y: this.gameWidth/4,
    }
    this.isDispensing = false;
    this.isRotatingCW = false;
    this.isRotatingCCW = false;
    this.isRecording = false;
    this.isReplaying = false;
  }
   
  create() {
    this.input.enabled = true;
    socket.on('syringe', (data) => {
      console.log('got syringe data: ' + data);
      this.activeSyringeId = data;
      this.updateTaskButtonFrames();
      this.broadcastActiveSyringe();
    });

    this.isBusy = false;
    socket.on('finished', (data)=>{
      console.log('we finnished');
      this.isBusy = false;
      this.setAllTaskButtonsActive();

      // unnecessary? We will always want to block taskButtons while a task is running
      // if(data.includes(ERAS_actions.Swap_Syringe)){
      //   this.setAllTaskButtonsActive();
      // }
    });


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
      this, this.gameHeight/6, this.gameWidth/2,
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
      5, 'Dispense',
    );
    this.add.existing(dispenseButton);

    this.updateRotateButtonFrames = function(){
      if (this.isRotatingCW) {
        rotateCWButton.image.setFrame(rotateCWButton.frames[1]);//right pushed
        rotateCCWButton.image.setFrame(rotateCCWButton.frames[0]);//left up
      } else if (this.isRotatingCCW) {
        rotateCWButton.image.setFrame(rotateCWButton.frames[0]);//right up
        rotateCCWButton.image.setFrame(rotateCCWButton.frames[1]);//left pushed
      } else {
        rotateCWButton.image.setFrame(rotateCWButton.frames[0]);//right up
        rotateCCWButton.image.setFrame(rotateCCWButton.frames[0]);//left up
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
      4, 'CCW',
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
      4, 'Rotate CW',
    );
    this.add.existing(rotateCCWButton);

    let orientationButton = new ToggleButton(
      this, this.gameHeight/2, this.gameWidth*5.5/6,
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
      3, 'Tilt Table'
    );
    this.add.existing(orientationButton);

    let levelButton = new ToggleButton(
      this, this.gameHeight/2, this.gameWidth*4.5/6,
      'buttons', ['silver-L'],
      (frameName) => {
        console.log('orientationButton was toggled to frame', frameName);
        if(this.orientationBroadcasting){
          this.orientationBroadcasting = false;
          // Stop broadcasting orientation data
          clearInterval(this.orientationBroadcastInterval);
          this.orientationBroadcastInterval = null;
          orientationButton.image.setFrame(orientationButton.frames[0]);//un-pushed image
        }
        socket.emit('ERAS_action', ERAS_actions.Substrate_Neutral);
      },
      3, 'Level Table'
    );
    this.add.existing(levelButton);

    /*TODO: implement this

    let recordMotifButton = new ToggleButton(
      this, this.gameHeight*5/6, this.gameWidth*0.5/6,
      'buttons', ['red-R','red-R-pushed'],
      (frameName) => {
        console.log('recordButton was toggled to frame', frameName);        
        if(this.isRecording){
          socket.emit('ERAS_action', ERAS_actions.End_Motif);
          this.isRecording = false;
        }
        else{
          socket.emit('ERAS_action', ERAS_actions.Begin_Motif);
          this.isRecording = true;
        }
      },
    );
    this.add.existing(recordMotifButton);

    */
    //#endregion


    //#region TaskButtons
    
    let taskButton0 = new TaskButton(
      this, this.gameHeight*5/6, this.gameWidth*1.9/3,
      'buttons', ['blue-0','blue-0-pushed'], 0,
      (btnNum) => {
        this.swapSyringe(btnNum);
      },
    );
    this.add.existing(taskButton0);

    let taskButton1 = new TaskButton(
      this, this.gameHeight*5/6, this.gameWidth*2.2/3,
      'buttons', ['blue-1','blue-1-pushed'], 1,
      (btnNum) => {
        this.swapSyringe(btnNum);
      },
    );
    this.add.existing(taskButton1);

    let taskButton2 = new TaskButton(
      this, this.gameHeight*5/6, this.gameWidth*2.5/3,
      'buttons', ['blue-2','blue-2-pushed'], 2,
      (btnNum) => {
        this.swapSyringe(btnNum);
      },
    );
    this.add.existing(taskButton2);

    let taskButton3 = new TaskButton(
      this, this.gameHeight*5/6, this.gameWidth*2.8/3,
      'buttons', ['blue-3','blue-3-pushed'], 3,
      (btnNum) => {
        this.swapSyringe(btnNum);
      },
    );
    this.add.existing(taskButton3);


    this.taskButtons = [taskButton0, taskButton1, taskButton2, taskButton3];

    this.swapSyringe = function(syringeId){
      if(!this.isBusy && this.activeSyringeId != syringeId){
        if(this.isDispensing){
          socket.emit('ERAS_action', ERAS_actions.Toggle_Dispense);
        }
        this.isBusy = true;
        var message = ERAS_actions.Swap_Syringe + ',' + syringeId;
        socket.emit('ERAS_action',message);
        this.activeSyringeId = syringeId;
        this.updateTaskButtonFrames();
        this.setAllTaskButtonsInactive();
      }
    };

    this.updateTaskButtonFrames = ()=>{
      this.taskButtons.forEach((taskButton)=>{
        console.log('sane');
        if (taskButton.btnNum == this.activeSyringeId) {
          taskButton.sprite.setFrame(taskButton.frameNames[1]);
          console.log('btn ' + taskButton.btnNum + 'active');
        }
        else {
          taskButton.sprite.setFrame(taskButton.frameNames[0]);
        }
      })
    };

    let replayGestureButton = new ToggleButton(
      this, this.gameHeight*5/6, this.gameWidth/6,
      'buttons', ['green-!triangle', 'green-triangle-pushed'],
      (frameName) => {
        window.dispatchEvent(new CustomEvent('showGestureDialog'));
        console.log('we may be sane');

        // socket.emit('ERAS_action', ERAS_actions.Replay_Last_Gesture)
        // this.setAllSwappersInactive();
      }
      ,3, 'Replay',
    );
    this.add.existing(replayGestureButton)

    window.addEventListener('showGestureDialog', () => {
      this.scene.pause();
      const data = { activeSyringeId: this.activeSyringeId };
      const event = new CustomEvent('ActiveSyringe', { detail: data });
      window.dispatchEvent(event);
    });

    window.addEventListener('hideGestureDialog', () => {
        this.scene.resume();
    });

    window.addEventListener('submitGestureDialog', (event) => {
      const rotation = event.detail.rotationDegree || 0;
      const syringe = event.detail.syringeNum;

      let comm = `${ERAS_actions.Replay_Last_Gesture},${rotation}`;
      if (syringe) {
        comm += `|${syringe}`;
      }

      socket.emit('ERAS_action', comm);

      //socket.emit('ERAS_action', ERAS_actions.Replay_Last_Gesture);


      this.scene.resume();
    });

    /*TODO: implement this

    let replayMotifButton = new ToggleButton(
      this, this.gameHeight*5/6, this.gameWidth*1.1/6,
      'buttons', ['green-M', 'green-M-pushed'],
      (frameName) => {
        socket.emit('ERAS_action', ERAS_actions.Replay_Motif)
        this.setAllTaskButtonsInactive();
      }
    );
    this.add.existing(replayMotifButton)
    */

    this.setAllTaskButtonsActive = ()=>{
      this.taskButtons.forEach((taskButton)=>{
        taskButton.active = true
        taskButton.sprite.setInteractive()
      })
    };

    this.setAllTaskButtonsInactive = ()=>{
      this.taskButtons.forEach((taskButton)=>{
        taskButton.active = false
        taskButton.sprite.disableInteractive()
      })
    };
    //#endregion
  
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
            base: this.add.image(0, 0, 'base').setDisplaySize(350, 350),
            thumb: this.add.image(0, 0, 'thumb').setDisplaySize(100, 100),
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

  broadcastActiveSyringe(){
    const data = { activeSyringeId: this.activeSyringeId };
    const event = new CustomEvent('ActiveSyringe', { detail: data });
    window.dispatchEvent(event);
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
