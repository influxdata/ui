// Libraries
import React, {PureComponent} from 'react'
import Loadable from 'react-loadable'
import {connect, ConnectedProps} from 'react-redux'
import {withRouter, RouteComponentProps} from 'react-router-dom'

// Components
import {ErrorHandling} from 'src/shared/decorators/errors'
import {Overlay} from '@influxdata/clockface'

const spinner = <div />
const CollectorsStepSwitcher = Loadable({
  loader: () =>
    import(
      'src/dataLoaders/components/collectorsWizard/CollectorsStepSwitcher'
    ),
  loading() {
    return spinner
  },
})

// Actions
import {notify as notifyAction} from 'src/shared/actions/notifications'
import {
  setBucketInfo,
  incrementCurrentStepIndex,
  decrementCurrentStepIndex,
  setCurrentStepIndex,
  clearSteps,
} from 'src/dataLoaders/actions/steps'

import {clearDataLoaders} from 'src/dataLoaders/actions/dataLoaders'

// Types
import {AppState, Bucket, ResourceType} from 'src/types'

// Selectors
import {getAll} from 'src/resources/selectors'
import {getOrg} from 'src/organizations/selectors'

// Utils
import {isSystemBucket} from 'src/buckets/constants'

export interface CollectorsStepProps {
  currentStepIndex: number
  onIncrementCurrentStepIndex: () => void
  onDecrementCurrentStepIndex: () => void
  notify: typeof notifyAction
  onExit: () => void
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps & RouteComponentProps<{orgID: string}>

@ErrorHandling
class CollectorsWizard extends PureComponent<Props> {
  public componentDidMount() {
    const {bucket, buckets} = this.props
    if (!bucket && buckets && buckets.length) {
      const {orgID, name, id} = buckets[0]
      this.props.onSetBucketInfo(orgID, name, id)
    }
    this.props.onSetCurrentStepIndex(0)
  }

  public render() {
    return (
      <Overlay visible={true}>
        <Overlay.Container maxWidth={1200}>
          <Overlay.Header
            title="Create a Telegraf Configuration"
            onDismiss={this.handleDismiss}
          />
          <Overlay.Body className="data-loading--overlay">
            <CollectorsStepSwitcher stepProps={this.stepProps} />
          </Overlay.Body>
        </Overlay.Container>
      </Overlay>
    )
  }

  private handleDismiss = () => {
    const {history, org} = this.props
    const {onClearDataLoaders, onClearSteps} = this.props
    onClearDataLoaders()
    onClearSteps()
    history.push(`/orgs/${org.id}/load-data/telegrafs`)
  }

  private get stepProps(): CollectorsStepProps {
    const {
      notify,
      currentStepIndex,
      onDecrementCurrentStepIndex,
      onIncrementCurrentStepIndex,
    } = this.props

    return {
      currentStepIndex,
      onIncrementCurrentStepIndex,
      onDecrementCurrentStepIndex,
      notify,
      onExit: this.handleDismiss,
    }
  }
}

const mstp = (state: AppState) => {
  const {
    links,
    dataLoading: {
      dataLoaders: {telegrafPlugins},
      steps: {currentStep, substep, bucket},
    },
    me: {name},
    telegrafEditor,
  } = state

  const buckets = getAll<Bucket>(state, ResourceType.Buckets)

  const nonSystemBuckets = buckets.filter(
    bucket => !isSystemBucket(bucket.name)
  )

  const org = getOrg(state)

  return {
    links,
    telegrafPlugins,
    text: telegrafEditor.text,
    currentStepIndex: currentStep,
    substep,
    username: name,
    bucket,
    buckets: nonSystemBuckets,
    org,
  }
}

const mdtp = {
  notify: notifyAction,
  onSetBucketInfo: setBucketInfo,
  onIncrementCurrentStepIndex: incrementCurrentStepIndex,
  onDecrementCurrentStepIndex: decrementCurrentStepIndex,
  onSetCurrentStepIndex: setCurrentStepIndex,
  onClearDataLoaders: clearDataLoaders,
  onClearSteps: clearSteps,
}

const connector = connect(mstp, mdtp)

export default connector(withRouter(CollectorsWizard))
