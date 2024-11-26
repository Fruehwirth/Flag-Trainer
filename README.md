# Flag Trainer

A modern, progressive web application for learning world flags through interactive quizzes and games.

## Features

### Multiple Game Modes
- Quiz Mode: Test your knowledge with multiple-choice questions
- Type Mode: Type in country names directly
- Picker Mode: Visual flag selection interface

### Customization Options
- Region Selection
  - Europe
  - Asia
  - North America
  - South America
  - Africa
  - Oceania
  - Mix and match multiple regions
  - At least one region must be selected

### Language Support
- Multiple interface languages:
  - English
  - German (Deutsch)
  - Spanish (Español)
  - Russian (Русский)
- Automatic browser language detection
- Country names are translated in all game modes
- UI elements adapt to selected language

### Progressive Web App Features
- Installable as a standalone app
- Offline functionality
- Responsive design for all screen sizes
- Dark/light mode support based on system preferences
- Touch-friendly interface
- Keyboard navigation support

### Game Progress Features
- Real-time progress tracking
- Score percentage display
- End-of-game statistics
- Option to replay incorrectly answered flags
- Complete game restart capability
- Session preservation for interrupted games
- Smooth transitions between flags
- Pre-loading of next flag for seamless experience

### Technical Features
- State Management with MobX
- React 18 with TypeScript
- Service Worker for offline capability
- Local storage for game state persistence
- Efficient caching system for assets
- Responsive CSS with CSS Variables
- Mobile-optimized touch interactions
- PWA manifest for app installation

### Accessibility
- Keyboard navigation support
- Screen reader friendly
- High contrast mode support
- Scalable text and UI elements
- Clear visual feedback for all interactions

### Performance
- Optimized image loading
- Efficient state management
- Smooth animations
- Minimal bundle size
- Fast initial load time
- Cached resources for offline use

## Installation

1. Clone the repository
2. Install dependencies: npm install
3. Start development server: npm run dev
4. Build for production: npm run build

## Development

The application uses Vite as the build tool and development server. Key commands:

- npm run dev: Start development server
- npm run build: Build for production
- npm run preview: Preview production build
- npm run lint: Run ESLint

## Architecture

The application follows a component-based architecture with:

- Stores: MobX stores for state management
- Services: API and utility services
- Components: Reusable UI components
- Hooks: Custom React hooks
- Constants: Configuration and constants
- Types: TypeScript type definitions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License

## Author
[Michael Frühwirth](https://github.com/fruehwirth)

## Acknowledgments

- Flag images sourced from [flagcdn](https://flagcdn.com)
- Icons from Material Symbols