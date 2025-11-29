import { to_px, to_pxx, to_pxy, to_inertial_rad, clamp } from './util.ts';
import { ctx } from './globals.ts';

export class Robot {
    public width: number;
    public height: number;
    private x: number = 0;
    private y: number = 0;
    private angle: number = 0;
    private color: string;

    constructor(width: number, height: number, color: string = '#969696ff') {
        this.width = width;
        this.height = height;
        this.color = color;
    }

    set_x(x: number) { (this.x = clamp(x, -72 + this.width / 2, 72 - this.width / 2)); }
    set_y(y: number) { this.y =  clamp(y, -72 + this.height / 2, 72 - this.height / 2); }
    set_angle(angle: number) { this.angle = ((angle % 360) + 360) % 360; }

    get_x() { return this.x; }
    get_y() { return this.y }
    get_angle() { return this.angle; }

    draw_odom_data() {
        ctx.save();
        ctx.font = '20px Calibri';
        ctx.fillStyle = 'white';
        ctx.textBaseline = 'top';
        ctx.fillText(`θ: ${this.get_angle()}`, 20, 20);
        ctx.fillText(`X: ${this.get_x()}`, 20, 45);
        ctx.fillText(`Y: ${this.get_y()}`, 20, 70);
        ctx.restore();
    }

    draw_chassis() {
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

    render() {
        this.draw_chassis();
        this.draw_odom_data();
    }
}