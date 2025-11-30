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

let empty_field = loadImage("./assets/empty_field.png");
    
export function draw_field_control() {        
    ctx.drawImage(empty_field, 0, 0, canvas.width, canvas.height);
}

export function control(robot: Robot, dt: number) {
    let throttle = 0;
    let turn = 0;

    if (keysPressed['w']) throttle += 1;
    if (keysPressed['s']) throttle -= 1;
    if (keysPressed['d']) turn += .5;
    if (keysPressed['a']) turn -= .5;


    const leftCmd = throttle + turn;
    const rightCmd = throttle - turn;

    robot.tankDrive(leftCmd, rightCmd, dt);
}