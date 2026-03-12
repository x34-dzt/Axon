import config from "./oxlint.json" with { type: "json" };

export type OxlintConfig = typeof config;
export default config;
