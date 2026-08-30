import { drizzle, type NodeMsSqlDatabase } from 'drizzle-orm/node-mssql';
import sql from 'mssql';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config();

let dbInstance: NodeMsSqlDatabase<typeof schema> | null = null;
let connectionPool: sql.ConnectionPool | null = null;

export async function getDbPool(): Promise<sql.ConnectionPool> {
	if (connectionPool && connectionPool.connected) {
		return connectionPool;
	}

	const connectionString = process.env.DATABASE_URL;

	if (!connectionString) {
		throw new Error('DATABASE_URL environment variable is not set');
	}

	connectionPool = await sql.connect(connectionString);
	return connectionPool;
}

export async function getDb(): Promise<NodeMsSqlDatabase<typeof schema>> {
	if (dbInstance) {
		return dbInstance;
	}

	const pool = await getDbPool();
	dbInstance = drizzle({ client: pool, schema });
	return dbInstance;
}

export { schema };
export * from './schema';
