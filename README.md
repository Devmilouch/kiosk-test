# Test Technique Lead Developer (Amar Bouabbache) - Kiosk

## Vue d'ensemble

Application full-stack de traitement et d'analyse de fichiers DSN (Déclaration Sociale Nominative) avec génération automatique de formulaires CSRD et export Word.

**Fonctionnalités implémentées :**
- ✅ Upload et parsing de fichiers DSN
- ✅ Mapping automatique DSN → questions CSRD 
- ✅ Formulaire dynamique hiérarchique avec validation
- ✅ Calculs automatiques basés sur les données DSN
- ✅ Export Word professionnel
- ✅ Interface utilisateur intuitive

## Architecture & Stack Technique

### Stack Principal
- **Frontend :** React 19.2 + TypeScript + Vite
- **Backend :** Node.js + Express + TypeScript  
- **État :** Zustand (état global léger)
- **Validation :** Zod (schémas TypeScript-first)
- **UI/UX :** SCSS modules + React Toastify
- **Build :** Vite (dev rapide) + TypeScript (sécurité types)

### Librairies Métier
- **Upload fichiers :** react-dropzone + multer
- **Export Word :** docx + file-saver
- **HTTP :** axios (client) + cors (serveur)
- **Parsing CSV :** parser personnalisé hiérarchique

### Choix Techniques

**Architecture modulaire :**
- Séparation client/serveur claire
- Composants React isolés avec responsabilités uniques
- Services métier dédiés (DSN parsing, analytics, export)
- Store centralisé mais léger (Zustand vs Redux)

**Type Safety :**
- TypeScript strict sur client + serveur
- Interfaces partagées pour les données DSN
- Validation runtime avec Zod (cohérence types/runtime)

**Scalabilité :**
- Structure dossiers par domaine fonctionnel
- Parsers extensibles (nouveaux formats DSN)
- Système de mapping configurable (nouvelles questions CSRD)
- API REST préparée pour montée en charge

**Performance :**
- Parsing DSN côté serveur (fichiers volumineux)
- État local optimisé (re-renders minimaux)
- Build production optimisé (Vite)

## Utilisation de l'Intelligence Artificielle

**Position claire :** L'IA (GitHub Copilot) a été utilisée **uniquement comme assistant**, jamais comme décisionnaire.

**Ce qui reste 100% humain :**
- Toutes les décisions d'architecture
- Choix des technologies et librairies  
- Structure des dossiers et fichiers
- Logique métier et algorithmes de mapping
- Conception de l'interface utilisateur
- Stratégie de validation et gestion d'erreurs

**L'IA comme accélérateur :**
- Génération de code boilerplate (interfaces TypeScript, composants React)
- Tests de syntaxe et debugging rapide
- Recherche de patterns et bonnes pratiques
- Refactoring assisté sous supervision constante

**Ma vision de l'IA :** Un excellent **exécutant** qui doit être guidé en permanence par un développeur expérimenté. L'IA reste très loin des capacités de conception, d'analyse métier et de prise de décision technique d'un bon développeur. C'est un outil puissant pour accélérer l'implémentation, mais qui nécessite surveillance constante et corrections fréquentes.

## Points d'Amélioration Identifiés

### Contraintes de Test Technique
Ce projet reste un **test technique** avec contraintes temporelles. L'accent a été mis sur une **architecture solide, prod-ready et scalable** plutôt que sur l'exhaustivité fonctionnelle.

### Améliorations Métier
- **Analyse DSN approfondie :** Étude plus poussée des structures DSN réelles
- **Algorithmes de mapping :** Logiques plus sophistiquées DSN → CSRD
- **Règles de validation :** Contraintes métier complexes sur les formulaires
- **Export Word avancé :** Mise en forme professionnelle, tableaux, graphiques

### Améliorations Techniques
- **Validation formulaire complète :** React Hook Form + Zod (soumission conditionnelle)
- **Tests unitaires :** Couverture parsing DSN, calculs, composants critiques  
- **Gestion d'erreurs :** Error boundaries, retry automatique, logging structuré
- **Performance :** Virtualisation grandes listes, lazy loading, cache intelligent

### Améliorations UX/UI
- **États de chargement :** Feedback visuel détaillé sur les opérations longues
- **Progressive disclosure :** Interface adaptative selon la complexité
- **Accessibilité :** Support lecteurs d'écran, navigation clavier
- **Responsive design :** Adaptation mobile/tablette

## Objectif du Test

Pour un test technique, cette implémentation démontre :
- **Vision architecture :** Conception modulaire et évolutive
- **Maîtrise technique :** TypeScript, React moderne, Node.js, APIs
- **Réflexion métier :** Compréhension des enjeux DSN/CSRD
- **Qualité de code :** Structure claire, séparation des responsabilités
- **Pragmatisme :** Équilibre qualité/délai, priorisation des fonctionnalités

## Structure du Projet

```
test_lead_dev_amar/
├── client/          # Application React TypeScript
├── server/          # API Node.js Express
└── README.md        # Ce fichier
```

**Voir les README spécifiques dans `/client` et `/server` pour les instructions de lancement.**