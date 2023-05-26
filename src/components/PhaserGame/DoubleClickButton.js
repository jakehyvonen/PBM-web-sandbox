import Button from 'phaser3-rex-plugins/plugins/input/button/Button.js';

export default class DoubleClickButton extends Button {
    constructor(scene, sprite, clickCallback, doubleClickCallback, doubleClickDelay = 300) {
        super(sprite);
        this.scene = scene;
        this.clickCallback = clickCallback;
        this.doubleClickCallback = doubleClickCallback;
        this.doubleClickDelay = doubleClickDelay;
        this.clickCount = 0;
        this.lastClickTime = 0;
        this.setInteractive();

        this.on('click', () => {
            this.clickCount++;
            if (this.clickCount === 1) {
                this.lastClickTime = Date.now();
                this.clickCallback();
            } else if (this.clickCount === 2) {
                if ((Date.now() - this.lastClickTime) < this.doubleClickDelay) {
                    this.doubleClickCallback();
                } else {
                    this.clickCount = 1;
                    this.lastClickTime = Date.now();
                    this.clickCallback();
                }
            }
        });

        this.scene.input.on('pointerup', () => {
            if ((Date.now() - this.lastClickTime) >= this.doubleClickDelay) {
                this.clickCount = 0;
            }
        }, this);
    }
}
