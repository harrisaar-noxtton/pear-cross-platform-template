# Pear Cross Platform Template

Target Platforms: Desktop, Mobile (iOS, Android)

A cross-platform template that demonstrates how to use React Native, TypeScript, and Electron in the same project. This template allows you to write code once and deploy it across multiple platforms: desktop (Windows, macOS, Linux), mobile (iOS, Android), and web.

### Prerequisites

- **Node.js version 22.14.0** (required)

### Installation

Install dependencies:
```bash
   npm install
```

## How It Works

This project leverages Expo's web bundle capabilities combined with Electron to create a unified cross-platform application. Here's the architecture:

### Architecture Overview

1. **Expo Web Bundle**: Expo compiles your React Native code into a web-compatible bundle using `react-native-web`, which translates React Native components into standard web components (HTML, CSS, JS).

2. **Electron Wrapper**: Electron serves as a desktop wrapper that loads the web bundle, essentially running a Chromium browser in a native desktop window.

3. **Shared Codebase**: The same TypeScript/React Native code runs across all platforms:
   - **Mobile**: Native iOS/Android apps via Expo
   - **Web**: Direct browser access via the web bundle
   - **Desktop**: Electron loading the web bundle in a native window

### Development Workflow

When you run `npm run dev:desktop`, the following happens:

1. **Web Server**: Starts Expo's development server on `http://localhost:8081` serving the web bundle
2. **Electron Window**: Launches Electron which loads the web bundle from the local server
3. **Dual Preview**: You get both:
   - A web browser window showing your app
   - An Electron desktop window showing the same app

Both windows reflect the same codebase and update simultaneously during development.

### quickstart

This will open up Pear app built from expo web bundle. (no hot reloading)

```
npm run build:web
npm run dev:pear
```

### Project Tree


```
pear-cross-platform-template
├─ README.md
├─ app
│  ├─ (tabs)
│  │  ├─ _layout.tsx
│  │  ├─ index.tsx
│  │  └─ two.tsx
│  ├─ +html.tsx
│  ├─ +not-found.tsx
│  ├─ _layout.tsx
│  └─ modal.tsx
├─ app.json
├─ assets
│  ├─ fonts
│  │  └─ SpaceMono-Regular.ttf
│  └─ images
│     ├─ adaptive-icon.png
│     ├─ favicon.png
│     ├─ icon.png
│     └─ splash-icon.png
├─ components
│  ├─ EditScreenInfo.tsx
│  ├─ ExternalLink.tsx
│  ├─ StyledText.tsx
│  ├─ Themed.tsx
│  ├─ __tests__
│  │  └─ StyledText-test.js
│  ├─ useClientOnlyValue.ts
│  ├─ useClientOnlyValue.web.ts
│  ├─ useColorScheme.ts
│  └─ useColorScheme.web.ts
├─ constants
│  └─ Colors.ts
├─ dist-web
│  ├─ _expo
│  │  └─ static
│  │     ├─ css
│  │     │  └─ modal.module-33361d5c796745334f151cac6c469469.css
│  │     └─ js
│  │        └─ web
│  │           └─ entry-445b9f5c5b18541207a554e516c433a7.js
│  ├─ assets
│  │  └─ assets
│  │     └─ fonts
│  │        └─ SpaceMono-Regular.49a79d66bdea2debf1832bf4d7aca127.ttf
│  ├─ favicon.ico
│  ├─ index.html
│  └─ metadata.json
├─ electron
│  ├─ main.js
│  └─ preload.js
├─ package-lock.json
├─ package.json
└─ tsconfig.json

```