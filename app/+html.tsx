// app/+html.tsx
import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        
        
        {/* Add CSP for Electron */}
        <meta 
          httpEquiv="Content-Security-Policy" 
          content="default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: file:; font-src 'self' data: file:; img-src 'self' data: file:;" 
        />
        
        <ScrollViewStyleReset />
        
        {/* Preload critical font */}
        <link
          rel="preload"
          href="./assets/assets/fonts/SpaceMono-Regular.49a79d66bdea2debf1832bf4d7aca127.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children} HARRI</body>
    </html>
  );
}
