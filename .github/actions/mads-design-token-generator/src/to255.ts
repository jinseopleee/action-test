export const to255 = (n: number) => Math.round(Math.max(0, Math.min(1, n)) * 255);
