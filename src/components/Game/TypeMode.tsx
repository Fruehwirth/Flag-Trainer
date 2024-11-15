import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../hooks/useStores';
import { TranslationService } from '../../services/TranslationService';
import './TypeMode.css';
import { useTranslation } from '../../hooks/useTranslation';

interface TypeModeProps {
  shouldAutoFocus?: boolean;
}

export const TypeMode: React.FC<TypeModeProps> = observer(({ shouldAutoFocus = false }) => {
  const { gameStore, settingsStore } = useStores();
  const [answer, setAnswer] = React.useState('');
  const [feedback, setFeedback] = React.useState<'correct' | 'incorrect' | null>(null);
  const [correctAnswer, setCorrectAnswer] = React.useState<string>('');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isExiting, setIsExiting] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const placeholderText = useTranslation('typeCountryName', settingsStore.language, true);

  React.useEffect(() => {
    if (shouldAutoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameStore.currentFlag, shouldAutoFocus]);

  React.useEffect(() => {
    if (shouldAutoFocus && !isProcessing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isProcessing, shouldAutoFocus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || isProcessing) return;

    setIsProcessing(true);
    const normalizedAnswer = answer.trim().toLowerCase();
    const currentCountry = gameStore.currentFlag?.country;
    if (!currentCountry) return;
    
    const translation = await TranslationService.getTranslation(
      settingsStore.language,
      currentCountry
    );

    const isCorrect = 
      normalizedAnswer === currentCountry.toLowerCase() || 
      normalizedAnswer === translation.toLowerCase();

    setFeedback(isCorrect ? 'correct' : 'incorrect');
    
    if (!isCorrect) {
      setCorrectAnswer(translation);
      setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          setFeedback(null);
          setCorrectAnswer('');
          setIsExiting(false);
        }, 300);
      }, 700);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    await gameStore.handleAnswer(normalizedAnswer, isCorrect);
    
    setAnswer('');
    setFeedback(null);
    setCorrectAnswer('');
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="type-input-container">
      <input
        ref={inputRef}
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        className={`answer-input ${feedback || ''}`}
        placeholder={placeholderText}
        disabled={isProcessing}
      />
      {feedback === 'incorrect' && correctAnswer && (
        <div className={`correct-answer ${isExiting ? 'exiting' : ''}`}>
          {correctAnswer}
        </div>
      )}
    </form>
  );
});