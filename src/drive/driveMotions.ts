import { PID } from "./PID";
import type { Field } from "../field";
import type { Robot } from "../robot";
import { clamp, clamp_min_voltage, is_line_settled, left_voltage_scaling, reduce_negative_180_to_180, reduce_negative_90_to_90, right_voltage_scaling, to_deg, to_rad } from "../util";

export function turnToAngle(robot: Robot, field: Field, dt: number, angle: number, turnPID: PID) {
    const error = reduce_negative_180_to_180(angle - robot.get_angle());
    
    if (turnPID.isSettled()) {
        robot.tankDrive(0, 0, field, dt);
        turnPID.reset();
        return true;
    }

    let output = turnPID.compute(error);
    output = clamp(output, -turnPID.maxSpeed, turnPID.maxSpeed);
    robot.tankDrive(output, -output, field, dt);

    return false;
}

let driveDistanceStartPos: number | null = null;

export function driveDistance(robot: Robot, field: Field, dt: number, distance: number, heading: number, drivePID: PID, headingPID: PID) {
    if (driveDistanceStartPos === null) {
        driveDistanceStartPos = Math.hypot(robot.get_x(), robot.get_y());
    }

    const currentPos = Math.hypot(robot.get_x(), robot.get_y());
    const traveled = currentPos - driveDistanceStartPos;

    const drive_error = distance - traveled;

    const heading_error = reduce_negative_180_to_180(heading - robot.get_angle());

    let drive_output = drivePID.compute(drive_error);
    let heading_output = headingPID.compute(heading_error);

    drive_output = clamp(drive_output, -drivePID.maxSpeed, drivePID.maxSpeed);
    heading_output = clamp(heading_output, -headingPID.maxSpeed, headingPID.maxSpeed);

    if (drivePID.isSettled()) {
        robot.tankDrive(0, 0, field, dt);
        driveDistanceStartPos = null; 
        drivePID.reset();
        headingPID.reset();
        return true;
    }

    robot.tankDrive(drive_output + heading_output, drive_output - heading_output, field, dt);

    return false;
}

let prev_line_settled = false;

export function driveToPoint(robot: Robot, field: Field, dt: number, x: number, y: number, drivePID: PID, headingPID: PID) {
    let heading = to_deg(Math.atan2(x - robot.get_x(), y - robot.get_y()));
    let drive_error = Math.hypot(x - robot.get_x(), y - robot.get_y());

    if (drivePID.isSettled()) {
        robot.tankDrive(0, 0, field, dt);
        drivePID.reset();
        headingPID.reset();
        return true
    }

    const line_settled = is_line_settled(x, y, heading, robot.get_x(), robot.get_y());
    if (line_settled && !prev_line_settled) { return true; }
    prev_line_settled = line_settled;

    drive_error = Math.hypot(x - robot.get_x(), y - robot.get_y());

    let heading_error = reduce_negative_180_to_180(to_deg(Math.atan2(x - robot.get_x(), y - robot.get_y())) - robot.get_angle());
    let drive_output = drivePID.compute(drive_error);

    let heading_scale_factor = Math.cos(to_rad(heading_error));
    drive_output *= heading_scale_factor;
    heading_error = reduce_negative_90_to_90(heading_error);
    let heading_output = headingPID.compute(heading_error);
    
    if (drive_error < drivePID.settleError) { heading_output = 0; }

    drive_output = clamp(drive_output, -Math.abs(heading_scale_factor) * drivePID.maxSpeed, Math.abs(heading_scale_factor) * drivePID.maxSpeed);
    heading_output = clamp(heading_output, -headingPID.maxSpeed, headingPID.maxSpeed);

    drive_output = clamp_min_voltage(drive_output, drivePID.minSpeed);

    robot.tankDrive(left_voltage_scaling(drive_output, heading_output), right_voltage_scaling(drive_output, heading_output), field, dt);

    return false;
}