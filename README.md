
```markdown
# 📚 SamaNote - Plateforme d'Étude Intelligente

SamaNote est une plateforme éducative moderne qui utilise l'intelligence artificielle pour aider les étudiants à organiser leurs notes, créer des fiches de révision et générer des quiz personnalisés à partir de leurs cours.


## ✨ Fonctionnalités Principales

### 🎯 Gestion des Notes
- **Organisation par matières** : Créez et organisez vos notes par matière avec un système de couleurs
- **Éditeur avancé** : Interface intuitive pour la prise de notes avec support Markdown
- **Système de tags** : Étiquetez vos notes pour une recherche facile
- **Recherche intelligente** : Trouvez rapidement vos notes par titre, contenu ou tags

### 🤖 Intelligence Artificielle
- **Génération de contenu** : Transformez vos notes en résumés, fiches de révision ou cartes mentales
- **Analyse de PDF** : Uploadez vos cours en PDF et obtenez automatiquement des analyses structurées
- **Quiz automatiques** : Générez des quiz personnalisés basés sur vos notes
- **Visualisations interactives** : Cartes mentales visuelles, fiches de révision interactives

### 📊 Suivi des Performances
- **Historique des quiz** : Suivez vos scores et  progression
- **Statistiques détaillées** : Analysez vos performances par matière
- **Tableau de bord** : Vue d'ensemble de  activité d'étude

### 🔐 Authentification Sécurisée
- **Connexion par email/mot de passe** : Système d'authentification classique
- **OAuth Google** : Connexion rapide avec  compte Google
- **Gestion de session** : Sessions sécurisées avec NextAuth.js

## 🛠️ Technologies Utilisées

### Frontend
- **Next.js 15** - Framework React avec App Router
- **TypeScript** - Typage statique pour une meilleure robustesse
- **Tailwind CSS** - Framework CSS utilitaire pour un design moderne
- **Shadcn/ui** - Composants UI réutilisables et accessibles
- **D3.js** - Visualisations de données interactives
- **Lucide React** - Icônes modernes et cohérentes

### Backend
- **Next.js API Routes** - API REST intégrée
- **Prisma** - ORM moderne pour la gestion de base de données
- **NextAuth.js** - Authentification complète et sécurisée
- **PDF-Parse** - Extraction de texte depuis les fichiers PDF

### Base de Données
- **MySQL** - Base de données relationnelle (production)
- **Supabase** - Alternative PostgreSQL avec fonctionnalités temps réel

### Intelligence Artificielle
- **OpenRouter** - Accès à différents modèles d'IA (Llama, GPT, etc.)
- **Modèles supportés** : Llama 3.1, GPT-4, Claude, et plus

### Déploiement
- **Vercel** - Plateforme de déploiement optimisée pour Next.js
- **Docker** - Containerisation pour le développement local

## 🚀 Installation et Configuration

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Base de données MySQL ou PostgreSQL
- Compte OpenRouter pour l'IA

### 1. Cloner le Projet
\`\`\`bash
git clone https://github.com/-mamadoujuniorsy/samanote.git
cd samanote
\`\`\`

### 2. Installer les Dépendances
\`\`\`bash
npm install
# ou
yarn install
\`\`\`

### 3. Configuration de l'Environnement
Créez un fichier `.env.local` à la racine du projet :

\`\`\`env
# Base de données
DATABASE_URL="mysql://mamadoujuniorsy:password@localhost:3306/samanote"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="-secret-key-super-securise"

# Google OAuth (optionnel)
GOOGLE_CLIENT_ID="-google-client-id"
GOOGLE_CLIENT_SECRET="-google-client-secret"

# OpenRouter pour l'IA
OPENROUTER_API_KEY="-openrouter-api-key"

# Supabase (si utilisé)
NEXT_PUBLIC_SUPABASE_URL="-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="-supabase-service-role-key"
\`\`\`

### 4. Configuration de la Base de Données
\`\`\`bash
# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma db push

# (Optionnel) Ouvrir Prisma Studio
npx prisma studio
\`\`\`

### 5. Lancer le Serveur de Développement
\`\`\`bash
npm run dev
# ou
yarn dev
\`\`\`

Ouvrez [http://localhost:3000](http://localhost:3000) dans  navigateur.

## 📁 Structure du Projet

\`\`\`
samanote/
├── app/                          # App Router de Next.js
│   ├── api/                      # Routes API
│   │   ├── auth/                 # Authentification
│   │   ├── notes/                # Gestion des notes
│   │   ├── quiz/                 # Système de quiz
│   │   ├── subjects/             # Gestion des matières
│   │   └── pdf/                  # Analyse de PDF
│   ├── auth/                     # Pages d'authentification
│   ├── notes/                    # Pages de gestion des notes
│   ├── quiz/                     # Pages de quiz
│   ├── pdf-analyzer/             # Analyseur de PDF
│   └── globals.css               # Styles globaux
├── components/                   # Composants réutilisables
│   ├── ui/                       # Composants UI de base
│   └── analysis-renderers/       # Renderers pour les analyses IA
├── lib/                          # Utilitaires et configuration
│   ├── auth.ts                   # Configuration NextAuth
│   ├── prisma.ts                 # Client Prisma
│   └── utils.ts                  # Fonctions utilitaires
├── prisma/                       # Schéma et migrations Prisma
│   └── schema.prisma             # Modèle de données
├── scripts/                      # Scripts de base de données
└── public/                       # Assets statiques
\`\`\`

## 🎯 Utilisation

### Créer un Compte
1. Accédez à `/auth/signup`
2. Créez un compte avec email/mot de passe ou Google OAuth
3. Confirmez  email si nécessaire

### Organiser vos Études
1. **Créer des matières** : Organisez vos cours par matière
2. **Prendre des notes** : Utilisez l'éditeur pour vos notes de cours
3. **Analyser des PDF** : Uploadez vos cours PDF pour une analyse automatique
4. **Générer du contenu** : Créez des résumés, cartes mentales et fiches de révision
5. **Tester vos connaissances** : Générez et passez des quiz personnalisés

### Fonctionnalités IA
- **Résumés automatiques** : Obtenez des résumés structurés de vos notes
- **Cartes mentales visuelles** : Visualisez les concepts sous forme de schémas
- **Fiches de révision interactives** : Révisez avec des cartes question/réponse
- **Quiz adaptatifs** : Testez vos connaissances avec des questions générées automatiquement

## 🤝 Contribution

Nous accueillons toutes les contributions ! Voici comment vous pouvez aider :

### Types de Contributions
- 🐛 **Correction de bugs** : Signalez et corrigez les problèmes
- ✨ **Nouvelles fonctionnalités** : Proposez et implémentez de nouvelles idées
- 📚 **Documentation** : Améliorez la documentation et les guides
- 🎨 **Design** : Améliorez l'interface utilisateur et l'expérience
- 🧪 **Tests** : Ajoutez des tests pour améliorer la fiabilité

### Processus de Contribution
1. **Fork** le projet
2. **Créez une branche** pour  fonctionnalité (`git checkout -b feature/nouvelle-fonctionnalite`)
3. **Committez** vos changements (`git commit -m 'Ajout d'une nouvelle fonctionnalité'`)
4. **Push** vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. **Ouvrez une Pull Request**

