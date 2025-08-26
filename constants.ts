
export const CATEGORY_MAP = {
  salary: { 'pt-BR': 'Salário', 'en-US': 'Salary', 'zh-CN': '薪水', 'ru-RU': 'Зарплата' },
  food: { 'pt-BR': 'Alimentação', 'en-US': 'Food', 'zh-CN': '餐饮', 'ru-RU': 'Еда' },
  transport: { 'pt-BR': 'Transporte', 'en-US': 'Transport', 'zh-CN': '交通', 'ru-RU': 'Транспорт' },
  housing: { 'pt-BR': 'Moradia', 'en-US': 'Housing', 'zh-CN': '住房', 'ru-RU': 'Жилье' },
  leisure: { 'pt-BR': 'Lazer', 'en-US': 'Leisure', 'zh-CN': '休闲', 'ru-RU': 'Досуг' },
  health: { 'pt-BR': 'Saúde', 'en-US': 'Health', 'zh-CN': '健康', 'ru-RU': 'Здоровье' },
  education: { 'pt-BR': 'Educação', 'en-US': 'Education', 'zh-CN': '教育', 'ru-RU': 'Образование' },
  investments: { 'pt-BR': 'Investimentos', 'en-US': 'Investments', 'zh-CN': '投资', 'ru-RU': 'Инвестиции' },
  other: { 'pt-BR': 'Outros', 'en-US': 'Other', 'zh-CN': '其他', 'ru-RU': 'Другое' },
};

export type CategoryKey = keyof typeof CATEGORY_MAP;

export const CATEGORY_KEYS = Object.keys(CATEGORY_MAP) as CategoryKey[];
