import { isObject } from './isObject';

export const isTextDocument = (d: unknown): d is { type: 'TEXT'; style: Record<string, unknown> } =>
  isObject(d) &&
  'type' in d &&
  (d as { type?: unknown }).type === 'TEXT' &&
  'style' in d &&
  isObject(d.style);
