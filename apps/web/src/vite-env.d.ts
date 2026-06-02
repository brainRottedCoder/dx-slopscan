/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SKIP_BOOT?: string;
  readonly VITE_E2E_SKIP_BOOT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
