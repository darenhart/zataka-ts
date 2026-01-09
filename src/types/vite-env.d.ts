/// <reference types="vite/client" />

/**
 * Vite-specific type definitions
 */
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  // Add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly hot?: {
    accept: (cb?: (newModule: unknown) => void) => void;
    dispose: (cb: () => void) => void;
    invalidate: () => void;
  };
}
