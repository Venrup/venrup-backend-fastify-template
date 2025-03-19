import { fileURLToPath } from "node:url";
import path from "node:path";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import eslintPlugin from '@typescript-eslint/eslint-plugin';
import unusedImports from "eslint-plugin-unused-imports";
import eslintConfigPrettier from "eslint-config-prettier";
import love from 'eslint-config-love'
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
});

export default [
    ...compat.extends("prettier"),
    {
        files: ['src/**/*.{ts}'],
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'module',
            parser: '@typescript-eslint/parser',
            parserOptions: {
                project: "./tsconfig.json",
            },
        },
        plugins: {
            '@typescript-eslint': eslintPlugin,
            "unused-imports": unusedImports,
        },
        rules: {
            "@typescript-eslint/consistent-type-assertions": "off",
            "@typescript-eslint/no-floating-promises": "off",
            "@typescript-eslint/strict-boolean-expressions": "off",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/naming-convention": "off",
            "unused-imports/no-unused-imports": "warn",
            "@typescript-eslint/no-magic-numbers": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-extraneous-class": "off",
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_' },
            ],
        },
    },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    {
        ...love,
        files: ['**/*.js', '**/*.ts'],
    },
    {
        ignores: ['node_modules', 'build']
    },
    eslintConfigPrettier,
];
