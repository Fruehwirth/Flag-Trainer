import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../hooks/useStores';
import { TranslationService } from '../../services/TranslationService';
import { FlagService } from '../../services/FlagService';
import './QuizMode.css';

export const QuizMode: React.FC = observer(() => {
  const { gameStore, settingsStore } = useStores();
  const [options, setOptions] = React.useState<string[]>([]);
  const [translatedOptions, setTranslatedOptions] = React.useState<string[]>([]);
  const [isAnswered, setIsAnswered] = React.useState(false);
  const [selectedAnswer, setSelectedAnswer] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadOptions = async () => {
      if (gameStore.currentFlag) {
        const flagOptions = FlagService.getRandomOptions(gameStore.allFlags, gameStore.currentFlag);
        const countryOptions = flagOptions.map(flag => flag.country);
        setOptions(countryOptions);

        const translations = await Promise.all(
          countryOptions.map(country => 
            TranslationService.getTranslation(settingsStore.language, country)
          )
        );
        setTranslatedOptions(translations);
      }
    };

    loadOptions();
    setIsAnswered(false);
    setSelectedAnswer(null);
  }, [gameStore.currentFlag, settingsStore.language]);

  const handleAnswer = async (answer: string, index: number) => {
    if (isAnswered) return;
    
    React.startTransition(() => {
      setSelectedAnswer(answer);
      setIsAnswered(true);
    });

    await new Promise(resolve => setTimeout(resolve, 1000));
    await gameStore.handleAnswer(options[index]);
  };

  return (
    <div className="quiz-options">
      {translatedOptions.map((translation, index) => (
        <button
          key={`${options[index]}-${index}`}
          className={`option ${
            isAnswered
              ? options[index] === gameStore.currentFlag?.country
                ? 'correct'
                : options[index] === selectedAnswer
                ? 'incorrect'
                : ''
              : ''
          }`}
          onClick={() => handleAnswer(options[index], index)}
          disabled={isAnswered}
        >
          {translation}
        </button>
      ))}
    </div>
  );
});