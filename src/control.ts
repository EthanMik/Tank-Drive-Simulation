import { loadImage } from './util.ts';
import { ctx, canvas } from './globals.ts';
import type { Robot } from './robot.ts';

const keysPressed = Object.create(null);
const keysHandled = Object.create(null);

document.addEventListener('keydown', (event) => {
    keysPressed[event.key] = true;
});

document.addEventListener('keyup', (event) => {
    keysPressed[event.key] = false;
    keysHandled[event.key] = false;
});

canvas.addEventListener('mousedown', (event) => {
  if (event.button === 0) {
    keysPressed.MouseLeft = true;
  }
});

window.addEventListener('mouseup', (event) => {
  if (event.button === 0) {
    keysPressed.MouseLeft = false;
    keysHandled.MouseLeft = false;
  }
});

let empty_field = loadImage("./assets/empty_field.png");
    
function draw_field_control() {        
    ctx.drawImage(empty_field, 0, 0, canvas.width, canvas.height);
}

function control(robot: Robot) {
    const move = 0.5;
    const rotate = 1;

    if (keysPressed['a']) {
        robot.set_x(robot.get_x() - move);
    } 
    if (keysPressed['d']) {
        robot.set_x(robot.get_x() + move);
    } 
    if (keysPressed['w']) {
        robot.set_y(robot.get_y() + move);
    } 
    if (keysPressed['s']) {
        robot.set_y(robot.get_y() - move);
    }
    if (keysPressed['ArrowLeft']) {
        robot.set_angle(robot.get_angle() - rotate);
    }
    if (keysPressed['ArrowRight']) {
        robot.set_angle(robot.get_angle() + rotate);
    } 
}

export { control, draw_field_control };