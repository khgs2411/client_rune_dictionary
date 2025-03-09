/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HOST: string;
  readonly VITE_WS_HOST: string;
  readonly VITE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
