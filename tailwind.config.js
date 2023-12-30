/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,vue,jsx,tsx}"],
	plugins: [require("daisyui")],
	daisyui: {
		themes: [
			{
				mytheme: {
					primary: "#e0e7ff",
					secondary: "#ddd6fe",
					accent: "#7c3aed",
					neutral: "#ffffff",
					"base-100": "#ffffff",
					info: "#4f46e5",
					success: "#c7d2fe",
					warning: "#fbbf24",
					error: "#e11d48",
				},
			},
		],
	},
};
