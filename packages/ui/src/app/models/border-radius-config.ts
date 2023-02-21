import { BorderRadius } from 'src/models';

export type BorderRadiusConfig = Record<BorderRadius, `${number}px` | `${number}%` | `100vh` | '0'>;
