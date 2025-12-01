import { Robot } from './robot.ts'
import { Field } from './field.ts';
import { fieldControl, menuButtons, splitArcade } from './control.ts';
import { PID, type PIDConstants } from './drive/PID.ts';
import { driveDistance, turnToAngle } from './driveMotions.ts';

let robot = new Robot(
    14, // Width (inches)
    14, // Height (inches)
    6, // Speed (ft/s)
    16,  // Track Radius (inches)
    15 // Max Accel (ft/s^2)
);

let fields = [
    new Field("./push_back_skills.png", [
        { x: 195, y: 462, w: 190, h: 25 },
        { x: 195, y: 88, w: 190, h: 25 },
    ]),
    new Field("./empty_field.png"),
    new Field("./high_stakes_skills.png"),
]

const kturnPID: PIDConstants = {
    maxSpeed: 1,
    minSpeed: 0,
    kp: .4,
    ki: .03,
    kd: 3,
    starti: 15,
    settleTime: 100,
    settleError: 1,
    timeout: 3000
}

const kDrivePID: PIDConstants = {
    maxSpeed: .8,
    minSpeed: 0,
    kp: 1.5,
    ki: 0,
    kd: 10,
    starti: 0,
    settleTime: 300,
    settleError: 1.5,
    timeout: 5000
}

const kHeadingPID: PIDConstants = {
    maxSpeed: .5,
    minSpeed: 0,
    kp: .4,
    ki: 0,
    kd: 1,
    starti: 0,
    settleTime: 300,
    settleError: 1.5,
    timeout: 5000
}

const turnPID = new PID(kturnPID);
const drivePID = new PID(kDrivePID);
const headingPID = new PID(kHeadingPID);

let autoIdx = 0;

let auton = [
    (field: Field, dt: number): boolean => { return turnToAngle(robot, field, dt, 90, 1, turnPID);}, 
    (field: Field, dt: number): boolean => { return driveDistance(robot, field, dt, 20, robot.get_angle(), .8, .5, drivePID, headingPID);}
];


function update(dt: number) {
    const field = fieldControl(fields);

    if (autoIdx < auton.length) {
        const done = auton[autoIdx](field, dt);
        if (done) autoIdx++;
    }

    menuButtons(robot); 
    robot.render();
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

