import { isObject } from './isObject';

export const hasFills = (d: unknown): d is { fills: unknown[] } =>
  isObject(d) && Array.isArray(d.fills);
