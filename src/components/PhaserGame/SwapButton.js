import Phaser from 'phaser';

class SwapButton extends Phaser.GameObjects.Container {
    constructor(scene, x, y, atlas, frameNames, btnNum, onClick, 
        scale = 3, angle=90, command,) {
        super(scene, x, y);

        // The sprite for our button
        this.sprite = new Phaser.GameObjects.Sprite(scene, 0, 0, atlas, frameNames[0]);
        this.sprite.setScale(scale);
        this.sprite.setAngle(angle);

        // Command and Button Number
        this.command = command;
        this.btnNum = btnNum;

        // Add sprite to container
        this.add(this.sprite);

        // Start off as inactive
        this.active = true;

        // Add pointerdown event
        this.sprite.setInteractive({ useHandCursor: true });
        this.sprite.on('pointerdown', () => {
            if (this.active) {
                if (onClick) onClick(this.btnNum);
            }
        });

        // Set the size of the container to match the sprite
        this.setSize(this.sprite.width, this.sprite.height);
    }

    setActive(active) {
        this.active = active;
        this.sprite.setFrame(this.active ? 1 : 0); // Use different frame when active
    }
}

export default SwapButton;
