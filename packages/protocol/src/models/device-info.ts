import { Feature } from './feature';

export interface DeviceInfo {
    platform: 'iphone' | 'ipad' | 'android' | 'windows' | 'mac' | 'linux' | 'browser';
    appName: string; // e.g. "Tonkeeper"
    appVersion: string; // e.g. "2.3.367"
    maxProtocolVersion: number;
    features: Feature[];
}
