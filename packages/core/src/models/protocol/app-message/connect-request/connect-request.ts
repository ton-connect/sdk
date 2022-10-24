import { ConnectItem } from 'src/models/protocol/app-message/connect-request/connect-item';

export interface ConnectRequest {
    name: string;
    url: string;
    icon: string;
    items: ConnectItem[];
}
