export type HealthDashboardCell = {
  name: string
  missingBuckets: string[]
}

export type HealthDashboard = {
  name: string
  cells: HealthDashboardCell[]
  healthy: boolean
}
