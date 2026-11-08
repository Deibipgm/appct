export const TILE = 48;
export const VIEW_W = 960;
export const VIEW_H = 528;
export const ROWS = 11;

export const GRAVITY = 0.85;
export const MAX_FALL = 16;
export const MOVE_SPEED = 4.3;
export const RUN_SPEED = 6.1;
export const JUMP_VY = -15.2;

export const PLAYER_W = 30;
export const PLAYER_H = 44;

export const STEP = 1 / 60;

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));