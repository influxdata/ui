export interface NotificationSettings {
  notifyEmail?: string
  balanceThreshold?: number
  shouldNotify: boolean
}

export const makeInitial = (notifyEmail: string): NotificationSettings => ({
  notifyEmail,
  balanceThreshold: 10,
  shouldNotify: true,
})
