# Pokemon Challenge Frontend

A React + TypeScript frontend for the Pokemon Challenge application. Built with Vite, TanStack Query, Shadcn UI, and Tailwind CSS.

## Features

- **Authentication**: Session-based login/logout with admin credentials
- **Pokemon Search**: Search and browse Pokemon with infinite scrolling
- **Pokemon Details**: View detailed information including stats, abilities, moves, and sprites
- **Real API Integration**: Connected to Laravel backend API with proper error handling
- **Responsive Design**: Mobile-first responsive design with dark mode support
- **Type Safety**: Full TypeScript support with proper typing for PokeAPI data structures

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

3. Build for production:
   ```bash
   pnpm build
   ```

## API Integration

The frontend connects to the Laravel backend API running on `http://localhost/api`. The Vite dev server is configured to proxy API requests to the backend.

### Key Components

- **API Client** (`src/lib/api.ts`): Handles all HTTP requests with proper error handling
- **Auth Context** (`src/features/auth/`): Manages authentication state and session
- **Pokemon Hooks** (`src/hooks/usePokemon.ts`): TanStack Query hooks for Pokemon data fetching
- **Type Definitions** (`src/types/`): TypeScript interfaces matching PokeAPI structure

### Authentication

- Login with username: `admin` and password: `admin`
- Session-based authentication with full CSRF protection via Laravel Sanctum
- Automatic CSRF cookie fetching and token handling
- Automatic session validation on app load
- Secure cookie-based session management

## Architecture

The frontend follows a feature-based architecture:

```
src/
├── components/ui/          # Reusable UI components (Shadcn)
├── features/
│   ├── auth/              # Authentication components
│   └── pokemon/           # Pokemon-related components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and API client
└── types/                 # TypeScript type definitions
```

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
