// Libraries
import React, {
  FunctionComponent,
  useEffect,
  useState,
  ChangeEvent,
  FormEvent,
  useCallback,
} from 'react'
import {withRouter, RouteComponentProps} from 'react-router-dom'
import {connect, ConnectedProps, useDispatch} from 'react-redux'
import {get} from 'lodash'

// Components
import {
  Overlay,
  RemoteDataState,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'
import BucketOverlayForm from 'src/buckets/components/BucketOverlayForm'

// Actions
import {updateBucket} from 'src/buckets/actions/thunks'
import {notify} from 'src/shared/actions/notifications'

// APIs
import * as api from 'src/client'

// Constants
import {DEFAULT_SECONDS} from 'src/buckets/components/Retention'
import {getBucketFailed} from 'src/shared/copy/notifications'

// Types
import {OwnBucket} from 'src/types'

interface DispatchProps {
  onUpdateBucket: typeof updateBucket
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps & RouteComponentProps<{bucketID: string; orgID: string}>

const UpdateBucketOverlay: FunctionComponent<Props> = ({
  onUpdateBucket,
  match,
  history,
}) => {
  const {orgID, bucketID} = match.params
  const dispatch = useDispatch()
  const [bucketDraft, setBucketDraft] = useState<OwnBucket>(null)

  const [loadingStatus, setLoadingStatus] = useState(RemoteDataState.Loading)

  const [retentionSelection, setRetentionSelection] = useState(DEFAULT_SECONDS)

  const handleClose = useCallback(() => {
    history.push(`/orgs/${orgID}/load-data/buckets`)
  }, [orgID, history])

  useEffect(() => {
    const fetchBucket = async () => {
      const resp = await api.getBucket({bucketID})

      if (resp.status !== 200) {
        dispatch(notify(getBucketFailed(bucketID, resp.data.message)))
        handleClose()
        return
      }
      setBucketDraft(resp.data as OwnBucket)

      const rules = get(resp.data, 'retentionRules', [])
      const rule = rules.find(r => r.type === 'expire')
      if (rule) {
        setRetentionSelection(rule.everySeconds)
      }

      setLoadingStatus(RemoteDataState.Done)
    }
    fetchBucket()
  }, [bucketID, handleClose, dispatch])

  const handleChangeRetentionRule = (everySeconds: number): void => {
    setBucketDraft({
      ...bucketDraft,
      retentionRules: [{type: 'expire' as 'expire', everySeconds}],
    })
    setRetentionSelection(everySeconds)
  }

  const handleChangeRuleType = (ruleType: 'expire' | null) => {
    if (ruleType) {
      setBucketDraft({
        ...bucketDraft,
        retentionRules: [
          {type: 'expire' as 'expire', everySeconds: retentionSelection},
        ],
      })
    } else {
      setBucketDraft({
        ...bucketDraft,
        retentionRules: [],
      })
    }
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    onUpdateBucket(bucketDraft)
    handleClose()
  }

  const handleChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    const key = e.target.name
    const value = e.target.value
    setBucketDraft({...bucketDraft, [key]: value})
  }

  const handleClickRename = () => {
    history.push(`/orgs/${orgID}/load-data/buckets/${bucketID}/rename`)
  }

  const rules = get(bucketDraft, 'retentionRules', [])
  const rule = rules.find(r => r.type === 'expire')

  const retentionSeconds = rule ? rule.everySeconds : retentionSelection
  const ruleType = rule ? ('expire' as 'expire') : null

  return (
    <Overlay visible={true}>
      <Overlay.Container maxWidth={500}>
        <Overlay.Header title="Edit Bucket" onDismiss={handleClose} />
        <SpinnerContainer
          spinnerComponent={<TechnoSpinner />}
          loading={loadingStatus}
        >
          <Overlay.Body>
            <BucketOverlayForm
              name={bucketDraft ? bucketDraft.name : ''}
              buttonText="Save Changes"
              ruleType={ruleType}
              onClose={handleClose}
              onSubmit={handleSubmit}
              disableRenaming={true}
              onChangeInput={handleChangeInput}
              retentionSeconds={retentionSeconds}
              onChangeRuleType={handleChangeRuleType}
              onChangeRetentionRule={handleChangeRetentionRule}
              onClickRename={handleClickRename}
            />
          </Overlay.Body>
        </SpinnerContainer>
      </Overlay.Container>
    </Overlay>
  )
}

const mdtp = {
  onUpdateBucket: updateBucket,
}

const connector = connect(null, mdtp)

export default connect<{}, DispatchProps>(
  null,
  mdtp
)(withRouter(UpdateBucketOverlay))
