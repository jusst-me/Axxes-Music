const config = {
  '*.{js,mjs,ts,tsx}': ['eslint --fix --max-warnings=0', 'prettier --write'],
  '*.{json,css,md,mdc,yml,yaml}': ['prettier --write'],
};

export default config;
