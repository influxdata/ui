export interface CancelBox<T> {
  id?: string
  promise: Promise<T>
  cancel: () => void
}

export class CancellationError extends Error {
  constructor(...args) {
    super(...args)

    this.name = 'CancellationError'
  }
}
