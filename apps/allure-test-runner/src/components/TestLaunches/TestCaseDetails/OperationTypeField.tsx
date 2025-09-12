import { Caption, Body } from '../../ui/typography';

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
        <div className="flex items-center justify-between p-2 bg-muted/20 border border-border rounded-md">
            <Caption className="font-medium text-xs">Operation:</Caption>
            <Body className="font-medium text-blue-600 text-xs">{formatOperationType(operationType)}</Body>
        </div>
    );
}
