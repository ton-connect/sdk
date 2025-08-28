import './OperationTypeField.scss';

type Props = {
    operationType?: string;
};

export function OperationTypeField({ operationType }: Props) {
    if (!operationType) {
        return null;
    }

    const formatOperationType = (type: string) => {
        // Форматируем название операции для более читаемого вида
        return type
            .replace(/([A-Z])/g, ' $1') // Добавляем пробелы перед заглавными буквами
            .replace(/^./, str => str.toUpperCase()) // Делаем первую букву заглавной
            .trim();
    };

    return (
        <div className="operation-type-field">
            <div className="operation-type-field__label">Operation Type:</div>
            <div className="operation-type-field__value">{formatOperationType(operationType)}</div>
        </div>
    );
}
