import { ITonConnect } from '@tonconnect/sdk';
import { createContext } from 'solid-js';

export const ConnectorContext = createContext<ITonConnect>();
