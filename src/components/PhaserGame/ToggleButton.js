import Phaser from 'phaser'

export default class ToggleButton extends Phaser.GameObjects.Container {
    constructor(scene, x, y, texture, frames, onClick, scale=3, labelText = '', angle=90, 
        delay=1000, updateFrames = true, ) {
        super(scene, x, y);

        this.image = new Phaser.GameObjects.Image(scene, 0, 0, texture, frames[0]);
        this.image.setScale(scale);
        this.image.setInteractive();
        this.add(this.image); // Add image to the container

        // Add text label underneath the button
        const labelOffsetY = this.image.height * scale * 0.5 + 5; // You may need to adjust this value
        this.label = new Phaser.GameObjects.Text(scene, 0, labelOffsetY, labelText, { font: '37px Arial', fill: '#000' });
        this.label.setOrigin(0.5, 0); // Set origin to the horizontal center, top of the text
        this.add(this.label); // Add text to the container

        this.setAngle(angle); // Set the angle for the entire container


        // Add a property to track if the button can be clicked
        this.canClick = true;

        // List of frames to cycle through
        this.frames = frames;

        // Index of the current frame
        this.currentFrameIndex = 0;

        this.on('pointerdown', function() {
            // If the button is not ready to be clicked, return
            if (!this.canClick) return;

            // Set the button to not clickable
            this.canClick = false;

            if(updateFrames){
                
            }
            // Increment currentFrameIndex and use modulus to wrap around the frames array
            this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frames.length;

            // Update the image
            this.setFrame(this.frames[this.currentFrameIndex]);

            // Call the provided callback function
            if (onClick) onClick(this.frames[this.currentFrameIndex]);

            // Use Phaser's time events to re-enable the button after delay in ms
            this.scene.time.delayedCall(delay, function() {
                this.canClick = true;
            }, [], this);
        });
        scene.add.existing(this); // Don't forget to add the container to the scene

    }
}
