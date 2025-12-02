import { Robot } from './robot.ts';
import { Field } from './field.ts';
import { fieldControl, menuButtons, slider } from './control.ts';
import { PID } from './drive/PID.ts';
import { driveDistance, driveToPoint, turnToAngle } from './drive/driveMotions.ts';
import { kOdomDrivePID, kOdomHeadingPID, kturnPID } from './drive/PIDconstants.ts';
import { precomputePath } from './drive/trajectory.ts';

let robot = new Robot(
    -55, // Start x
    -12, // Start y
    110, // Start angle
    14, // Width (inches)
    14, // Height (inches)
    6, // Speed (ft/s)
    16,  // Track Radius (inches)
    15 // Max Accel (ft/s^2)
);

let fields = [
    new Field("./push_back_skills.png", [
        // { x: 195, y: 462, w: 190, h: 25 },
        // { x: 195, y: 88, w: 190, h: 25 },
    ]),
    new Field("./empty_field.png"),
    new Field("./high_stakes_skills.png"),
]

const turnPID = new PID(kturnPID);
const drivePID = new PID(kOdomDrivePID);
const headingPID = new PID(kOdomHeadingPID);

let auton = [
    (robot: Robot, field: Field, dt: number):boolean =>{return driveToPoint(robot, field, dt, -23, -24, drivePID, headingPID);},
    (robot: Robot, field: Field, dt: number):boolean =>{return driveToPoint(robot, field, dt, -11, -38, drivePID, headingPID);},
    (robot: Robot, field: Field, dt: number):boolean =>{return driveToPoint(robot, field, dt, -26, -27, drivePID, headingPID);},
    (robot: Robot, field: Field, dt: number):boolean =>{return turnToAngle(robot, field, dt, -139, turnPID);},
    (robot: Robot, field: Field, dt: number):boolean =>{return driveToPoint(robot, field, dt, -42, -46, drivePID, headingPID);},
    (robot: Robot, field: Field, dt: number):boolean =>{return turnToAngle(robot, field, dt, 270, turnPID);},
    (robot: Robot, field: Field, dt: number):boolean =>{return driveDistance(robot, field, dt, 15, robot.get_angle(), drivePID, headingPID);},
    (robot: Robot, field: Field, dt: number):boolean =>{return driveDistance(robot, field, dt, -22, robot.get_angle(), drivePID, headingPID);},
];

const path = precomputePath(robot, auton, fields[0])

console.log(path.trajectory.length)

function update(dt: number) {
    menuButtons(robot)
    fieldControl(fields);
    slider(robot, path);
    // robot.pathFollow(path, dt)

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

