# Client - Application React TypeScript

## Vue d'ensemble

Interface utilisateur moderne pour le traitement des fichiers DSN avec génération automatique de formulaires CSRD et export Word professionnel.

## Stack Technique

- **Framework :** React 19.2 (dernière version stable)
- **Langage :** TypeScript strict
- **Build :** Vite 7.2 (HMR ultra-rapide)
- **État Global :** Zustand (store léger)
- **Validation :** Zod + @hookform/resolvers
- **Styling :** SCSS Modules (CSS isolé)
- **Notifications :** React Toastify
- **Export :** docx + file-saver

## Architecture

```
src/
├── main.tsx              # Point d'entrée + configuration React
├── App.tsx               # Routeur principal + navigation
├── components/           # Composants UI réutilisables
│   ├── DsnFileUpload/   # Upload + validation fichiers DSN
│   ├── DsnForm/         # Formulaire dynamique hiérarchique  
│   └── WordExport/      # Génération documents Word
├── stores/              # État global Zustand
├── utils/               # Utilitaires métier
│   ├── csvParser.ts     # Parsing CSV questions CSRD
│   └── dsnAnalytics.ts  # Calculs automatiques DSN
├── styles/              # Styles globaux SCSS
└── assets/              # Ressources statiques
```

## Installation & Lancement

### Prérequis
- Node.js 18+ (modules ES6)
- npm/pnpm/yarn

### Installation
```bash
npm install
```

### Développement
```bash
npm run dev          # Serveur de développement (HMR)
# Ouvre automatiquement http://localhost:5173
```

### Production
```bash
npm run build        # Build optimisé
npm run preview      # Aperçu du build local
```

### Qualité Code
```bash
npm run lint         # ESLint + TypeScript strict
```

## Fonctionnalités

### 🔄 Upload DSN
- **Drag & Drop :** Interface intuitive react-dropzone
- **Validation :** Type fichier (.txt), taille (10MB max)
- **Feedback :** Toasts temps réel + états de chargement

### 📋 Formulaire Dynamique
- **Structure hiérarchique :** Questions parent/enfant illimitées
- **Types multiples :** Number, text, enum, tables
- **Validation temps réel :** Champs requis avec feedback
- **Auto-complétion :** Calculs automatiques depuis DSN

### 📄 Export Word
- **Format professionnel :** Structure document complète
- **Données complètes :** Questions + réponses + métadonnées
- **Téléchargement direct :** Génération côté client

## Configuration

### Variables d'environnement
Créer `.env` (optionnel) :
```bash
VITE_API_BASE_URL=http://localhost:8080  # URL API backend
```

### ESLint & TypeScript
Configuration stricte incluse avec Vite :

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // TypeScript strict rules
      tseslint.configs.recommendedTypeChecked,
      // React-specific lint rules
      reactX.configs['recommended-typescript'],
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
```

## Architecture Technique

### État Global (Zustand)
```typescript
// Store principal DSN
interface DsnUploadState {
  selectedFile: File | null
  parsedDsnData: ProcessedDsnData | null  
  userAnswers: Record<string, string>
  // ... calculs automatiques
}
```

### Composants Modulaires
- **Séparation responsabilités :** Un composant = une fonction
- **Props typées :** Interfaces TypeScript strictes
- **Styles isolés :** SCSS Modules (pas de conflits CSS)

### Performance
- **Code splitting :** Lazy loading préparé
- **Memoization :** Re-renders optimisés  
- **Bundle optimisé :** Tree-shaking Vite

## Points d'Extension

### Nouveaux Types Questions
Étendre `utils/csvParser.ts`

### Nouvelles Validations  
Ajouter schémas Zod

### Export Supplémentaires
Intégrer nouvelles librairies (PDF, Excel)

### Authentification
Store Zustand ready pour auth

## Développement avec Vite

### Hot Module Replacement (HMR)
- Rechargement instantané des composants
- Préservation de l'état React
- Erreurs TypeScript temps réel

### Build Optimisé
- Minification automatique
- Tree-shaking intelligent  
- Chunks optimaux

### Outils Développeur
- React DevTools supportés
- Source maps développement
- TypeScript IntelliSense
