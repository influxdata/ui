// Libraries
import React, {FC, ChangeEvent, FormEvent, useReducer, useContext} from 'react'
import {useSelector, useDispatch} from 'react-redux'

// Components
import {Overlay} from '@influxdata/clockface'
import BucketOverlayForm from 'src/buckets/components/BucketOverlayForm'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

// Actions
import {createBucketAndUpdate} from 'src/buckets/actions/thunks'

// Types
import {
  createBucketReducer,
  RuleType,
  initialBucketState,
  DEFAULT_RULES,
} from 'src/buckets/reducers/createBucket'
import {Bucket} from 'src/types'

// Selectors
import {getOrg} from 'src/organizations/selectors'
import {getBucketRetentionLimit} from 'src/cloud/utils/limits'
import {getOverlayParams} from 'src/overlays/selectors'

const CreateBucketOverlay: FC = () => {
  const org = useSelector(getOrg)
  const isRetentionLimitEnforced = useSelector(getBucketRetentionLimit)
  const overlayParams = useSelector(getOverlayParams)
  const reduxDispatch = useDispatch()
  const {onClose} = useContext(OverlayContext)
  const [state, dispatch] = useReducer(
    createBucketReducer,
    initialBucketState(isRetentionLimitEnforced, org.id)
  )

  const retentionRule = state.retentionRules.find(r => r.type === 'expire')
  const retentionSeconds = retentionRule ? retentionRule.everySeconds : 3600

  const handleChangeRuleType = (ruleType: RuleType): void => {
    if (ruleType === 'expire') {
      dispatch({type: 'updateRetentionRules', payload: DEFAULT_RULES})
    } else {
      dispatch({type: 'updateRetentionRules', payload: []})
    }
    dispatch({type: 'updateRuleType', payload: ruleType})
  }

  const handleChangeRetentionRule = (everySeconds: number): void => {
    const retentionRules = [
      {
        type: 'expire',
        everySeconds,
      },
    ]

    dispatch({type: 'updateRetentionRules', payload: retentionRules})
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()

    reduxDispatch(createBucketAndUpdate(state, handleUpdateBucket))
    onClose()
  }

  const handleUpdateBucket = (bucket: Bucket): void => {
    if (overlayParams?.onUpdateBucket) {
      overlayParams.onUpdateBucket(bucket)
    }
  }

  const handleChangeInput = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value

    if (e.target.name === 'name') {
      dispatch({type: 'updateName', payload: value})
    }
  }

  return (
    <Overlay.Container maxWidth={400}>
      <Overlay.Header title="Create Bucket" onDismiss={onClose} />
      <Overlay.Body>
        <BucketOverlayForm
          name={state.name}
          buttonText="Create"
          disableRenaming={false}
          ruleType={state.ruleType}
          onClose={onClose}
          onSubmit={handleSubmit}
          onChangeInput={handleChangeInput}
          retentionSeconds={retentionSeconds}
          onChangeRuleType={handleChangeRuleType}
          onChangeRetentionRule={handleChangeRetentionRule}
        />
      </Overlay.Body>
    </Overlay.Container>
  )
}

export default CreateBucketOverlay
