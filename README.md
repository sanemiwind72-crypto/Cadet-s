# Cadet-s — Assistant vocal IA (style Cadet)

Ce projet est une interface web **vocale uniquement** (français) :
- l'utilisateur pose sa question au micro,
- l'assistant répond avec une voix,
- l'orbe animé bouge pendant l'écoute et la réponse.

## Lancer en local

```bash
python3 -m http.server 4173
```

Puis ouvrir : `http://localhost:4173`

## Publication publique sur GitHub Pages

Le workflow GitHub Actions (`.github/workflows/deploy-pages.yml`) est déjà prêt.

### 1) Créer/associer le dépôt GitHub

```bash
git remote add origin https://github.com/<TON_COMPTE>/<TON_REPO>.git
```

> Si `origin` existe déjà, remplace l'URL :

```bash
git remote set-url origin https://github.com/<TON_COMPTE>/<TON_REPO>.git
```

### 2) Pousser le code

```bash
git push -u origin work
```

(ou `main`/`master` selon ta branche principale)

### 3) Activer GitHub Pages

Dans GitHub :
- **Settings** → **Pages**
- Source : **GitHub Actions**

Ensuite, à chaque push sur la branche configurée, le site sera publié automatiquement.

## Fichiers principaux

- `index.html` : structure de l'interface
- `styles.css` : style + animations de l'orbe
- `script.js` : reconnaissance vocale + synthèse vocale
