import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Body, Caption } from '../../ui/typography';

type ValidationStatusProps = {
    isResultValid?: boolean;
    validationErrors: string[];
};

export function ValidationStatus({ isResultValid, validationErrors }: ValidationStatusProps) {
    if (isResultValid === undefined) return null;
    
    return (
        <div className={`border rounded-lg p-3 ${
            isResultValid 
                ? 'bg-green-950/20 border-green-800/40' 
                : 'bg-red-950/20 border-red-800/40'
        }`}>
            <div className="flex items-center gap-2">
                {isResultValid ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                    <XCircle className="h-4 w-4 text-red-400" />
                )}
                <Body className={`font-medium text-sm ${isResultValid ? 'text-green-400' : 'text-red-400'}`}>
                    {isResultValid ? 'Valid' : 'Invalid'}
                </Body>
            </div>
            
            {!isResultValid && validationErrors.length > 0 && (
                <div className="mt-3 space-y-2">
                    <Caption className="font-medium text-red-300 text-xs">
                        Validation Errors:
                    </Caption>
                    <div className="space-y-1">
                        {validationErrors.map((error, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                                <AlertTriangle className="h-3 w-3 text-red-400 flex-shrink-0 mt-0.5" />
                                <Body className="text-red-300 text-sm leading-relaxed">{error}</Body>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
