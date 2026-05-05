import { eq, and } from 'drizzle-orm';
import { db } from '#server/db';
import { boardColumns } from '#server/db/schema';

export default defineEventHandler(async (event) => {
  const boardId = event.context.params!.id;
  const columnId = event.context.params!.columnId;
  const body = await readBody(event);

  const updatedColumn = await db.update(boardColumns)
    .set({
      name: body.name,
      description: body.description,
      instructions: body.instructions,
      updatedAt: new Date(),
    })
    .where(and(eq(boardColumns.id, columnId), eq(boardColumns.boardId, boardId)));

  return updatedColumn;
});
