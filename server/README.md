# Server - API Node.js TypeScript

## Vue d'ensemble

API REST pour le traitement des fichiers DSN (Déclaration Sociale Nominative) avec parsing authentique basé sur l'implémentation de La Société Nouvelle.

## Stack Technique

- **Runtime :** Node.js avec modules ES6
- **Framework :** Express 5.2
- **Langage :** TypeScript strict
- **Upload :** Multer (gestion fichiers multipart)
- **Validation :** Zod (schémas runtime)
- **Utils :** date-fns (manipulation dates)
- **Dev :** tsx (TypeScript execution) + cross-env

## Architecture

```
src/
├── server.ts           # Point d'entrée + graceful shutdown
├── app.ts             # Configuration Express + middlewares
├── config/            # Configuration environnement
├── routes/            # Définition des endpoints REST
├── controllers/       # Logique de traitement des requêtes
├── services/          # Logique métier DSN
├── core/
│   └── parsers/       # Parser DSN authentique
├── middlewares/       # Middlewares Express personnalisés
```

## Configuration

### Variables d'environnement

Copier `.env.example` vers `.env` et ajuster :

```bash
PORT=8080                    # Port du serveur
NODE_ENV=development         # Environnement (development|production)  
CORS_ORIGIN=*               # Origine CORS autorisée
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
npm run dev          # Mode watch avec rechargement automatique
```

### Production
```bash
npm run build        # Compilation TypeScript
npm start           # Lancement du serveur compilé
```

### Vérification Types
```bash
npm run type-check   # Vérification TypeScript sans build
```

## API Endpoints

### `POST /api/dsn/upload`
Upload et traitement d'un fichier DSN.

**Multipart form-data :**
- `dsn` : Fichier .txt DSN

**Response :**
```json
{
  "message": "DSN processed successfully",
  "filename": "example.txt",
  "size": 12345,
  "parsedData": {
    "company": { /* ... */ },
    "mappedAnswers": { /* ... */ }
  }
}
```

## Parser DSN

### Source
Implémentation authentique basée sur [La Société Nouvelle](https://github.com/La-Societe-Nouvelle/LaSocieteNouvelle-METRIZ-WebApp).

### Fonctionnalités
- **Parsing complet :** Tous les blocs DSN (S20.G00.05 → S21.G00.54)
- **Structure hiérarchique :** Entreprise → Établissement → Individu → Contrat
- **Validation :** Contrôle intégrité des données
- **Mapping automatique :** DSN → Questions CSRD

### Blocs supportés
- `S20.G00.05` : En-tête déclaration
- `S21.G00.06` : Informations entreprise  
- `S21.G00.11` : Établissement
- `S21.G00.30` : Individu
- `S21.G00.40` : Contrat de travail
- `S21.G00.50` : Période/rémunération
- Et tous les sous-blocs associés

## Architecture de Production

### Sécurité
- CORS configurable
- Validation Zod sur tous les inputs
- Gestion propre des erreurs
- Graceful shutdown

### Performance
- Streaming pour gros fichiers
- Parser optimisé mémoire
- TypeScript compilation optimisée

### Monitoring
- Logs structurés
- Variables d'environnement sécurisées
- Health checks prêts

## Points d'Extension

### Nouveaux Formats DSN
Ajouter parsers dans `core/parsers/`

### Nouveaux Mappings CSRD
Étendre `services/dsn.service.ts`

### APIs Supplémentaires
Ajouter routes dans `routes/`

### Stockage Persistant
Intégrer Prisma/TypeORM facilement