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
						allowedRoles: ["admin"]
					},
					{
						route: "/pieteikumi/*",
						allowedRoles: ["admin"]
					},
					{
						route: "/pulcini",
						allowedRoles: ["admin"]
					},
					{
						route: "/pulcini/*",
						allowedRoles: ["admin"]
					}
				],
				responseOverrides: {
					"401": {
						"statusCode": 302,
						"redirect": "/.auth/login/aad?post_login_redirect_uri=/pieteikumi"
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
