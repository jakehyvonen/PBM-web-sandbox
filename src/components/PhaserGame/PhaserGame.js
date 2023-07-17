import React, { Component } from 'react'
import Phaser from 'phaser'
import VirtualJoystickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js';
import MobileScene from './MobileScene';
import DialogBox from './DialogBox';
//import DesktopScene from './DesktopScene';

class PhaserGame extends Component {

    constructor() {
    super();
    this.state = {
        showDialog: false
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

    showDialogBox = () => {
        this.setState({ showDialog: true });
      }

    hideDialogBox = () => {
    this.setState({ showDialog: false });
    }

    componentDidMount() {
    this.game = new Phaser.Game(this.config);
    }
    
    render() {
        return (
            <div>
                <div id="game"></div>
                {this.state.showDialog ? 
                    <DialogBox 
                        close={this.hideDialogBox}
                        // additional props for DialogBox
                    /> 
                    : null
                }
            </div>
        )    }
}

export default PhaserGame;