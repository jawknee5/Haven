/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_WS_URL?: string;
  readonly VITE_ENABLE_HEALTH_CHECK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
