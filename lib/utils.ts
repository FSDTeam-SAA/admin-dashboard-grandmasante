import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type FormatCfaOptions = {
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  fallback?: string
}

export function formatCfa(
  value: number | string | null | undefined,
  options: FormatCfaOptions = {},
) {
  if (value === null || value === undefined || value === "") {
    return options.fallback ?? "CFA 0"
  }

  const numericValue =
    typeof value === "number" ? value : Number(String(value).replace(/,/g, ""))

  if (!Number.isFinite(numericValue)) {
    return options.fallback ?? "CFA 0"
  }

  return `CFA ${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: options.minimumFractionDigits ?? 0,
    maximumFractionDigits: options.maximumFractionDigits ?? 2,
  }).format(numericValue)}`
}
