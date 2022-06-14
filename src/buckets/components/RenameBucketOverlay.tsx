// Libraries
import React, {FC} from 'react'
import {useHistory} from 'react-router-dom'

// Components
import DangerConfirmationOverlay from 'src/shared/components/dangerConfirmation/DangerConfirmationOverlay'
import RenameBucketForm from 'src/buckets/components/RenameBucketForm'

// Decorators
import {Overlay} from '@influxdata/clockface'
import {useSelector} from 'react-redux'
import {getOrg} from 'src/organizations/selectors'

const RenameBucketOverlay: FC = () => {
  const orgID = useSelector(getOrg).id
  const history = useHistory()

  const handleClose = () => {
    history.push(`/orgs/${orgID}/load-data/buckets`)
  }

  return (
    <Overlay visible={true}>
      <DangerConfirmationOverlay
        title="Rename Bucket"
        message="Updating the name of a Bucket can have unintended consequences. Anything that references this Bucket by name will stop working including:"
        effectedItems={[
          'Queries',
          'Dashboards',
          'Tasks',
          'Telegraf Configurations',
          'Templates',
        ]}
        onClose={handleClose}
        confirmButtonText="I understand, let's rename my Bucket"
      >
        <RenameBucketForm />
      </DangerConfirmationOverlay>
    </Overlay>
  )
}

export default RenameBucketOverlay
