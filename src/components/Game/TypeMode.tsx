import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../hooks/useStores';
import { TranslationService } from '../../services/TranslationService';
import Fuse from 'fuse.js';
import './TypeMode.css';
import { useTranslation } from '../../hooks/useTranslation';
import { CORRECT_ANSWER_DELAY, INCORRECT_ANSWER_DELAY } from '../../constants/timing';

export const TypeMode: React.FC<{
  shouldFocus?: boolean;
}> = observer(({ shouldFocus }) => {
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
    if (!gameStore.currentFlag) {
      setAnswer('');
      setSuggestion('');
      setFeedback(null);
      setCorrectAnswer('');
      setIsProcessing(false);
      setIsExiting(false);
    }
  }, [gameStore.currentFlag]);

  React.useEffect(() => {
    if (gameStore.isGameOver && inputRef.current) {
      inputRef.current.blur();
    }
  }, [gameStore.isGameOver]);

  React.useEffect(() => {
    if (shouldFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [shouldFocus]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
    if (e.type === 'keydown') {
      const keyEvent = e as React.KeyboardEvent;
      
      // Prevent keyboard from closing on Enter
      if (keyEvent.key === 'Enter') {
        e.preventDefault();
        handleSubmit(e as any);
      }
      
      // Existing tab completion logic
      if (settingsStore.difficulty === 'hard') return;
      if (keyEvent.key === 'Tab') {
        e.preventDefault();
        if (suggestion) {
          setAnswer(suggestion);
          setSuggestion('');
        }
      }
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isProcessing) return;
    const value = e.target.value;
    setAnswer(value);

    if (!value.trim()) {
      setSuggestion('');
      return;
    }

    // Get all available flags for suggestions
    let availableFlags = gameStore.remainingFlags;
    if (settingsStore.difficulty === 'easy') {
      availableFlags = gameStore.remainingFlags;
    } else if (settingsStore.difficulty === 'medium') {
      availableFlags = gameStore.allFlags;
    } else if (settingsStore.difficulty === 'hard') {
      setSuggestion('');
      return;
    }

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
        }, 300);
      }, 700);
    }

    await new Promise(resolve => setTimeout(resolve, isCorrect ? CORRECT_ANSWER_DELAY : INCORRECT_ANSWER_DELAY));
    await gameStore.handleAnswer(normalizedAnswer, isCorrect);
    
    setAnswer('');
    setFeedback(null);
    setCorrectAnswer('');
    setIsProcessing(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLInputElement>) => {
    if (document.activeElement === e.currentTarget && suggestion) {
      e.preventDefault();
      setAnswer(suggestion);
      setSuggestion('');
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
          onTouchStart={handleTouchStart}
          className={`answer-input ${feedback || ''}`}
          placeholder={placeholderText}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          data-form-type="other"
          data-lpignore="true"
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