export const iconMap: Record<string, string> = {
  book: '📖',
  help: '❓',
  zap: '⚡',
  star: '⭐',
  bug: '🐛',
  tag: '🏷️',
  check: '✅',
  clock: '⏰',
  flag: '🚩',
  rocket: '🚀',
}

export const getIcon = (iconName: string) => {
  return iconMap[iconName.trim()] || iconName
}
