import Phaser from 'phaser'

export default class ToggleButton extends Phaser.GameObjects.Image {
    constructor(scene, x, y, texture, frames, onClick, scale=3, angle=90, 
        delay=1000, updateFrames = true) {
        super(scene, x, y, texture, frames[0]);
        this.setInteractive();

        this.setScale(scale);
        this.setAngle(angle);

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
    }
}
