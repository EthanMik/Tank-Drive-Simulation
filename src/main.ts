import { Robot } from './robot.ts'
import { control, draw_field_control } from './control.ts'

let robot = new Robot(
    14, // Width
    14, // Height
    25, // Speed
    .4  // Track Radius
);

function update(dt: number) {
    draw_field_control();
    robot.render(dt);
    control(robot);
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

