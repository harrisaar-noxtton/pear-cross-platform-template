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

Conditional rendering:

```
export default function PeersWorkletDemoScreen(props: Props): React.ReactElement {
  const {} = props;
  const [MobileWorkletDemo, setMobileWorkletDemo] = useState<React.ComponentType | null>(null);

  useEffect((): void => {
    if (Platform.OS !== 'web') {
      // Only import on mobile platforms
      import('@/components/MobileWorkletDemo')
        .then((module) => {
          setMobileWorkletDemo(() => module.default);
        })
        .catch((error) => {
          console.error('Failed to load MobileWorkletDemo:', error);
        });
    } 
  }, []);

  console.log("PeersWorkletDemoScreen v41");

  return (
    <View style={styles.container}>
      
      <View style={styles.demoContainer}>
        {Platform.OS !== 'web' && MobileWorkletDemo && <MobileWorkletDemo />}
        {Platform.OS === 'web' && <DesktopWorkletDemo />}
      </View>
    </View>
  );
}
```

### TODO

1. Pear utilizes Pear.worker.run, which relies on pipe technology. In contrast, react-native-bare-kit uses Worklet and RPC. This means the communication specifications differ slightly, including on the backend side. We’ve implemented some wrappers to unify the logic and create a consistent interface, but there’s room for improvement.

2. Haven’t tested the Pear release and staging yet, but it should probably work.

3. ... and more