import React, { useState } from 'react';
import { useGetTestplansQuery, useRunTestplanMutation } from '../../../store/api/allureApi';
import { DEFAULT_PROJECT_ID } from '../../../constants';
import './CreateLaunchModal.scss';

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

    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal__header">
                    <h3 className="modal__title">Create New Launch</h3>
                    <button className="modal__close" onClick={handleClose} disabled={isCreating}>
                        ×
                    </button>
                </div>

                <form className="modal__form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="launch-name" className="form-label">
                            Launch Name
                        </label>
                        <input
                            id="launch-name"
                            type="text"
                            className="form-input"
                            value={launchName}
                            onChange={e => setLaunchName(e.target.value)}
                            placeholder="Enter launch name"
                            required
                            disabled={isCreating}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="testplan-select" className="form-label">
                            Testplan
                        </label>
                        <select
                            id="testplan-select"
                            className="form-select"
                            value={selectedTestplanId || ''}
                            onChange={e => setSelectedTestplanId(Number(e.target.value) || null)}
                            required
                            disabled={isCreating || testplansLoading}
                        >
                            <option value="">
                                {testplansLoading ? 'Loading testplans...' : 'Select testplan'}
                            </option>
                            {testplans?.content.map(testplan => (
                                <option key={testplan.id} value={testplan.id}>
                                    {testplan.name} ({testplan.testCasesCount} test cases)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="modal__actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleClose}
                            disabled={isCreating}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isCreating || !selectedTestplanId || !launchName.trim()}
                        >
                            {isCreating ? (
                                <>
                                    <span className="btn__spinner"></span>
                                    Creating...
                                </>
                            ) : (
                                'Create Launch'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
