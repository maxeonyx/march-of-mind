/// <reference types="vite/client" />

// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
declare module "*.vue" {
  import { DefineComponent } from "vue";
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}
