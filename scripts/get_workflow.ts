import 'dotenv/config'
import { db } from '../server/db'
import { instructions } from '../server/db/schema'
import { eq, and, isNull } from 'drizzle-orm'

async function getInstructionContent(boardId: string, type: 'agent_instructions' | 'task_workflow'): Promise<string> {
  const boardInstrResults = await db.select().from(instructions)
    .where(and(eq(instructions.boardId, boardId), eq(instructions.type, type)))
  const boardInstr = boardInstrResults[0]
  if (boardInstr) return boardInstr.content

  const globalInstrResults = await db.select().from(instructions)
    .where(and(isNull(instructions.boardId), eq(instructions.type, type)))
  const globalInstr = globalInstrResults[0]
  return globalInstr?.content || ''
}

async function run() {
  const boardId = 'vteYPDXLCCcU'
  const content = await getInstructionContent(boardId, 'task_workflow')
  console.log(content)
}

run()
