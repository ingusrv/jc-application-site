import azure from 'svelte-adapter-azure-swa';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: azure({
			customStaticWebAppConfig: {
				routes: [
					{
						route: "/pieteikumi",
						allowedRoles: ["admin"],
						methods: ["GET", "HEAD", "POST", "PUT", "DELETE", "PATCH"],
						rewrite: "/api/sk_render"
					},
					{
						route: "/pieteikumi/*",
						allowedRoles: ["admin"],
						methods: ["GET", "HEAD", "POST", "PUT", "DELETE", "PATCH"],
						rewrite: "/api/sk_render"
					},
					{
						route: "/pulcini",
						allowedRoles: ["admin"],
						methods: ["GET", "HEAD", "POST", "PUT", "DELETE", "PATCH"],
						rewrite: "/api/sk_render"
					},
					{
						route: "/pulcini/*",
						allowedRoles: ["admin"],
						methods: ["GET", "HEAD", "POST", "PUT", "DELETE", "PATCH"],
						rewrite: "/api/sk_render"
					}
				],
				responseOverrides: {
					"401": {
						"statusCode": 302,
						"redirect": "/"
					},
					"403": {
						"statusCode": 302,
						"redirect": "/"
					}
				},
			}
		}),
		alias: {
			$lib: './src/lib',
			'$lib/*': './src/lib/*'
		}
	}
};

export default config;
