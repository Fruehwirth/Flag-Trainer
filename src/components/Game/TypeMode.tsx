import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../hooks/useStores';
import { TranslationService } from '../../services/TranslationService';
import Fuse from 'fuse.js';
import './TypeMode.css';
import { useTranslation } from '../../hooks/useTranslation';

interface TypeModeProps {
  shouldAutoFocus?: boolean;
}

export const TypeMode: React.FC<TypeModeProps> = observer(({ shouldAutoFocus = false }) => {
  const { gameStore, settingsStore } = useStores();
  const [answer, setAnswer] = React.useState('');
  const [suggestion, setSuggestion] = React.useState('');
  const [feedback, setFeedback] = React.useState<'correct' | 'incorrect' | null>(null);
  const [correctAnswer, setCorrectAnswer] = React.useState<string>('');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isExiting, setIsExiting] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const placeholderText = useTranslation('typeCountryName', settingsStore.language, true);

  React.useEffect(() => {
    if (shouldAutoFocus && inputRef.current && gameStore.currentFlag) {
      inputRef.current.focus();
    } else if (!gameStore.currentFlag && inputRef.current) {
      inputRef.current.blur();
    }
  }, [gameStore.currentFlag, shouldAutoFocus]);

  React.useEffect(() => {
    if (shouldAutoFocus && !isProcessing && inputRef.current && gameStore.currentFlag) {
      inputRef.current.focus();
    }
  }, [isProcessing, shouldAutoFocus, gameStore.currentFlag]);

  React.useEffect(() => {
    if (!gameStore.currentFlag) {
      setAnswer('');
      setSuggestion('');
      setFeedback(null);
      setCorrectAnswer('');
      setIsProcessing(false);
      setIsExiting(false);
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  }, [gameStore.currentFlag]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
    if (settingsStore.difficulty === 'hard') return;

    // Handle space key press or touch event
    if (
      ((e.type === 'keydown' && (e as React.KeyboardEvent).key === ' ') ||
      (e.type === 'touchend')) &&
      suggestion &&
      suggestion[answer.length] !== ' '
    ) {
      e.preventDefault();
      setAnswer(suggestion);
      setSuggestion('');
    } else if (e.type === 'keydown' && (e as React.KeyboardEvent).key === 'Tab') {
      e.preventDefault();
      if (suggestion) {
        setAnswer(suggestion);
        setSuggestion('');
      }
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAnswer(value);

    if (settingsStore.difficulty === 'hard') {
      setSuggestion('');
      return;
    }

    if (!value.trim()) {
      setSuggestion('');
      return;
    }

    // Get all available flags for suggestions
    const availableFlags = gameStore.remainingFlags;
    const options = await Promise.all(
      availableFlags.map(async (flag) => {
        const translation = await TranslationService.getTranslation(
          settingsStore.language,
          flag.country
        );
        return translation;
      })
    );

    // Configure Fuse for fuzzy search
    const fuse = new Fuse(options, {
      threshold: 0.3,
      ignoreLocation: true,
      findAllMatches: true,
    });

    const results = fuse.search(value);
    if (results.length > 0) {
      const bestMatch = results[0].item;
      if (bestMatch.toLowerCase().startsWith(value.toLowerCase())) {
        setSuggestion(bestMatch);
      } else {
        setSuggestion('');
      }
    } else {
      setSuggestion('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || isProcessing) return;

    setIsProcessing(true);
    setSuggestion('');
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
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 300);
      }, 700);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    await gameStore.handleAnswer(normalizedAnswer, isCorrect);
    
    setAnswer('');
    setFeedback(null);
    setCorrectAnswer('');
    setIsProcessing(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="type-input-container">
      <div className="input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={answer}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onTouchEnd={handleKeyDown}
          className={`answer-input ${feedback || ''}`}
          placeholder={placeholderText}
          readOnly={isProcessing}
        />
        {suggestion && (
          <div className="suggestion">
            <span className="suggestion-entered">{answer}</span>
            <span className="suggestion-completion">{suggestion.slice(answer.length)}</span>
          </div>
        )}
      </div>
      {feedback === 'incorrect' && correctAnswer && (
        <div className={`correct-answer ${isExiting ? 'exiting' : ''}`}>
          {correctAnswer}
        </div>
      )}
    </form>
  );
});