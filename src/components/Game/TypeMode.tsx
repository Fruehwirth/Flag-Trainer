import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../hooks/useStores';
import { TranslationService } from '../../services/TranslationService';
import './TypeMode.css';

export const TypeMode: React.FC = observer(() => {
  const { gameStore, settingsStore } = useStores();
  const [answer, setAnswer] = React.useState('');
  const [feedback, setFeedback] = React.useState<'correct' | 'incorrect' | null>(null);
  const [correctAnswer, setCorrectAnswer] = React.useState<string>('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameStore.currentFlag]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;

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
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    setAnswer('');
    setFeedback(null);
    setCorrectAnswer('');
    
    await gameStore.handleAnswer(normalizedAnswer);

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <form className="type-input-container" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        className={`answer-input ${feedback || ''}`}
        placeholder="Type country name..."
        autoComplete="off"
        disabled={!!feedback}
      />
      {feedback === 'incorrect' && correctAnswer && (
        <div className="correct-answer">
          {correctAnswer}
        </div>
      )}
    </form>
  );
});