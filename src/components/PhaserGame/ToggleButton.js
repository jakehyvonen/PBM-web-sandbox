import Phaser from 'phaser'

export default class ToggleButton extends Phaser.GameObjects.Image {
    constructor(scene, x, y, texture, frames, onClick) {
        super(scene, x, y, texture, frames[0]);
        this.setInteractive();

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

            // Increment currentFrameIndex and use modulus to wrap around the frames array
            this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frames.length;

            // Update the image
            this.setFrame(this.frames[this.currentFrameIndex]);

            // Call the provided callback function
            if (onClick) onClick(this.frames[this.currentFrameIndex]);

            // Use Phaser's time events to re-enable the button after 500ms
            this.scene.time.delayedCall(500, function() {
                this.canClick = true;
            }, [], this);
        });
    }
}
