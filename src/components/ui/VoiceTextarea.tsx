import { useCallback } from 'react';
import { Mic } from 'lucide-react';
import { useSpeechToText } from '../../hooks/useSpeechToText';
import { cn } from '../../lib/utils';

interface VoiceTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onValueChange: (value: string) => void;
  language?: string;
}

export default function VoiceTextarea({
  value,
  onValueChange,
  language = 'tr-TR',
  className,
  ...props
}: VoiceTextareaProps) {
  const onFinal = useCallback(
    (text: string) => {
      onValueChange(value ? `${value} ${text}` : text);
    },
    [value, onValueChange]
  );

  const { isListening, interimText, isSupported, toggle } = useSpeechToText({
    language,
    onFinal,
  });

  return (
    <div className="relative">
      <textarea
        {...props}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className={cn(
          'w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-adotek-red/20 focus:border-adotek-red outline-none transition-all duration-200 resize-none',
          isListening && 'border-adotek-red ring-2 ring-adotek-red/20',
          className
        )}
      />
      {isSupported && (
        <button
          type="button"
          onClick={toggle}
          className={cn(
            'absolute right-2 bottom-3 p-2 rounded-full transition-all duration-200',
            isListening
              ? 'bg-adotek-red text-white animate-pulse'
              : 'text-gray-400 hover:text-adotek-red hover:bg-red-50'
          )}
        >
          <Mic className="w-4 h-4" />
        </button>
      )}
      {isListening && interimText && (
        <div className="absolute left-0 -bottom-8 bg-gray-800 text-white text-xs px-3 py-1 rounded-lg shadow-lg z-10 max-w-sm truncate">
          {interimText}
        </div>
      )}
    </div>
  );
}
