import type { Field } from "../field";
import { Robot } from "../robot";

export interface Snapshot {
    t: number,
    x: number,
    y: number,
    angle: number
}

export interface Path {
    totalTime: number,
    trajectory: Snapshot[];
}

export let trajectory: Snapshot[] = [];

export function precomputePath(
    robot: Robot,
    auton: ((robot: Robot, field: Field, dt: number) => boolean)[], 
    field: Field
): Path 
{   
    let autoIdx = 0;
    trajectory = [];

    const dt = 1 / 60; // Sim is run at 60 hertz

    let t = 0;
    let safetyIter = 0;
    const maxIter = 60 * 60;

    while (autoIdx < auton.length && safetyIter < maxIter) {
        const done = auton[autoIdx](robot, field, dt);
        if (done) autoIdx++;

        trajectory.push({
            t,
            x: robot.get_x(),
            y: robot.get_y(),
            angle: robot.get_angle()
        });

        t += dt;
        safetyIter++;
    }

    return {totalTime: t, trajectory: trajectory};    
}