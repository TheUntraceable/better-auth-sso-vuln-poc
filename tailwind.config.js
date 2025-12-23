
import { heroui } from "@heroui/theme";
/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-sans)"],
                mono: ["var(--font-mono)"],
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            colors: {
                border: {
                    DEFAULT: "hsl(var(--border))",
                    hover: "hsl(var(--border-hover))",
                },
            },
        },
    },
    darkMode: "class",
    plugins: [heroui(), require("tailwindcss-animate")],
};
