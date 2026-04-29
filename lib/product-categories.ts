export const PRODUCT_CATEGORY_OPTIONS = [
  { value: "herbal-remedies", label: "Herbal Remedies" },
  { value: "teas", label: "Teas" },
  { value: "tinctures", label: "Tinctures" },
  { value: "essential-oils", label: "Essential Oils" },
] as const

export type ProductCategoryValue = (typeof PRODUCT_CATEGORY_OPTIONS)[number]["value"]

export function getProductCategoryLabel(value?: string | null) {
  if (!value) return "Uncategorized"
  return (
    PRODUCT_CATEGORY_OPTIONS.find((option) => option.value === value)?.label ??
    "Uncategorized"
  )
}