### Guidelines de Développement
- Utilisez TypeScript pour tous les nouveaux fichiers
- Suivez les conventions de nommage existantes
- Ajoutez des commentaires pour les fonctions complexes
- Testez vos changements localement avant de soumettre
- Respectez le style de code existant (Prettier/ESLint)

### Signaler des Bugs
Utilisez les [GitHub Issues](https://github.com/-mamadoujuniorsy/samanote/issues) avec :
- Description claire du problème
- Étapes pour reproduire le bug
- Comportement attendu vs comportement observé
- Captures d'écran si applicable
- Informations sur  environnement (OS, navigateur, etc.)

## 🔧 Scripts Disponibles

\`\`\`bash
# Développement
npm run dev              # Lancer le serveur de développement
npm run build            # Construire l'application pour la production
npm run start            # Lancer l'application en mode production
npm run lint             # Vérifier le code avec ESLint

# Base de données
npm run db:push          # Appliquer les changements du schéma
npm run db:studio        # Ouvrir Prisma Studio
npm run db:generate      # Générer le client Prisma
\`\`\`

## 🌐 Déploiement

### Déploiement sur Vercel (Recommandé)
1. Connectez  repository GitHub à Vercel
2. Configurez les variables d'environnement dans Vercel
3. Déployez automatiquement à chaque push

### Déploiement Docker
\`\`\`bash
# Construire l'image
docker build -t samanote .

# Lancer le conteneur
docker run -p 3000:3000 samanote
\`\`\`

## 📊 Roadmap

### Version 1.1 (En cours)
- [ ] Mode collaboratif pour les notes partagées
- [ ] Export PDF des analyses
- [ ] Notifications push pour les rappels d'étude
- [ ] Mode hors ligne pour la consultation des notes

### Version 1.2 (Planifiée)
- [ ] Application mobile (React Native)
- [ ] Intégration avec Google Drive/OneDrive
- [ ] Système de badges et gamification
- [ ] Analyse avancée des performances d'apprentissage

### Version 2.0 (Vision)
- [ ] IA conversationnelle pour l'aide aux devoirs
- [ ] Reconnaissance vocale pour la prise de notes
- [ ] Réalité augmentée pour les cartes mentales
- [ ] Marketplace de contenu éducatif

## 🐛 Problèmes Connus

- L'analyse PDF peut être lente pour les gros fichiers (>10MB)
- Les cartes mentales complexes peuvent nécessiter un zoom manuel
- Certains caractères spéciaux dans les PDF peuvent causer des erreurs d'extraction



## 📞 Support

- 📧 **Email** : mamadoujunior2002@gmail.com
- 🐛 **Issues** : [GitHub Issues](https://github.com/-mamadoujuniorsy/samanote/issues)
---

<div align="center">
  <p>Fait avec ❤️ pour les étudiants </p>
  <p>
    <a href="https://github.com/mamadoujuniorsy/samanote/stargazers">⭐ Star</a> •
    <a href="https://github.com/mamadoujuniorsy/samanote/fork">🍴 Fork</a> •
    <a href="https://github.com/mamadoujuniorsy/samanote/issues">🐛 Report Bug</a> •
    <a href="https://github.com/mamadoujuniorsy/samanote/issues">💡 Request Feature</a>
  </p>
</div>



```
