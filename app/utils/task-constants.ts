import type { TaskStatus } from '../composables/useTasks'

export const COLUMNS: { title: string; status: TaskStatus }[] = [
  { title: 'Backlog', status: 'backlog' },
  { title: 'To Do', status: 'todo' },
  { title: 'In Progress', status: 'in_progress' },
  { title: 'Review', status: 'review' },
  { title: 'Done', status: 'done' },
]

export const COLUMN_COLORS: Record<TaskStatus, { border: string; glow: string; badge: string; text: string }> = {
  backlog: {
    border: 'border-t-gray-400 dark:border-t-gray-600',
    glow: '',
    badge: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
    text: 'text-gray-500 dark:text-gray-400',
  },
  todo: {
    border: 'border-t-neon-cyan',
    glow: 'dark:shadow-[0_0_15px_rgba(0,240,255,0.07)]',
    badge: 'bg-neon-cyan/10 text-cyan-600 dark:text-neon-cyan border border-neon-cyan/20',
    text: 'text-cyan-600 dark:text-neon-cyan',
  },
  in_progress: {
    border: 'border-t-neon-orange',
    glow: 'dark:shadow-[0_0_15px_rgba(255,107,43,0.07)]',
    badge: 'bg-neon-orange/10 text-orange-600 dark:text-neon-orange border border-neon-orange/20',
    text: 'text-orange-600 dark:text-neon-orange',
  },
  review: {
    border: 'border-t-neon-purple',
    glow: 'dark:shadow-[0_0_15px_rgba(168,85,247,0.07)]',
    badge: 'bg-neon-purple/10 text-purple-600 dark:text-neon-purple border border-neon-purple/20',
    text: 'text-purple-600 dark:text-neon-purple',
  },
  done: {
    border: 'border-t-neon-green',
    glow: 'dark:shadow-[0_0_15px_rgba(34,238,136,0.07)]',
    badge: 'bg-neon-green/10 text-green-600 dark:text-neon-green border border-neon-green/20',
    text: 'text-green-600 dark:text-neon-green',
  },
}
