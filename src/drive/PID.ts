export interface PIDConstants {
    maxSpeed: number;
    minSpeed: number;
    kp: number, 
    ki: number, 
    kd: number, 
    starti: number, 
    settleTime: number, 
    settleError: number, 
    timeout: number
}

export class PID {
    public kp: number;
    public ki: number;
    public kd: number;
    
    public starti: number;
    public settleTime: number;
    public settleError: number;
    public timeout: number;

    private acculatedError = 0;
    private previousError = 0;
    private timeSpentSettled = 0;
    private timeSpentRunning = 0;

    constructor(kp: number, ki: number, kd: number, starti: number, settleTime: number, settleError: number, timeout: number);
    constructor(kPID: PIDConstants);

    constructor(kpOrPID: number | PIDConstants, ki?: number, kd?: number, starti?: number, settleTime?: number, settleError?: number, timeout?: number) {
        if (typeof kpOrPID === "number") {
            this.kp = kpOrPID;
            this.ki = ki as number;
            this.kd = kd as number;

            this.starti = starti as number;
            this.settleTime = settleTime as number;
            this.settleError = settleError as number;
            this.timeout = timeout as number;
        } else {
            const kPID = kpOrPID;
            this.kp = kPID.kp;
            this.ki = kPID.ki;
            this.kd = kPID.kd;

            this.starti = kPID.starti;
            this.settleTime = kPID.settleTime;
            this.settleError = kPID.settleError;
            this.timeout = kPID.timeout;
       }
    }

    public compute(error: number) {
        if (Math.abs(error) < this.starti){
            this.acculatedError += error;
        }
        if ((error > 0 && this.previousError < 0) || (error < 0 && this.previousError > 0)) { 
            this.acculatedError = 0; 
        }

        const output = this.kp * error + this.ki * this.acculatedError + this.kd * (error - this.previousError);

        this.previousError = error;

        if(Math.abs(error) < this.settleError) {
            this.timeSpentSettled += 10;
        } else {
            this.timeSpentSettled = 0;
        }

        this.timeSpentRunning += 10;

        return output;
    }

    public isSettled(): boolean {
        console.log(this.timeSpentRunning)
        if (this.timeSpentRunning > this.timeout && this.timeout != 0) {
            return true;
        }
        if (this.timeSpentSettled > this.settleTime) {
            return true;
        }
        return false;
    }
}