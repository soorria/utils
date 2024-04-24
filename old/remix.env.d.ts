/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/node/globals" />

declare namespace React {
  interface CSSProperties {
    [customProperty: `--${string}`]: string
  }
}

declare namespace NodeJS {
  interface ProcessEnv {}
}
