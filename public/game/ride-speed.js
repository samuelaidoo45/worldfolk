export const RIDE_SPEEDS=[1,2,4,8];
export const DEFAULT_RIDE_SPEED=4;
// Road simulation tops out at 22 m/s; allow its fastest supported time scale.
export const MAX_RIDE_PROGRESS_SPEED=22*Math.max(...RIDE_SPEEDS)+4;
export const nextRideSpeed=rate=>RIDE_SPEEDS[(RIDE_SPEEDS.indexOf(rate)+1)%RIDE_SPEEDS.length];
