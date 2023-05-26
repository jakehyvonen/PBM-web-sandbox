import Phaser from 'phaser';

export default class DoubleClickButton extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, onClick, onDoubleClick, clickDelay = 300) {
        super(scene, x, y, texture);

        this.onClick = onClick;
        this.onDoubleClick = onDoubleClick;
        this.clickDelay = clickDelay;

        this.clickCount = 0;
        this.clickTimer = null;
        this.buttonState = 'up'; // 'up' or 'down'

        this.setInteractive();
        this.on('pointerdown', this.onDown, this);
        this.on('pointerup', this.onUp, this);
    }

    toggleState() {
        if (this.buttonState === 'up') {
            this.buttonState = 'down';
            this.sprite.setTexture(this.downTexture);
        } else {
            this.buttonState = 'up';
            this.sprite.setTexture(this.upTexture);
        }
    }

    onDown() {
        if (this.buttonState === 'up') {
            this.sprite.setTexture(this.downTexture);
        } else {
            this.sprite.setTexture(this.upTexture);
        }
    }

    onUp() {
        if (this.buttonState === 'down') {
            this.sprite.setTexture(this.upTexture);
        } else {
            this.sprite.setTexture(this.downTexture);
        }

        this.clickCount++;
        if (this.clickCount === 1) {
            this.clickTimer = this.scene.time.delayedCall(this.clickDelay, () => {
                if (this.clickCount === 1) {
                    this.onClick();
                    this.toggleState(); // Toggle button state after the single click
                } else {
                    this.onDoubleClick();
                }
                this.clickCount = 0;
            }, [], this);
        }
    }
}
