export const RANKING_CATEGORIES = {
  ai_innovator: {
    key: "ai_innovator",
    name: "AI Innovator",
    nameRu: "AI Инноватор",
    description: "Most creative and effective AI usage",
    descriptionRu: "Самое креативное и эффективное использование AI",
    icon: "sparkles",
  },
  best_optimizer: {
    key: "best_optimizer",
    name: "Best Optimizer",
    nameRu: "Лучший оптимизатор",
    description: "Best process optimization using AI tools",
    descriptionRu: "Лучшая оптимизация процессов с помощью AI",
    icon: "zap",
  },
  ai_contributor: {
    key: "ai_contributor",
    name: "AI Contributor",
    nameRu: "AI Контрибьютор",
    description: "Most tools created and shared with colleagues",
    descriptionRu: "Больше всего инструментов создано и передано коллегам",
    icon: "wrench",
  },
  silent_hero: {
    key: "silent_hero",
    name: "Silent Hero",
    nameRu: "Тихий герой",
    description: "Consistent daily AI usage and steady productivity",
    descriptionRu: "Стабильное ежедневное использование AI и продуктивность",
    icon: "shield",
  },
} as const;

export type RankingCategoryKey = keyof typeof RANKING_CATEGORIES;
