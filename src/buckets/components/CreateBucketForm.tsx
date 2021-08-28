// Libraries
import React, {FC, ChangeEvent, FormEvent, useReducer} from 'react'
import {useSelector, useDispatch} from 'react-redux'

// Components
import BucketOverlayForm from 'src/buckets/components/BucketOverlayForm'

// Actions
import {createBucketAndUpdate} from 'src/buckets/actions/thunks'

// Constants
import {CLOUD} from 'src/shared/constants'

// Types
import {
  createBucketReducer,
  RuleType,
  initialBucketState,
  DEFAULT_RULES,
} from 'src/buckets/reducers/createBucket'
import {AppState, Bucket, RetentionRule} from 'src/types'

// Selectors
import {getOrg} from 'src/organizations/selectors'
import {getBucketRetentionLimit} from 'src/cloud/utils/limits'
import {getOverlayParams} from 'src/overlays/selectors'

interface CreateBucketFormProps {
  onClose: () => void
  testID?: string
}

export const CreateBucketForm: FC<CreateBucketFormProps> = props => {
  const {onClose, testID = 'create-bucket-form'} = props
  const org = useSelector(getOrg)
  const isRetentionLimitEnforced = useSelector((state: AppState): boolean => {
    if (CLOUD) {
      return getBucketRetentionLimit(state)
    }
    return false
  })
  const overlayParams = useSelector(getOverlayParams)
  const reduxDispatch = useDispatch()
  const [state, dispatch] = useReducer(
    createBucketReducer,
    initialBucketState(isRetentionLimitEnforced, org.id)
  )

  const retentionRule = state.retentionRules.find(
    (rule: RetentionRule) => rule.type === 'expire'
  )
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()

    reduxDispatch(createBucketAndUpdate(state, handleUpdateBucket))
    onClose()
  }

  const handleUpdateBucket = (bucket: Bucket): void => {
    if (overlayParams?.onUpdateBucket) {
      overlayParams.onUpdateBucket(bucket)
    }
  }

  const handleChangeInput = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value

    if (event.target.name === 'name') {
      dispatch({type: 'updateName', payload: value})
    }
  }

  return (
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
      testID={testID}
    />
  )
}
