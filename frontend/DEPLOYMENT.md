# Deployment

This project is a Vite React frontend. It does not have a separate Express/Node backend in this repository.

Firebase is the backend service for authentication and Firestore data. Deploy the frontend to Vercel or Render, then add the Firebase environment variables in the hosting dashboard.

## Frontend Files

Deploy these source/config files:

- `src/`
- `index.html`
- `package.json`
- `package-lock.json`
- `vite.config.ts`
- `tsconfig.json`
- `tsconfig.app.json`
- `tsconfig.node.json`
- `tailwind.config.js`
- `postcss.config.js`
- `eslint.config.js`
- `../backend/firestore.rules`
- `vercel.json`
- `render.yaml`

Do not upload these:

- `node_modules/`
- `dist/`
- `.env`

## Backend

The backend is Firebase:

- Firebase Authentication
- Cloud Firestore
- Firestore security rules in `../backend/firestore.rules`

There is no `backend/` folder to deploy on Render as a web service. On Render, deploy this as a Static Site.

## Environment Variables

Add these variables in Vercel or Render:

```text
VITE_FIREBASE_API_KEY=your_value
VITE_FIREBASE_AUTH_DOMAIN=your_value
VITE_FIREBASE_PROJECT_ID=your_value
VITE_FIREBASE_MESSAGING_SENDER_ID=your_value
VITE_FIREBASE_APP_ID=your_value
```

## Vercel Settings

- Framework Preset: `Vite`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`

## Render Settings

- Service Type: `Static Site`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`

## Git Commands

```bash
git init
git add .
git commit -m "Prepare invoice app for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

If Git is already initialized, use:

```bash
git add .
git commit -m "Prepare invoice app for deployment"
git push
```
