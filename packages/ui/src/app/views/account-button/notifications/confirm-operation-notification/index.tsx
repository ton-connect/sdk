import { Component } from 'solid-js';
import { LoaderIcon } from 'src/app/components';
import { Notification } from 'src/app/components/notification';

interface ConfirmOperationNotificationProps {}

export const ConfirmOperationNotification: Component<ConfirmOperationNotificationProps> = () => {
    return <Notification icon={<LoaderIcon />}>Confirm operation in your wallet</Notification>;
};
