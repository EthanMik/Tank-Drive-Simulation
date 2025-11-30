import { Robot } from './robot.ts'
import { control, draw_field_control } from './control.ts'

let robot = new Robot(
    14, // Width (inches)
    14, // Height (inches)
    6, // Speed (ft/s)
    16,  // Track Radius (inches)
    30 // Max Accel (ft/s^2)
);

function update(dt: number) {
    draw_field_control();
    robot.render();
    control(robot, dt);
}

let lastFrameTime = 0;
const fps = 60;
const frameDuration = 1000 / fps;

function render(timestamp: number) {
    let elaped = timestamp - lastFrameTime 
    if (elaped >= frameDuration) {
        lastFrameTime = timestamp;
        update(elaped / 1000);
    }
    window.requestAnimationFrame(render);
}

render(0);

