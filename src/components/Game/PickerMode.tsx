import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../hooks/useStores';
import { TranslationService } from '../../services/TranslationService';
import { FlagService } from '../../services/FlagService';
import './PickerMode.css';

export const PickerMode: React.FC = observer(() => {
  const { gameStore, settingsStore } = useStores();
  const [options, setOptions] = React.useState<string[]>([]);
  const [flagUrls, setFlagUrls] = React.useState<string[]>([]);
  const [isAnswered, setIsAnswered] = React.useState(false);
  const [selectedAnswer, setSelectedAnswer] = React.useState<string | null>(null);
  const [countryName, setCountryName] = React.useState<string>('');
  const [isChangingFlags, setIsChangingFlags] = React.useState(false);

  React.useEffect(() => {
    const loadOptions = async () => {
      setOptions([]);
      setFlagUrls([]);
      setIsAnswered(false);
      setSelectedAnswer(null);

      if (gameStore.currentFlag && !gameStore.isGameOver) {
        const savedState = gameStore.getPickerState();
        if (savedState) {
          setOptions(savedState.options);
          setFlagUrls(savedState.flagUrls);
          setIsAnswered(savedState.isAnswered);
          setSelectedAnswer(savedState.selectedAnswer);
          const translation = await TranslationService.getTranslation(
            settingsStore.language,
            gameStore.currentFlag.country
          );
          setCountryName(translation);
          return;
        }

        const flagOptions = await FlagService.getRandomOptions(
          gameStore.allFlags,
          gameStore.currentFlag,
          3,
          gameStore.allFlags,
          settingsStore.difficulty
        );
        
        const countryOptions = flagOptions.map(flag => flag.country);
        const urls = flagOptions.map(flag => flag.url);
        setOptions(countryOptions);
        setFlagUrls(urls);

        const translation = await TranslationService.getTranslation(
          settingsStore.language,
          gameStore.currentFlag.country
        );
        setCountryName(translation);

        gameStore.savePickerState({
          options: countryOptions,
          flagUrls: urls,
          isAnswered: false,
          selectedAnswer: null
        });
      }
    };

    loadOptions();
  }, [gameStore.currentFlag, gameStore.isGameOver]);

  React.useEffect(() => {
    if (gameStore.currentFlag) {
      setIsChangingFlags(true);
      const timer = setTimeout(() => {
        setIsChangingFlags(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [gameStore.currentFlag]);

  const handleAnswer = async (answer: string, index: number) => {
    if (isAnswered) return;
    
    const isCorrect = options[index] === gameStore.currentFlag?.country;
    
    React.startTransition(() => {
      setSelectedAnswer(answer);
      setIsAnswered(true);
      gameStore.savePickerState({
        options,
        flagUrls,
        isAnswered: true,
        selectedAnswer: answer
      });
    });

    await new Promise(resolve => setTimeout(resolve, isCorrect ? 400 : 1000));
    await gameStore.handleAnswer(options[index]);
    
    // Reset state after handling answer
    setOptions([]);
    setFlagUrls([]);
    setIsAnswered(false);
    setSelectedAnswer(null);
    gameStore.savePickerState({
      options: [],
      flagUrls: [],
      isAnswered: false,
      selectedAnswer: null
    });
  };

  return (
    <div className="picker-container">
      <div className="country-name">{countryName}</div>
      <div className="picker-options">
        {flagUrls.map((url, index) => {
          const optionCountry = options[index];
          const isCorrectOption = optionCountry === gameStore.currentFlag?.country;
          const isSelectedOption = optionCountry === selectedAnswer;
          
          return (
            <button
              key={`${optionCountry}-${index}`}
              className={`picker-option ${
                isAnswered
                  ? isCorrectOption
                    ? 'correct'
                    : isSelectedOption
                    ? 'incorrect'
                    : ''
                  : ''
              }`}
              onClick={() => handleAnswer(optionCountry, index)}
              disabled={isAnswered}
            >
              <div className="flag-container">
                <img 
                  src={url} 
                  alt="Flag option"
                  className={`flag-image ${isChangingFlags ? 'changing' : ''}`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
});