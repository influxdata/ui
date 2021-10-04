// Libraries
import React, {FC, ChangeEvent, FormEvent, useReducer, useState} from 'react'
import {useSelector, useDispatch} from 'react-redux'

// Components
import BucketOverlayForm from 'src/buckets/components/createBucketForm/BucketOverlayForm'

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

let SchemaType = null,
    MeasurementSchemaCreateRequest = null

if (CLOUD) {
  SchemaType = require('src/client/generatedRoutes').MeasurementSchema
  MeasurementSchemaCreateRequest = require('src/client/generatedRoutes')
      .MeasurementSchemaCreateRequest
}

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

  const [
    newMeasurementSchemaRequests,
    setNewMeasurementSchemaRequests,
  ] = useState(null)
  const [showSchemaValidation, setShowSchemaValidation] = useState(false)

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

  const handleChangeSchemaType = (schemaType: typeof SchemaType): void => {
    dispatch({type: 'updateSchema', payload: schemaType})
  }

  const isValid = () => {
    // are there measurement schemas?
    const haveSchemas =
        !!newMeasurementSchemaRequests && !!newMeasurementSchemaRequests.length

    if (!haveSchemas) {
      // no schemas, nothing to validate, so everything is fine
      return true
    }
    // if so, are they all valid?
    const reducer = (previousValue, currentValue) =>
        previousValue && currentValue.valid

    const alltrue = newMeasurementSchemaRequests.reduce(reducer, true)

    if (alltrue) {
      return true
    }
    // not all true :(

    // if not valid, decorate them to show they are not valid!
    setShowSchemaValidation(true)
    return false
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    if (isValid()) {
      reduxDispatch(createBucketAndUpdate(state, handleUpdateBucket))
      onClose()

    } else {
      console.log("not valid :( sad face :(")
    }
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

  const handleNewMeasurementSchemas = (
      schemas: typeof MeasurementSchemaCreateRequest[],
      resetValidation?: boolean
  ): void => {
    setNewMeasurementSchemaRequests(schemas)
    if (resetValidation) {
      setShowSchemaValidation(false)
    }
  }

  return (
    <BucketOverlayForm
      name={state.name}
      buttonText="Create"
      isEditing={false}
      ruleType={state.ruleType}
      onClose={onClose}
      onSubmit={handleSubmit}
      onChangeInput={handleChangeInput}
      retentionSeconds={retentionSeconds}
      onChangeRuleType={handleChangeRuleType}
      onChangeRetentionRule={handleChangeRetentionRule}
      testID={testID}
      onChangeSchemaType={handleChangeSchemaType}
      onUpdateNewMeasurementSchemas={handleNewMeasurementSchemas}
      showSchemaValidation={showSchemaValidation}
    />
  )
}
