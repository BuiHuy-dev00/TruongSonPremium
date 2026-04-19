import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

/** ESLint flat config — dùng export CommonJS của `eslint-config-next` */
const config = [...require("eslint-config-next/core-web-vitals")];
export default config;
