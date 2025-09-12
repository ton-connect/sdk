import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { Textarea } from '../../../ui/textarea';
import { Label } from '../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';

type StatusModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (status: 'passed' | 'failed', reason?: string) => void;
    initialStatus: 'passed' | 'failed';
    initialReason?: string;
    isSubmitting?: boolean;
};

export function StatusModal({
    isOpen,
    onClose,
    onSubmit,
    initialStatus,
    initialReason = '',
    isSubmitting = false
}: StatusModalProps) {
    const [selectedStatus, setSelectedStatus] = useState<'passed' | 'failed'>(initialStatus);
    const [reason, setReason] = useState('');

    useEffect(() => {
        if (isOpen) {
            setSelectedStatus(initialStatus);
            setReason(initialReason);
        }
    }, [isOpen, initialStatus, initialReason]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(selectedStatus, reason.trim() || undefined);
    };

    return (
        <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
                <DialogHeader className="space-y-3">
                    <DialogTitle className="text-xl font-semibold">Update Test Status</DialogTitle>
                    <DialogDescription className="text-base">
                        Set the status for this test and provide details about your decision. This
                        information will be saved with the test result.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                        <Label htmlFor="status" className="text-base font-medium">
                            Status
                        </Label>
                        <Select
                            value={selectedStatus}
                            onValueChange={value => setSelectedStatus(value as 'passed' | 'failed')}
                        >
                            <SelectTrigger className="h-11">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="passed" className="py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="font-medium">Passed</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="failed" className="py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <span className="font-medium">Failed</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="reason" className="text-base font-medium">
                            Reason{' '}
                            {selectedStatus === 'failed'
                                ? '(required for failed tests)'
                                : '(optional)'}
                        </Label>
                        <Textarea
                            id="reason"
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder={
                                selectedStatus === 'failed'
                                    ? 'Describe why the test failed (e.g., specific error, expected vs actual behavior)...'
                                    : 'Provide additional context for this status...'
                            }
                            rows={6}
                            className="resize-none"
                        />
                        {selectedStatus === 'failed' && !reason.trim() && (
                            <p className="text-sm text-red-500">
                                Please provide a reason for marking this test as failed
                            </p>
                        )}
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="sm:flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant={selectedStatus === 'passed' ? 'default' : 'destructive'}
                            disabled={
                                isSubmitting || (selectedStatus === 'failed' && !reason.trim())
                            }
                            className="sm:flex-1"
                        >
                            {isSubmitting
                                ? 'Updating...'
                                : `Mark as ${selectedStatus === 'passed' ? 'Passed' : 'Failed'}`}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
