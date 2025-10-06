# Pear Cross Platform Template

A cross-platform template that demonstrates how to use Pear by Holepunch with a single codebase for Expo, React Native, Web, and Desktop.

This template allows you to write code once and deploy it across multiple platforms: desktop (Windows, macOS, Linux), mobile (iOS, Android), and web.

### Prerequisites

- **Node.js version 22.14.0** (required)
- **Pear 1.18.0**

### Desktop

```bash
   node --version
   pear --v
   npm install
   npm run desktop
```

### Mobile

Haven’t tested this on iOS, but it should work the same way—just need to add the iOS script to package.json.

```bash
   node --version
   pear --v
   npm install
   npm run android
```

### Web

The fastest option for UI development. Doesn’t have Pear connection, but theoretically it’s possible to add it by creating a server that hosts Pear (perhaps in the future?)

```bash
   node --version
   pear --v
   npm install
   npm run web
```

## How It Works

This project leverages Expo's web bundle capabilities to create a unified cross-platform application. Here's the architecture:

### Architecture Overview

Expo compiles your React Native code into a web-compatible bundle using `react-native-web`, which translates React Native components into standard web components (HTML, CSS, JS).

Pear serves generated static files.

Platform-specific components need to be either lazy loaded or conditionally excluded from rendering.

In this template `useWorklet` conditionally returns platform specific worklet hook. Since mobile is using `react-native-bare-kit`, it would not compile.

```
export function useWorklet(config: UseWorkletConfig): UseWorkletReturn {
  if (Platform.OS === 'web') {
    const { useWorkletDesktop } = require('./useWorkletDesktop');
    return useWorkletDesktop(config);
  } else {
    const { useWorkletMobile } = require('./useWorkletMobile');
    return useWorkletMobile(config);
  }
}

// Later in code:

const { status, disconnect, connect } = useWorklet(...)

```