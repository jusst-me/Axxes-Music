const config = {
  plugins: ['prettier-plugin-tailwindcss'],
  arrowParens: 'avoid',
  singleQuote: true,
  semi: true,
  // Cursor rule files are Markdown with front matter; Prettier cannot infer that from the extension.
  overrides: [{ files: '*.mdc', options: { parser: 'markdown' } }],
};

export default config;
