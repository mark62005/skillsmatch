import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		environment: "node",
		globals: true,
		setupFiles: ["./src/test/setup.ts"],
		coverage: {
			provider: "v8",
			reporter: ["text", "lcov"], // text = terminal output, lcov = for future CI reporting
			include: ["src/features/**", "src/inngest/**", "src/middleware/**"],
			exclude: ["src/test/**", "src/**/*.types.ts"],
			thresholds: {
				lines: 80,
				functions: 80,
			},
		},
	},
});
