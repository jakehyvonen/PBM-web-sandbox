import React, { Component } from 'react'
import Phaser from 'phaser'
import VirtualJoystickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js';
import MobileScene from './MobileScene';
import ReplayGestureDialogBox from './ReplayGestureDialogBox';
import './../../styles.css'
//import DesktopScene from './DesktopScene';

class PhaserGame extends Component {

    constructor() {
    super();
    this.state = {
        showGestureDialog: false
      };

    this.config = {
        type: Phaser.AUTO,   
        transparent:true,

        scale: {
            parent: "game",
            width: 720,
            height: 1280,
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 200 },
            },
        },
        scene: [MobileScene],
        plugins: {
            global: [{
                key: 'rexVirtualJoystick',
                plugin: VirtualJoystickPlugin,
                start: true
            }]
        }
    };
    }

    showGestureDialogBox = () => {
        this.setState({ showGestureDialog: true });
        console.log('showBOX!!!');
      }

    dispatchGestureDialogData = (data) => {
        const event = new CustomEvent('gestureDialogData', { detail: data });
        window.dispatchEvent(event);
    }  
  
    hideGestureDialogBox = () => {
        this.setState({ showGestureDialog: false });
    }

    componentDidMount() {
    this.game = new Phaser.Game(this.config);
    window.addEventListener('showGestureDialog', this.showGestureDialogBox);
    }
    
    render() {
        return (
            <div>
                <div id="game"></div>
                <ReplayGestureDialogBox
                    isOpen={this.state.showGestureDialog} 
                    close={this.hideGestureDialogBox} 
                    // additional props for DialogBox
            /> 
            </div>
        )    }
}

export default PhaserGame;