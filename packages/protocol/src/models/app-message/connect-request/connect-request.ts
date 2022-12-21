import { ConnectItem } from './connect-item';

export interface ConnectRequest {
    manifestUrl: string;
    items: ConnectItem[];
}
