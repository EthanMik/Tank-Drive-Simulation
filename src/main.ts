import { Robot } from './robot.ts'
import { control, draw_field_control } from './control.ts'

let robot = new Robot(
    14, // Width
    14, // Height
);

function update() {
    draw_field_control();
    robot.render();
    control(robot);
}

let lastFrameTime = 0;
const fps = 60;
const frameDuration = 1000 / fps;

function render(timestamp: number) {
    if (timestamp - lastFrameTime >= frameDuration) {
        lastFrameTime = timestamp;
        update();
    }
    window.requestAnimationFrame(render);
}

render(0);

