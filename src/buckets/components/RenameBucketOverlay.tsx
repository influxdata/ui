// Libraries
import React, {FC, useCallback} from 'react'
import {useHistory} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Components
import DangerConfirmationOverlay from 'src/shared/components/dangerConfirmation/DangerConfirmationOverlay'
import RenameBucketForm from 'src/buckets/components/RenameBucketForm'
import {getOrg} from 'src/organizations/selectors'

// Decorators
import {Overlay} from '@influxdata/clockface'

const MESSAGE =
  'Updating the name of a Bucket can have unintended consequences. Anything that references this Bucket by name will stop working including:'
const EFFECTED_ITEMS = [
  'Queries',
  'Dashboards',
  'Tasks',
  'Telegraf Configurations',
  'Templates',
]

const RenameBucketOverlay: FC = () => {
  const history = useHistory()
  const org = useSelector(getOrg)
  const handleClose = useCallback(() => {
    history.push(`/orgs/${org.id}/load-data/buckets`)
  }, [history, org])

  return (
    <Overlay visible={true}>
      <DangerConfirmationOverlay
        title="Rename Bucket"
        message={MESSAGE}
        effectedItems={EFFECTED_ITEMS}
        onClose={handleClose}
        confirmButtonText="I understand, let's rename my Bucket"
      >
        <RenameBucketForm />
      </DangerConfirmationOverlay>
    </Overlay>
  )
}

export default RenameBucketOverlay
