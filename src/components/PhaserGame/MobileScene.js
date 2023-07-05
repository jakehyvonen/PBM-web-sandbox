import Button from 'phaser3-rex-plugins/plugins/input/button/Button.js';
import Phaser from 'phaser'
import VirtualJoystickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js';
import openSocket from 'socket.io-client';
import _ from 'lodash'; // Import lodash for throttling
import ToggleButton from './ToggleButton';

var socket = null;

export default class MobileScene extends Phaser.Scene {
  constructor() {
    super('mobile')
    this.didBroadcastJSNeutral = false;
    this.deviceOrientation = { alpha: 0, beta: 0, gamma: 0 };
    this.orientationBroadcasting = false;
    this.orientationBroadcastInterval = null;
    this.handleDeviceOrientation = this.handleDeviceOrientation.bind(this);
    this.isGantryView = false; //true if user is viewing camera mounted on gantry

  } 

  //Phaser.Scene method
  preload() {
    this.load.atlas('buttons', 'assets/buttons-spritesheet.png', 'assets/buttons.json');
    this.load.image('base', './assets/base.png');
    this.load.image('thumb', './assets/thumb.png');
    this.load.image('blueblank', './assets/blue-!blank.png');
    this.load.image('blue0', './assets/blue-0.png');
    this.load.image('blue0push', './assets/blue-0-pushed.png');
    this.load.image('blue1', './assets/blue-1.png');
    this.load.image('blue1push', './assets/blue-1-pushed.png');
    this.load.image('blue2', './assets/blue-2.png');
    this.load.image('blue2push', './assets/blue-2-pushed.png');
    this.load.image('blue3', './assets/blue-3.png');
    this.load.image('greentriangle', './assets/green-!triangle.png');
    this.load.image('blue3push', './assets/blue-3-pushed.png');
    this.load.image('silverblank', './assets/silver-!blank.png');
    this.load.image('silverC', './assets/silver-C.png');
    this.load.image('silverT', './assets/silver-T.png');
    this.load.image('silverTpush', './assets/silver-T-pushed.png');
    this.load.image('silverdown', './assets/silver-!arrowdown.png');
    this.load.image('silverdownpush', './assets/silver-!arrowdown-pushed.png');
    this.load.image('silverleft', './assets/silver-!arrowleft.png');
    this.load.image('silverleftpush', './assets/silver-!arrowleft-pushed.png');
    this.load.image('silverright', './assets/silver-!arrowright.png');
    this.load.image('silverrightpush', './assets/silver-!arrowright-pushed.png');
    this.load.image('redr', './assets/red-R.png');
    this.load.image('redrpush', './assets/red-R-pushed.png');
    this.load.plugin('rex-virtual-joystick-plugin"', VirtualJoystickPlugin, true);   
		// sprites, note: see free sprite atlas creation tool here https://www.leshylabs.com/apps/sstool/
  
  }

