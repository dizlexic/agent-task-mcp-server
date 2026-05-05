export const iconMap: Record<string, string> = {
  book: '📖',
  help: '❓',
  zap: '⚡',
  star: '⭐',
  bug: '🐛',
}

export const getIcon = (iconName: string) => {
  return iconMap[iconName.trim()] || iconName
}
