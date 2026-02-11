module.exports = {
  '**/*.{js,jsx,ts,tsx,json,css}': ['eslint --fix --no-warn-ignored'],
  '**/*.ts?(x)': () => 'npm run check-types',
};
