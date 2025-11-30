import { deadband, loadImage } from './util.ts';
import { ctx, canvas } from './globals.ts';
import type { Robot } from './robot.ts';

let gamepadIdx: number | null = null;

window.addEventListener('gamepadconnected', (e: GamepadEvent) => {
    gamepadIdx = e.gamepad.index;
});

window.addEventListener('gamepaddisconnected', (e: GamepadEvent) => {
    if (gamepadIdx === e.gamepad.index) {
        gamepadIdx = null;
    }
});

function getGamepad(): Gamepad | null {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    if (!gamepads) return null;

    if (gamepadIdx != null && gamepads[gamepadIdx]) {
        return gamepads[gamepadIdx]!;
    }

    return null;
}

const keysPressed = Object.create(null);
const keysHandled = Object.create(null);

document.addEventListener('keydown', (event) => {
    keysPressed[event.key] = true;
});

document.addEventListener('keyup', (event) => {
    keysPressed[event.key] = false;
    keysHandled[event.key] = false;
});

let empty_field = loadImage("./empty_field.png");
    
export function draw_field_control() {        
    ctx.drawImage(empty_field, 0, 0, canvas.width, canvas.height);
}

const DEADZONE = 0.15;

export function controlGamePad(gamepad: Gamepad, robot: Robot, dt: number) {
    
    const axes = gamepad.axes;

    const throttle = deadband(-axes[1], DEADZONE);
    const turn = deadband(axes[2], DEADZONE);

    robot.tankDrive(throttle + turn, throttle - turn, dt);
}

export function control(robot: Robot, dt: number) {
    const gp = getGamepad();
    if (gp) { return controlGamePad(gp, robot, dt); }
    let throttle = 0;
    let turn = 0;
    let accel = 0;

    if (keysPressed['w']) throttle += 1;
    if (keysPressed['s']) throttle -= 1;
    if (keysPressed['d']) turn += .5;
    if (keysPressed['a']) turn -= .5;

    if (keysPressed['q'])  accel = -1;
    if (keysPressed['e'])  accel = 1;

    robot.maxAccel += accel;

    const leftCmd = throttle + turn;
    const rightCmd = throttle - turn;

    robot.tankDrive(leftCmd, rightCmd, dt);
}