const js = require('@eslint/js');
const svelte = require('svelte-eslint-parser');
const globals = require('globals');

module.exports = [
	js.configs.recommended, // Equivalent to "extends": "eslint:recommended"
	{
		languageOptions: {
			ecmaVersion: 13, // Equivalent to "ecmaVersion": 13
			sourceType: 'module', // Equivalent to "sourceType": "module"
			globals: {
				...globals.browser,
			},
		},
		plugins: {
			svelte, // Adding the svelte-eslint-parser plugin
		},
	},
	{
		files: ['*.svelte'], // Applying the Svelte processor to Svelte files
		processor: svelte,
	},
];
