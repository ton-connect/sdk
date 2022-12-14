import { ConnectItem } from './connect-item';
import { ReturnStrategy } from '../return-strategy';

export interface ConnectRequest {
    manifestUrl: string;
    items: ConnectItem[];
    return: ReturnStrategy;
}
