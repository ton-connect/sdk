import { useState, useEffect } from 'react';
import './FailModal.scss';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (message: string) => void;
    isSubmitting: boolean;
    initialMessage?: string;
};

export function FailModal({ isOpen, onClose, onSubmit, isSubmitting, initialMessage = '' }: Props) {
    const [message, setMessage] = useState('');

    // Set initial message when modal opens
    useEffect(() => {
        if (isOpen && initialMessage) {
            setMessage(initialMessage);
        }
    }, [isOpen, initialMessage]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(message.trim());
        setMessage('');
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setMessage('');
            onClose();
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fail-modal-overlay" onClick={handleClose}>
            <div className="fail-modal" onClick={e => e.stopPropagation()}>
                <div className="fail-modal__header">
                    <h3 className="fail-modal__title">Mark Test Case as Failed</h3>
                    <button
                        className="fail-modal__close"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="fail-modal__form">
                    <div className="fail-modal__field">
                        <label className="fail-modal__label">Failure Reason</label>
                        <textarea
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder="Describe why the test case failed..."
                            className="fail-modal__textarea"
                            rows={6}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="fail-modal__actions">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="btn btn-secondary"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-danger" disabled={isSubmitting}>
                            {isSubmitting ? 'Marking as Failed...' : 'Mark as Failed'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
