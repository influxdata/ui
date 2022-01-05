export type HealthDashboardCell = {
  name: string
  missingBuckets: string[]
}

export type HealthDashboard = {
  name: string
  cells: HealthDashboardCell[]
  healthy: boolean
}

export type HealthTask = {
  name: string
  healthy: boolean
  missingBuckets: string[]
}
