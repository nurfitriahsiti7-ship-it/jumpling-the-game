import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA Service Worker for offline caching and installation
registerSW({
  immediate: true,
  onRegistered(r) {
    if (r) {
      // Periodically check for SW updates every hour
      setInterval(() => {
        r.update();
      }, 60 * 60 * 1000);
    }
  },
});

createRoot(document.getElementById('root')!).render(<App />);

