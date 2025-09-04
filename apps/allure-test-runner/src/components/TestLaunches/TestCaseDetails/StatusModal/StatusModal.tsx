import { useState, useEffect } from 'react';
import './StatusModal.scss';

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

    if (!isOpen) return null;

    return (
        <div className="status-modal-overlay" onClick={onClose}>
            <div className="status-modal" onClick={e => e.stopPropagation()}>
                <div className="status-modal__header">
                    <h3>Set Test Status</h3>
                    <button className="status-modal__close" onClick={onClose}>
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="status-modal__form">
                    <div className="status-modal__status-selection">
                        <label htmlFor="status" className="status-modal__label">
                            Status:
                        </label>
                        <select
                            id="status"
                            value={selectedStatus}
                            onChange={e => setSelectedStatus(e.target.value as 'passed' | 'failed')}
                            className={`status-modal__select status-modal__select--${selectedStatus}`}
                        >
                            <option value="passed">Passed</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>

                    <div className="status-modal__reason">
                        <label htmlFor="reason" className="status-modal__label">
                            Reason (optional):
                        </label>
                        <textarea
                            id="reason"
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder="Enter reason for this status..."
                            className="status-modal__textarea"
                            rows={3}
                        />
                    </div>

                    <div className="status-modal__actions">
                        <button
                            type="button"
                            onClick={onClose}
                            className="status-modal__btn status-modal__btn--cancel"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`status-modal__btn status-modal__btn--submit ${
                                selectedStatus === 'passed'
                                    ? 'status-modal__btn--success'
                                    : 'status-modal__btn--danger'
                            }`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? 'Submitting...'
                                : `Mark as ${selectedStatus === 'passed' ? 'Passed' : 'Failed'}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
