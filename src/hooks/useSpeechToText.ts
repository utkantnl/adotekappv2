import { useRef, useState, useCallback } from 'react';

interface UseSpeechToTextOptions {
  language?: string;
  onInterim?: (text: string) => void;
  onFinal?: (text: string) => void;
}

export function useSpeechToText(options: UseSpeechToTextOptions = {}) {
  const { language = 'tr-TR', onInterim, onFinal } = options;
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const shouldListenRef = useRef(false);

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const start = useCallback(() => {
    if (!isSupported) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      if (interim) {
        setInterimText(interim);
        onInterim?.(interim);
      }

      if (final) {
        setInterimText('');
        onFinal?.(final);
      }
    };

    recognition.onend = () => {
      if (shouldListenRef.current) {
        try {
          recognition.start();
        } catch {
          // Already started
        }
      } else {
        setIsListening(false);
        setInterimText('');
      }
    };

    recognition.onerror = () => {
      if (!shouldListenRef.current) {
        setIsListening(false);
        setInterimText('');
      }
    };

    recognitionRef.current = recognition;
    shouldListenRef.current = true;
    setIsListening(true);

    try {
      recognition.start();
    } catch {
      // Already started
    }
  }, [isSupported, language, onInterim, onFinal]);

  const stop = useCallback(() => {
    shouldListenRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimText('');
  }, []);

  const toggle = useCallback(() => {
    if (isListening) {
      stop();
    } else {
      start();
    }
  }, [isListening, start, stop]);

  return { isListening, interimText, isSupported, start, stop, toggle };
}
