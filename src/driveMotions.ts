import { PID, type PIDConstants } from "./drive/PID";
import type { Field } from "./field";
import type { Robot } from "./robot";
import { clamp, clamp_min_voltage, is_line_settled, reduce_negative_180_to_180, reduce_negative_90_to_90, to_deg, to_rad } from "./util";

export function turnToAngle(robot: Robot, field: Field, dt: number, angle: number, maxSpeed: number, pid: PID) {
    const error = reduce_negative_180_to_180(angle - robot.get_angle());

    if (pid.isSettled()) {
        robot.tankDrive(0, 0, field, dt);
        return true;
    }

    let output = pid.compute(error);
    output = clamp(output, -maxSpeed, maxSpeed);
    robot.tankDrive(output, -output, field, dt);

    return false;
}

let driveDistanceStartPos: number | null = null;

export function driveDistance(robot: Robot, field: Field, dt: number, distance: number, heading: number, driveMaxSpeed: number, headingMaxSpeed: number, drivePid: PID, headingPid: PID) {
    
    if (driveDistanceStartPos === null) {
        driveDistanceStartPos = Math.hypot(robot.get_x(), robot.get_y());
    }

    const currentPos = Math.hypot(robot.get_x(), robot.get_y());
    const traveled = currentPos - driveDistanceStartPos;

    const drive_error = distance - traveled;

    const heading_error = reduce_negative_180_to_180(heading - robot.get_angle());

    let drive_output = drivePid.compute(drive_error);
    let heading_output = headingPid.compute(heading_error);

    drive_output = clamp(drive_output, -driveMaxSpeed, driveMaxSpeed);
    heading_output = clamp(heading_output, -headingMaxSpeed, headingMaxSpeed);

    if (drivePid.isSettled()) {
        robot.tankDrive(0, 0, field, dt);
        driveDistanceStartPos = null; 
        return true;
    }

    robot.tankDrive(drive_output + heading_output, drive_output - heading_output, field, dt);

    return false;
}


export function driveToPoint(robot: Robot, x: number, y: number, kdrivePID: PIDConstants, kheadingPID: PIDConstants) {

    const drivePID = new PID(kdrivePID.kp, kdrivePID.ki, kdrivePID.kd, kdrivePID.starti, kdrivePID.settleTime, kdrivePID.settleError, kdrivePID.timeout);
    const headingPID = new PID(kheadingPID.kp, kheadingPID.ki, kheadingPID.kd, kheadingPID.starti, kheadingPID.settleTime, kheadingPID.settleError, kheadingPID.timeout);

    let line_settled = false;
    const heading = to_deg(Math.atan2(x - robot.get_x(), y - robot.get_y()));
    let prev_line_settled = is_line_settled(x, y, heading, robot.get_x(), robot.get_y());
    let drive_error = Math.hypot(x - robot.get_x(), y - robot.get_y());
    let prev_drive_error = drive_error;

    while(!drivePID.isSettled()) {
        const heading = to_deg(Math.atan2(x - robot.get_x(), y - robot.get_y()));
        line_settled = is_line_settled(x, y, heading, robot.get_x(), robot.get_y());
        if (line_settled && !prev_line_settled) { break; }
        prev_line_settled = line_settled;

        drive_error = Math.hypot(x - robot.get_x(), y - robot.get_y());
        // chassis.distance_traveled += Math.abs(drive_error - prev_drive_error);
        prev_drive_error = drive_error;

        let heading_error = reduce_negative_180_to_180(to_deg(Math.atan2(x - robot.get_x(), y - robot.get_y())) - robot.get_angle());
        let drive_output = drivePID.compute(drive_error);

        let heading_scale_factor = Math.cos(to_rad(heading_error));
        drive_output *= heading_scale_factor;
        heading_error = reduce_negative_90_to_90(heading_error);
        let heading_output = headingPID.compute(heading_error);
        
        if (drive_error < kdrivePID.settleError) { heading_output = 0; }

        drive_output = clamp(drive_output, -Math.abs(heading_scale_factor) * kdrivePID.maxSpeed, Math.abs(heading_scale_factor) * kdrivePID.maxSpeed);
        heading_output = clamp(heading_output, -kheadingPID.maxSpeed, kheadingPID.maxSpeed);

        drive_output = clamp_min_voltage(drive_output, kdrivePID.minSpeed);

        // robot.tankDrive(left_voltage_scaling(drive_output, heading_output), right_voltage_scaling(drive_output, heading_output));
    }

}