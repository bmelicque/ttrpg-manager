import preact from "@preact/preset-vite";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [preact()],

    resolve: {
        dedupe: ["preact", "preact/hooks", "preact/jsx-runtime"],
    },
});
