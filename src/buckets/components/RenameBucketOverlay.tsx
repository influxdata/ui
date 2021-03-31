// Libraries
import React, {PureComponent} from 'react'
import {withRouter, RouteComponentProps} from 'react-router-dom'
import _ from 'lodash'

// Components
import DangerConfirmationOverlay from 'src/shared/components/dangerConfirmation/DangerConfirmationOverlay'
import RenameBucketForm from 'src/buckets/components/RenameBucketForm'

// Decorators
import {ErrorHandling} from 'src/shared/decorators/errors'
import {Overlay} from '@influxdata/clockface'
@ErrorHandling
class RenameBucketOverlay extends PureComponent<
  RouteComponentProps<{orgID: string}>
> {
  public render() {
    return (
      <Overlay visible={true}>
        <DangerConfirmationOverlay
          title="Rename Bucket"
          message={this.message}
          effectedItems={this.effectedItems}
          onClose={this.handleClose}
          confirmButtonText="I understand, let's rename my Bucket"
        >
          <RenameBucketForm />
        </DangerConfirmationOverlay>
      </Overlay>
    )
  }

  private get message(): string {
    return 'Updating the name of a Bucket can have unintended consequences. Anything that references this Bucket by name will stop working including:'
  }

  private get effectedItems(): string[] {
    return [
      'Queries',
      'Dashboards',
      'Tasks',
      'Telegraf Configurations',
      'Templates',
    ]
  }

  private handleClose = () => {
    const {history, match} = this.props
    history.push(`/orgs/${match.params.orgID}/load-data/buckets`)
  }
}

export default withRouter(RenameBucketOverlay)
