import { useTestSteps } from './hooks/useTestSteps';
import type { TestResultWithCustomFields } from '../../../models';

type TestStepsProps = {
    testResult: TestResultWithCustomFields;
};

export function TestSteps({ testResult }: TestStepsProps) {
    const {
        isStepsExpanded,
        openDropdown,
        dropdownPosition,
        toggleStepsExpanded,
        handleStatusSelect,
        handleDropdownToggle,
        canEditStepStatus,
        getCurrentStepStatus
    } = useTestSteps(testResult);

    if (!testResult.execution?.steps || testResult.execution.steps.length === 0) {
        return null;
    }

    return (
        <div className="testcase-steps">
            <div
                className="testcase-steps__header"
                onClick={toggleStepsExpanded}
                style={{ cursor: 'pointer', userSelect: 'none' }}
            >
                <div className="testcase-steps__title">
                    <span>Test Steps</span>
                    <span className="testcase-steps__count">
                        ({testResult.execution.steps.length})
                    </span>
                </div>
                <div className="testcase-steps__toggle">{isStepsExpanded ? '▼' : '▶'}</div>
            </div>

            {isStepsExpanded && (
                <div className="testcase-steps__content">
                    <ol className="testcase-steps__list">
                        {testResult.execution.steps.map((step, index) => {
                            const isEditable = canEditStepStatus(testResult.status);
                            const currentStatus = getCurrentStepStatus(step, index, isEditable);

                            return (
                                <li key={index} className="testcase-steps__item">
                                    {isEditable ? (
                                        <div
                                            className="testcase-steps__item-row"
                                            onClick={e => handleDropdownToggle(index, e)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="testcase-steps__item-header">
                                                <span className="testcase-steps__item-number">
                                                    {index + 1}.
                                                </span>

                                                <div className="testcase-steps__dropdown-container">
                                                    <span
                                                        className={`testcase-steps__status-indicator ${
                                                            currentStatus
                                                                ? `testcase-steps__status-indicator--${currentStatus}`
                                                                : 'testcase-steps__status-indicator--empty'
                                                        }`}
                                                    >
                                                        {currentStatus === 'passed' && '✓'}
                                                        {currentStatus === 'failed' && '✕'}
                                                        {currentStatus === 'skipped' && '−'}
                                                        {currentStatus === null && ''}
                                                    </span>

                                                    {openDropdown === index && dropdownPosition && (
                                                        <div
                                                            className="testcase-steps__dropdown"
                                                            style={{
                                                                position: 'absolute',
                                                                left: dropdownPosition.x,
                                                                top: dropdownPosition.y,
                                                                zIndex: 9999
                                                            }}
                                                        >
                                                            <button
                                                                className="testcase-steps__dropdown-item"
                                                                onClick={e =>
                                                                    handleStatusSelect(
                                                                        index,
                                                                        'passed',
                                                                        currentStatus,
                                                                        e
                                                                    )
                                                                }
                                                            >
                                                                <span className="testcase-steps__dropdown-icon testcase-steps__dropdown-icon--passed">
                                                                    ✓
                                                                </span>
                                                                Passed
                                                            </button>
                                                            <button
                                                                className="testcase-steps__dropdown-item"
                                                                onClick={e =>
                                                                    handleStatusSelect(
                                                                        index,
                                                                        'failed',
                                                                        currentStatus,
                                                                        e
                                                                    )
                                                                }
                                                            >
                                                                <span className="testcase-steps__dropdown-icon testcase-steps__dropdown-icon--failed">
                                                                    ✕
                                                                </span>
                                                                Failed
                                                            </button>
                                                            <button
                                                                className="testcase-steps__dropdown-item"
                                                                onClick={e =>
                                                                    handleStatusSelect(
                                                                        index,
                                                                        'skipped',
                                                                        currentStatus,
                                                                        e
                                                                    )
                                                                }
                                                            >
                                                                <span className="testcase-steps__dropdown-icon testcase-steps__dropdown-icon--skipped">
                                                                    −
                                                                </span>
                                                                Skipped
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                <span className="testcase-steps__item-text">
                                                    {step.body || step.type}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="testcase-steps__item-row">
                                            <div className="testcase-steps__item-header">
                                                <span className="testcase-steps__item-number">
                                                    {index + 1}.
                                                </span>
                                                <div className="testcase-steps__dropdown-container">
                                                    <span
                                                        className={`testcase-steps__status-indicator ${
                                                            currentStatus
                                                                ? `testcase-steps__status-indicator--${currentStatus}`
                                                                : 'testcase-steps__status-indicator--empty'
                                                        }`}
                                                    >
                                                        {currentStatus === 'passed' && '✓'}
                                                        {currentStatus === 'failed' && '✕'}
                                                        {currentStatus === 'skipped' && '−'}
                                                        {currentStatus === null && ''}
                                                    </span>
                                                </div>
                                                <span className="testcase-steps__item-text">
                                                    {step.body || step.type}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                </div>
            )}
        </div>
    );
}
