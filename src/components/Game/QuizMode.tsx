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

  const updateTranslations = React.useCallback(async () => {
    if (options.length > 0) {
      const translations = await Promise.all(
        options.map(country => 
          TranslationService.getTranslation(settingsStore.language, country)
        )
      );
      setTranslatedOptions(translations);
    }
  }, [options, settingsStore.language]);

  React.useEffect(() => {
    updateTranslations();
  }, [settingsStore.language, updateTranslations]);

  React.useEffect(() => {
    const loadOptions = async () => {
      setOptions([]);
      setTranslatedOptions([]);
      setIsAnswered(false);
      setSelectedAnswer(null);

      if (gameStore.currentFlag) {
        const savedState = gameStore.getQuizState();
        if (savedState) {
          setOptions(savedState.options);
          setTranslatedOptions(savedState.translatedOptions);
          setIsAnswered(savedState.isAnswered);
          setSelectedAnswer(savedState.selectedAnswer);
          return;
        }

        const flagOptions = FlagService.getRandomOptions(
          gameStore.allFlags.filter(f => f.country !== gameStore.currentFlag?.country), 
          gameStore.currentFlag, 
          3, 
          gameStore.originalFlags
        );
        const countryOptions = flagOptions.map(flag => flag.country);
        setOptions(countryOptions);

        const translations = await Promise.all(
          countryOptions.map(country => 
            TranslationService.getTranslation(settingsStore.language, country)
          )
        );
        setTranslatedOptions(translations);

        gameStore.saveQuizState({
          options: countryOptions,
          translatedOptions: translations,
          isAnswered: false,
          selectedAnswer: null
        });
      }
    };

    loadOptions();
  }, [gameStore.currentFlag]);

  const handleAnswer = async (answer: string, index: number) => {
    if (isAnswered) return;
    
    const isCorrect = options[index] === gameStore.currentFlag?.country;
    
    React.startTransition(() => {
      setSelectedAnswer(answer);
      setIsAnswered(true);
      gameStore.saveQuizState({
        options,
        translatedOptions,
        isAnswered: true,
        selectedAnswer: answer
      });
    });

    await new Promise(resolve => setTimeout(resolve, isCorrect ? 400 : 1000));
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