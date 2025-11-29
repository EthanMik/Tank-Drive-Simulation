import { to_px, to_pxx, to_pxy, to_inertial_rad, clamp, to_rad, to_deg, reduce_0_360 } from './util.ts';
import { ctx } from './globals.ts';

export class Robot {
    public width: number;
    public height: number;
    public maxSpeed: number;
    public trackWidth: number;
    private x: number = 0;
    private y: number = 0;
    private angle: number = 0;
    private color: string;

    private dt: number = 0;

    constructor(width: number, height: number, maxSpeed: number, trackWidth: number) {
        this.width = width;
        this.height = height;
        this.maxSpeed = maxSpeed;
        this.trackWidth = trackWidth;
        this.color = '#969696ff'
    }

    private set_x(x: number) { (this.x = clamp(x, -72 + this.width / 2, 72 - this.width / 2)); }
    private set_y(y: number) { this.y =  clamp(y, -72 + this.height / 2, 72 - this.height / 2); }
    private set_angle(angle: number) { this.angle = ((angle % 360) + 360) % 360; }

    get_x() { return this.x; }
    get_y() { return this.y }
    get_angle() { return this.angle; }

    tankDrive(leftCmd: number, rightCmd: number) {
        const b = this.trackWidth;
        const v_max = this.maxSpeed;

        const left = clamp(leftCmd, -1, 1);
        const right = clamp(rightCmd, -1, 1);

        const vL = left * v_max;
        const vR = right * v_max;

        const v = (vR + vL) / 2;
        const ω = (vL - vR) / b;

        const θdeg = this.get_angle();
        const θ = to_rad(θdeg);

        const forwardX = Math.sin(θ);
        const forwardY = Math.cos(θ);

        const xNew = this.get_x() + v * forwardX * this.dt;
        const yNew = this.get_y() + v * forwardY * this.dt;

        const θNew = θ + ω * this.dt;
        let θdegNew = to_deg(θNew);

        θdegNew = reduce_0_360(θdegNew);

        this.set_x(xNew);
        this.set_y(yNew);
        this.set_angle(θdegNew);
    }

    private draw_odom_data() {
        ctx.save();
        ctx.font = '20px Calibri';
        ctx.fillStyle = 'white';
        ctx.textBaseline = 'top';
        ctx.fillText(`θ: ${this.get_angle().toFixed(2)}`, 20, 20);
        ctx.fillText(`X: ${this.get_x().toFixed(2)}`, 20, 45);
        ctx.fillText(`Y: ${this.get_y().toFixed(2)}`, 20, 70);
        ctx.restore();
    }

    private draw_chassis() {
        ctx.save();

        ctx.translate(to_pxx(this.x), to_pxy(this.y));
        ctx.rotate(to_inertial_rad(this.angle));
        ctx.fillStyle = this.color;
        ctx.fillRect(-to_px(this.width) / 2, -to_px(this.height) / 2, to_px(this.width), to_px(this.height));

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(to_px(this.width) / 2, 0);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    }

    render(dt: number) {
        this.draw_chassis();
        this.draw_odom_data();
        this.dt = dt;
    }
}