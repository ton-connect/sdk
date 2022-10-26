import { ConnectItem } from './connect-item';

export interface ConnectRequest {
    name: string;
    url: string;
    icon: string;
    items: ConnectItem[];
}
