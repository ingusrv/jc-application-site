import fs from 'fs';
import path from 'path';

const adapterPath = path.resolve('node_modules/svelte-adapter-azure-swa/index.js');

if (fs.existsSync(adapterPath)) {
	let content = fs.readFileSync(adapterPath, 'utf8');
	let modified = false;

	if (!content.includes("format: 'esm'")) {
		content = content.replace(
			"platform: 'node',",
			"platform: 'node',\n\t\t\t\tformat: 'esm',\n\t\t\t\tbanner: {\n\t\t\t\t\tjs: \"import { createRequire as __createRequire } from 'node:module'; const require = __createRequire(import.meta.url);\"\n\t\t\t\t},"
		);
		modified = true;
	}

	if (!content.includes('...esbuildOptions,')) {
		content = content.replace(
			"sourcemap: 'linked',",
			"sourcemap: 'linked',\n\t\t\t\t...esbuildOptions,"
		);
		modified = true;
	}

	if (!content.includes("type: 'module'")) {
		content = content.replace(
			'await esbuild.build(default_options);',
			"await esbuild.build(default_options);\n\t\t\twriteFileSync(join(apiDir, 'package.json'), JSON.stringify({ main: 'sk_render/index.js', type: 'module', dependencies: { '@azure/functions': '^4' } }, null, 2));"
		);
		modified = true;
	}

	if (modified) {
		fs.writeFileSync(adapterPath, content, 'utf8');
		console.log('✅ svelte-adapter-azure-swa successfully patched for ESM & SvelteKit 2');
	}
}
