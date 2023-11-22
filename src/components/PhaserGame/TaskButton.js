import Phaser from 'phaser';

class TaskButton extends Phaser.GameObjects.Container {
    constructor(scene, x, y, atlas, frameNames, btnNum, onClick, 
        scale = 3, labelText = '', angle=90, command,) {
        super(scene, x, y);

        // The sprite for our button
        this.sprite = new Phaser.GameObjects.Sprite(scene, 0, 0, atlas, frameNames[0]);
        this.sprite.setScale(scale);
        this.sprite.setAngle(angle);
        this.sprite.setTint(0xFF6EC7);
        
        this.frameNames = frameNames;

        // Command and Button Number
        this.command = command;
        this.btnNum = btnNum;

        // Add sprite to container
        this.add(this.sprite);

        // Add text label underneath the button
        const labelOffsetY = this.sprite.height * scale * 0.5 + 5;
        this.label = new Phaser.GameObjects.Text(scene, 0, labelOffsetY, labelText, { font: '37px Arial', fill: '#000' });
        this.label.setOrigin(0.5, 0);
        this.add(this.label);

        // Start off as inactive
        this.active = true;

        // Add pointerdown event
        this.sprite.setInteractive({ useHandCursor: true });
        this.sprite.on('pointerdown', () => {
            if (this.active) {
                this.sprite.setFrame(this.frameNames[1]);
                if (onClick) onClick(this.btnNum);
            }
        });

        // Set the size of the container to match the sprite
        this.setSize(this.sprite.width, this.sprite.height);
    }

    updateLabel(newText) {
        console.log('updatingLabel: ' + this.btnNum + ' ' + newText)
        this.label.setText(newText);
    }
}

export default TaskButton;
