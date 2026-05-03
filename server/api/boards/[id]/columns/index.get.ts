import { eq } from 'drizzle-orm';
import { db } from '../../../../db';
import { boardColumns } from '../../../../db/schema';

export default defineEventHandler(async (event) => {
  const boardId = event.context.params!.id;
  
  const columns = await db.select().from(boardColumns).where(eq(boardColumns.boardId, boardId)).orderBy(boardColumns.order);
  
  return columns;
});