  init() {
   
    socket = openSocket(process.env.REACT_APP_NGROK_URL)
    socket.on('clock-room', function(data){
      console.log('got clock-room');

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
  
    let dispenseButton = new ToggleButton(
      this,
      this.gameHeight/2, this.gameWidth/9,
      'buttons',
      ['silver-!arrowdown', 'silver-!arrowdown-pushed'],
      (frameName) => {
        console.log('dispenseButton was toggled to frame', frameName);
        if(this.isDispensing){
          this.isDispensing = false;
          socket.emit('action_keydown','SPACE');
  
        }
        else{
          this.isDispensing = true;
          socket.emit('action_keydown','SPACE');
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
      this,
      this.gameHeight/6, this.gameWidth*2.7/3,
      'buttons', ['silver-!arrowright', 'silver-!arrowright-pushed'],
      (frameName) => {
        console.log('rotateCWButton was toggled to frame', frameName);
        if(this.isRotatingCW){
          this.isRotatingCW = false;
          socket.emit('action_keydown','E');
        } else if(this.isRotatingCCW){
          this.isRotatingCW = true;
          this.isRotatingCCW = false;
          socket.emit('action_keydown','E');
        } else {
          this.isRotatingCW = true;
          socket.emit('action_keydown','E');
        }
        this.updateRotateButtonFrames();
      },
      4,
    );
    this.add.existing(rotateCWButton);
    
    let rotateCCWButton = new ToggleButton(
      this,
      this.gameHeight/6, this.gameWidth*2.3/3,
      'buttons', ['silver-!arrowleft', 'silver-!arrowleft-pushed'],
      (frameName) => {
        console.log('rotateCCWButton was toggled to frame', frameName);
        if(this.isRotatingCCW){
          this.isRotatingCCW = false;
          socket.emit('action_keydown','Q');
        } else if(this.isRotatingCW){
          this.isRotatingCCW = true;
          this.isRotatingCW = false;
          socket.emit('action_keydown','Q');
        } else {
          this.isRotatingCCW = true;
          socket.emit('action_keydown','Q');
        }
        this.updateRotateButtonFrames();
      },
      4,
    );
    this.add.existing(rotateCCWButton);

    // var rotateCWSprite = this.add.sprite(this.gameHeight/6, this.gameWidth*2.7/3, 'silverright');
    // rotateCWSprite.scale = 4;
    // rotateCWSprite.setAngle(90);

    // var rotateCCWSprite = this.add.sprite(this.gameHeight/6, this.gameWidth*2.3/3, 'silverleft');
    // rotateCCWSprite.scale = 4;
    // rotateCCWSprite.setAngle(90);
    
    // this.updateRotateButtonStates = function() {
    //   if (this.isRotatingCW) {
    //     rotateCWSprite.setTexture('silverrightpush');
    //     rotateCCWSprite.setTexture('silverleft');
    //   } else if (this.isRotatingCCW) {
    //     rotateCWSprite.setTexture('silverright');
    //     rotateCCWSprite.setTexture('silverleftpush');
    //   } else {
    //     rotateCWSprite.setTexture('silverright');
    //     rotateCCWSprite.setTexture('silverleft');
    //   }
    // };
    
    // this.rotateCWButton = new Button(rotateCWSprite);
    // this.rotateCWButton.on('click', function() {
    //   console.log('clicked rotate CW');
    //   if(this.isRotatingCW){
    //     this.isRotatingCW = false;
    //     socket.emit('action_keydown','E');
    //   } else if(this.isRotatingCCW){
    //     this.isRotatingCW = true;
    //     this.isRotatingCCW = false;
    //     socket.emit('action_keydown','E');
    //   } else {
    //     this.isRotatingCW = true;
    //     socket.emit('action_keydown','E');
    //   }
    //   this.updateRotateButtonStates();
    // }.bind(this));
    
    // this.rotateCCWButton = new Button(rotateCCWSprite);
    // this.rotateCCWButton.on('click', function() {
    //   console.log('clicked rotate CCW');
    //   if(this.isRotatingCCW){
    //     this.isRotatingCCW = false;
    //     socket.emit('action_keydown','Q');
    //   } else if(this.isRotatingCW){
    //     this.isRotatingCCW = true;
    //     this.isRotatingCW = false;
    //     socket.emit('action_keydown','Q');
    //   } else {
    //     this.isRotatingCCW = true;
    //     socket.emit('action_keydown','Q');
    //   }
    //   this.updateRotateButtonStates();
    // }.bind(this));
    
    if (!('ondeviceorientation' in window)) {
      // Device Orientation isn't supported!
      console.log('device orientation is not supported');
    }
    else
    {
      console.log('device orientation is supported');
    }

    window.addEventListener('deviceorientation', this.handleDeviceOrientation, true);

    var orientationButtonSprite = this.add.sprite(this.gameHeight/2, this.gameWidth*2.7/3, 'silverT');
    orientationButtonSprite.scale = 3;
    orientationButtonSprite.setAngle(90);
  
    this.orientationButton = new Button(orientationButtonSprite);
    this.orientationButton.on('click', () =>
    {
      console.log('orient_clicky');
      if(this.orientationBroadcasting){
        orientationButtonSprite.setTexture('silverT')
        this.orientationBroadcasting = false;
        // Stop broadcasting orientation data
        clearInterval(this.orientationBroadcastInterval);
        this.orientationBroadcastInterval = null;
      }
      else{
        orientationButtonSprite.setTexture('silverTpush')
        this.orientationBroadcasting = true;
        this.orientationBroadcastInterval = setInterval(this.broadcastDeviceOrientation.bind(this), 50);

      }
    })  

    var centerButtonsprite = this.add.sprite(this.gameHeight/2, this.gameWidth*5/6, 'silverC');
    centerButtonsprite.scale = 3;
    centerButtonsprite.setAngle(90);


    var button0sprite = this.add.sprite(this.gameHeight*5/6, this.gameWidth*2.8/3, 'blue0');
    button0sprite.scale = 3;
    button0sprite.setAngle(90);
    var button1sprite = this.add.sprite(this.gameHeight*5/6, this.gameWidth*2.5/3, 'blue1');
    button1sprite.scale = 3;
    button1sprite.setAngle(90);

    var button2sprite = this.add.sprite(this.gameHeight*5/6, this.gameWidth*2.2/3, 'blue2');
    button2sprite.scale = 3;
    button2sprite.setAngle(90);

    var button3sprite = this.add.sprite(this.gameHeight*5/6, this.gameWidth*1.9/3, 'blue3');
    button3sprite.scale = 3;
    button3sprite.setAngle(90);

    var recordButtonSprite = this.add.sprite(this.gameHeight*5/6, this.gameWidth/9, 'redr');
    recordButtonSprite.scale = 5;
    recordButtonSprite.setAngle(90);

    var replayButtonSprite = this.add.sprite(this.gameHeight*5/6, this.gameWidth/3, 'greentriangle');
    replayButtonSprite.scale = 3;
    replayButtonSprite.setAngle(90);


    this.button0 = new Button(button0sprite);
    this.button0.on('click', function()
    {
      console.log('clicky0');      
        //just hardcoding output for now
        // TODO find some way to share commands as a base class between mobile and desktop
        socket.emit('action_keydown','0');
      
    })

    this.button1 = new Button(button1sprite);
    this.button1.on('click', function()
    {
      console.log('clicky1');      
      socket.emit('action_keydown','1');
        
      
    })

    this.button2 = new Button(button2sprite);
    this.button2.on('click', function()
    {
      console.log('clicky2');      
      socket.emit('action_keydown','2');
      
    })

    this.button3 = new Button(button3sprite);
    this.button3.on('click', function()
    {
      console.log('clicky3');      
      //hardcode mapped to Unload_Syringe
      socket.emit('action_keydown','3');
      
    })

    this.centerButton = new Button(centerButtonsprite);
    this.centerButton.on('click', function()
    {
      console.log('clicky3');      
      //hardcode mapped to Substrate_Neutral
      socket.emit('action_keydown','X');
      
    })
    
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
    }
  }

  broadcastDeviceOrientation() {
    if (this.orientationBroadcasting) {
      var data = this.deviceOrientation.alpha + '|';
      data += this.deviceOrientation.beta + '|';
      data += this.deviceOrientation.gamma;
      socket.emit('device_orientation', data);
    }
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
      var data = this.deviceOrientation.alpha + '|';
      data += this.deviceOrientation.beta + '|';
      data += this.deviceOrientation.gamma;
      socket.emit('device_orientation', data);
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



}
