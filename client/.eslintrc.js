module.exports = {
	extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:storybook/recommended"
    ],
	parser: '@typescript-eslint/parser',

	parserOptions: {
		project: './tsconfig.json',
		project: true,
		tsconfigRootDir: __dirname,
	},
	plugins: ['@typescript-eslint'],
	root: true,
};
