const HUE_COUNT = 8

// Keyed on the category id so a category keeps its colour when others are added or renamed.
export function categoryColor(categoryId) {
  if (!categoryId) return 'var(--cat-none)'
  return `var(--cat-${(Number(categoryId) % HUE_COUNT) + 1})`
}
