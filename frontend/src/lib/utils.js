import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Format uptime (milisekundy -> "2h 15m")
export function formatUptime(ms) {
  if (!ms || ms === 0) return '0s'

  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m`
  return `${seconds}s`
}

// Format memory (bytes -> "45 MB")
export function formatMemory(bytes) {
  if (!bytes || bytes === 0) return '0 B'

  const mb = bytes / (1024 * 1024)
  const gb = mb / 1024

  if (gb >= 1) return `${gb.toFixed(2)} GB`
  return `${mb.toFixed(0)} MB`
}

// Format CPU (procenta)
export function formatCPU(cpu) {
  if (!cpu && cpu !== 0) return '0%'
  return `${cpu.toFixed(1)}%`
}
