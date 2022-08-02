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
import {AppState, Bucket, OwnBucket, RetentionRule} from 'src/types'
import {event} from 'src/cloud/utils/reporting'

// Selectors
import {getOrg} from 'src/organizations/selectors'
import {getBucketRetentionLimit} from 'src/cloud/utils/limits'
import {getOverlayParams} from 'src/overlays/selectors'
import {areNewSchemasValid} from 'src/buckets/components/createBucketForm/measurementSchemaUtils'

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
  useSimplifiedBucketForm?: boolean
  callbackAfterBucketCreation?: (bucket: OwnBucket) => void
}

export const CreateBucketForm: FC<CreateBucketFormProps> = props => {
  const {
    onClose,
    testID = 'create-bucket-form',
    useSimplifiedBucketForm = false,
  } = props
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

  const retentionRule = state.retentionRules?.find(
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
    // are we in explicit schema mode?  the user could choose explicit, add some stuff, then change their mind
    //  if they are in implicit, nothing to check; just return true:

    if (state.schemaType === 'implicit') {
      return true
    }

    // ok; we are in explicit mode:  keep going!
    const result = areNewSchemasValid(newMeasurementSchemaRequests)

    if (result) {
      return result
    }

    // not all true :(

    // if not valid, decorate them to show they are not valid!
    setShowSchemaValidation(true)
    return false
  }

  const handleSubmit = (evt: FormEvent<HTMLFormElement>): void => {
    evt.preventDefault()
    if (isValid()) {
      let mSchemas = []
      if (state.schemaType === 'explicit' && newMeasurementSchemaRequests) {
        mSchemas = newMeasurementSchemaRequests.map(item => ({
          columns: item.columns,
          name: item.name,
        }))
      }

      event('bucket.creation')

      for (let i = 0; i < mSchemas.length; i++) {
        event('bucket.schema.explicit.creation.uploadSchema')
      }

      reduxDispatch(createBucketAndUpdate(state, handleUpdateBucket, mSchemas))
      onClose()
    }
  }

  const handleUpdateBucket = (bucket: Bucket): void => {
    if (overlayParams?.onUpdateBucket) {
      overlayParams.onUpdateBucket(bucket)
    }

    if (props.callbackAfterBucketCreation) {
      props.callbackAfterBucketCreation(bucket)
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
      onAddNewMeasurementSchemas={handleNewMeasurementSchemas}
      showSchemaValidation={showSchemaValidation}
      useSimplifiedBucketForm={useSimplifiedBucketForm}
    />
  )
}
