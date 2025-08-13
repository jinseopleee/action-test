import { to255 } from './to255';

export const rgbaToCss = ({
  r,
  g,
  b,
  a = 1,
}: {
  r: number;
  g: number;
  b: number;
  a?: number;
}): string => {
  if (a === 1) {
    return `rgb(${to255(r)}, ${to255(g)}, ${to255(b)})`;
  }

  return `rgba(${to255(r)}, ${to255(g)}, ${to255(b)}, ${a})`;
};
