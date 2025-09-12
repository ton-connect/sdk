import React, { useState } from 'react';
import { useGetTestplansQuery, useRunTestplanMutation } from '../../../store/api/allureApi';
import { DEFAULT_PROJECT_ID } from '../../../constants';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '../../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Loader2 } from 'lucide-react';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onLaunchCreated: (launchId: number) => void;
};

export function CreateLaunchModal({ isOpen, onClose, onLaunchCreated }: Props) {
    const [launchName, setLaunchName] = useState('');
    const [selectedTestplanId, setSelectedTestplanId] = useState<number | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const { data: testplans, isLoading: testplansLoading } = useGetTestplansQuery({
        projectId: DEFAULT_PROJECT_ID
    });

    const [runTestplan] = useRunTestplanMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedTestplanId || !launchName.trim()) {
            return;
        }

        try {
            setIsCreating(true);
            const result = await runTestplan({
                id: selectedTestplanId,
                launchName: launchName.trim()
            }).unwrap();

            onLaunchCreated(result.id);
            onClose();
            setLaunchName('');
            setSelectedTestplanId(null);
        } catch (error) {
            console.error('Failed to create launch:', error);
            // TODO: Add error handling UI
        } finally {
            setIsCreating(false);
        }
    };

    const handleClose = () => {
        if (!isCreating) {
            onClose();
            setLaunchName('');
            setSelectedTestplanId(null);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={open => !open && handleClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Launch</DialogTitle>
                    <DialogDescription>
                        Create a new test launch by selecting a testplan and providing a name.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="launch-name">Launch Name</Label>
                        <Input
                            id="launch-name"
                            type="text"
                            value={launchName}
                            onChange={e => setLaunchName(e.target.value)}
                            placeholder="Enter launch name"
                            required
                            disabled={isCreating}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="testplan-select">Testplan</Label>
                        <Select
                            value={selectedTestplanId?.toString() || ''}
                            onValueChange={value =>
                                setSelectedTestplanId(value ? Number(value) : null)
                            }
                            disabled={isCreating || testplansLoading}
                        >
                            <SelectTrigger>
                                <SelectValue
                                    placeholder={
                                        testplansLoading
                                            ? 'Loading testplans...'
                                            : 'Select testplan'
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {testplans?.content.map(testplan => (
                                    <SelectItem key={testplan.id} value={testplan.id.toString()}>
                                        {testplan.name} ({testplan.testCasesCount} test cases)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isCreating}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isCreating || !selectedTestplanId || !launchName.trim()}
                        >
                            {isCreating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Launch'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
