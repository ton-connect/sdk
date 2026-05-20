import type { FC } from 'react';

import { InfoBlock } from '@/core/components/ui/info-block';

import { Section } from './section';

interface DeviceSectionProps {
    appName: string;
    appVersion: string;
    platform: string;
    maxProtocolVersion: number;
}

export const DeviceSection: FC<DeviceSectionProps> = ({
    appName,
    appVersion,
    platform,
    maxProtocolVersion
}) => (
    <Section title="Device" testId="wallet-info-device">
        <InfoBlock.Row>
            <InfoBlock.Label>App</InfoBlock.Label>
            <InfoBlock.Value data-testid="wallet-info-device-app">
                {appName} {appVersion}
            </InfoBlock.Value>
        </InfoBlock.Row>
        <InfoBlock.Row>
            <InfoBlock.Label>Platform</InfoBlock.Label>
            <InfoBlock.Value data-testid="wallet-info-device-platform">{platform}</InfoBlock.Value>
        </InfoBlock.Row>
        <InfoBlock.Row>
            <InfoBlock.Label>Protocol</InfoBlock.Label>
            <InfoBlock.Value data-testid="wallet-info-device-protocol">
                v{maxProtocolVersion}
            </InfoBlock.Value>
        </InfoBlock.Row>
    </Section>
);
