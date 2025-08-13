export type TailwindThemeNamespace =
  | 'color'
  | 'font'
  | 'text'
  | 'font-weight'
  | 'tracking'
  | 'leading'
  | 'radius'
  | 'shadow'
  | 'custom';

export type CssVar = {
  namespace: TailwindThemeNamespace;
  key: string;
  value: string | number | boolean;
};
