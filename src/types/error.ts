export enum NetworkErrorTypes {
  UnauthorizedError = 'UnauthorizedError', // 401
  NotFoundError = 'NotFoundError', // 404
  OrgNameConflictError = 'OrgNameConflictError', // 409
  UnprocessableEntityError = 'UnprocessableEntity', // 422
  ServerError = 'ServerError', // 500
  GenericError = 'GenericError',
}

// 401 error
export class UnauthorizedError extends Error {
  constructor(message) {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

// 404 error
export class NotFoundError extends Error {
  constructor(message) {
    super(message)
    this.name = 'NotFoundError'
  }
}

// 409 Error
export class OrgNameConflictError extends Error {
  constructor(message) {
    super(message)
    this.name = 'OrgNameConflictError'
  }
}

// 422 error
export class UnprocessableEntityError extends Error {
  constructor(message) {
    super(message)
    this.name = 'UnprocessableEntityError'
  }
}

// 500 error
export class ServerError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ServerError'
  }
}

export class GenericError extends Error {
  constructor(message) {
    super(message)
    this.name = 'GenericError'
  }
}
