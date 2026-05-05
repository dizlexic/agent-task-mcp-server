import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../server/db/schema';
import { nanoid } from 'nanoid';

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }

  const connection = await mysql.createConnection(databaseUrl);
  const db = drizzle(connection, { schema, mode: 'default' });

  const boards = await db.select().from(schema.boards);

  const defaultStatuses = ['backlog', 'todo', 'in_progress', 'review', 'done', 'archive'];

  for (const board of boards) {
    console.log(`Backfilling columns for board ${board.name} (${board.id})`);
    for (let i = 0; i < defaultStatuses.length; i++) {
        await db.insert(schema.boardColumns).values({
            id: nanoid(),
            boardId: board.id,
            name: defaultStatuses[i],
            order: i,
            createdAt: new Date(),
            updatedAt: new Date()
        });
    }
  }

  await connection.end();
  console.log('Backfill completed successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
