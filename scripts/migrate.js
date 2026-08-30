import sql from 'mssql';
import * as dotenv from 'dotenv';
import { createApplicationsTableSQL } from '../src/lib/server/db/schema.js';

dotenv.config();

async function runMigration() {
	const connectionString =
		process.env.DATABASE_URL ||
		'Server=localhost,1433;Database=jcapplicationform;User Id=sa;Password=jcapplicationformdev;Encrypt=false;TrustServerCertificate=true;';

	console.log('Connecting to MSSQL / Azure SQL...');
	const pool = await sql.connect(connectionString);
	console.log('Connected. Running table initialization / migration...');

	await pool.request().batch(createApplicationsTableSQL);
	console.log('✅ Azure SQL migration completed successfully!');
	await pool.close();
}

runMigration().catch((err) => {
	console.error('❌ Migration failed:', err);
	process.exit(1);
});
