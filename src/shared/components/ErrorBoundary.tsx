// Libraries
import React, {Component, ErrorInfo, memo, ReactChild} from 'react'
import {isEqual} from 'lodash'

// Components
import DefaultErrorMessage from 'src/shared/components/DefaultErrorMessage'

// Utils
import {
  reportErrorThroughHoneyBadger,
  parseComponentName,
} from 'src/shared/utils/errors'

// Types
import {ErrorMessageComponent} from 'src/types'

interface ErrorBoundaryProps {
  errorComponent: ErrorMessageComponent
  children: ReactChild | ReactChild[]
}

interface ErrorBoundaryState {
  error: Error
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public static defaultProps = {errorComponent: DefaultErrorMessage}

  public state: ErrorBoundaryState = {error: null}

  public static getDerivedStateFromError(error: Error) {
    return {error}
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    reportErrorThroughHoneyBadger(error, {
      component: parseComponentName(errorInfo),
    })
  }

  public render() {
    const {error} = this.state

    if (error) {
      return <this.props.errorComponent error={error} />
    }

    return this.props.children
  }
}

export default memo(ErrorBoundary, (prev, next) => isEqual(prev, next))
