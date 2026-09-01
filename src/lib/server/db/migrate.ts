import { migrate } from 'drizzle-orm/node-mssql/migrator';
import type { NodeMsSqlDatabase } from 'drizzle-orm/node-mssql';
import type * as schema from './schema';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let migrationComplete = false;

/**
 * Run Drizzle migrations on the database
 * This should be called once when the app initializes
 * @param db Database instance
 * @returns Promise that resolves when migrations are complete
 */
export async function runMigrations(db: NodeMsSqlDatabase<typeof schema>) {
	if (migrationComplete) {
		console.log('Migrations already completed in this instance');
		return;
	}

	try {
		console.log('Starting database migrations...');
		
		// Path to migrations folder relative to this file
		// In production, migrations are in the build output
		const migrationsFolder = path.join(process.cwd(), 'drizzle');
		
		console.log(`Loading migrations from: ${migrationsFolder}`);
		
		await migrate(db, {
			migrationsFolder: migrationsFolder
		});
		
		migrationComplete = true;
		console.log('✓ Database migrations completed successfully');
	} catch (error) {
		console.error('✗ Database migration failed:', error);
		throw new Error(`Database migration failed: ${error instanceof Error ? error.message : String(error)}`);
	}
}
