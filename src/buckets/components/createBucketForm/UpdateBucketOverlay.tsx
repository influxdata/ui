// Libraries
import React, {
  FunctionComponent,
  useEffect,
  useState,
  ChangeEvent,
  FormEvent,
  useCallback,
} from 'react'
import {useParams, useHistory} from 'react-router-dom'
import {useDispatch, useSelector} from 'react-redux'
import {get} from 'lodash'

// Components
import {
  Overlay,
  RemoteDataState,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'
import BucketOverlayForm from 'src/buckets/components/createBucketForm/BucketOverlayForm'

// Actions
import {
  getBucketSchema,
  updateBucket,
  addSchemaToBucket,
  updateMeasurementSchema,
} from 'src/buckets/actions/thunks'
import {notify} from 'src/shared/actions/notifications'

// APIs
import * as api from 'src/client'

// Constants
import {DEFAULT_SECONDS} from 'src/buckets/components/Retention'
import {getBucketFailed} from 'src/shared/copy/notifications'

// Types
import {OwnBucket} from 'src/types'
import {CLOUD} from 'src/shared/constants'
import {event} from 'src/cloud/utils/reporting'
import {
  areNewSchemasValid,
  areSchemaUpdatesValid,
} from 'src/buckets/components/createBucketForm/measurementSchemaUtils'

import {SchemaUpdateInfo} from 'src/buckets/components/createBucketForm/MeasurementSchemaSection'

import {getBucketOverlayWidth} from 'src/buckets/constants'
import {getOrg} from 'src/organizations/selectors'

let SchemaType = null,
  MeasurementSchemaCreateRequest = null

if (CLOUD) {
  SchemaType = require('src/client/generatedRoutes').MeasurementSchema
  MeasurementSchemaCreateRequest =
    require('src/client/generatedRoutes').MeasurementSchemaCreateRequest
}

const UpdateBucketOverlay: FunctionComponent = () => {
  const history = useHistory()
  const {bucketID} = useParams<{bucketID: string}>()
  const orgID = useSelector(getOrg).id
  const dispatch = useDispatch()
  const [bucketDraft, setBucketDraft] = useState<OwnBucket>(null)

  const [loadingStatus, setLoadingStatus] = useState(RemoteDataState.Loading)

  const [retentionSelection, setRetentionSelection] = useState(DEFAULT_SECONDS)

  const [schemaType, setSchemaType] = useState('implicit')
  const [measurementSchemaList, setMeasurementSchemaList] = useState(null)
  const [newMeasurementSchemaRequests, setNewMeasurementSchemaRequests] =
    useState(null)

  const [measurementSchemaUpdates, setMeasurementSchemaUpdates] = useState(null)

  const [showSchemaValidation, setShowSchemaValidation] = useState(false)

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

      setSchemaType(resp.data.schemaType)

      if ('explicit' === resp.data.schemaType) {
        const schema = await dispatch(getBucketSchema(bucketID))
        setMeasurementSchemaList(schema)
      }

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

  const handleChangeSchemaType = (schemaType: typeof SchemaType): void => {
    setBucketDraft({
      ...bucketDraft,
      schemaType: schemaType,
    })
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

  const handleMeasurementSchemaUpdates = (schemas: SchemaUpdateInfo[]) => {
    setMeasurementSchemaUpdates(schemas)
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
        retentionRules: CLOUD ? [] : [{everySeconds: 0}],
      })
    }
  }

  const isValid = () => {
    if (
      areNewSchemasValid(newMeasurementSchemaRequests) &&
      areSchemaUpdatesValid(measurementSchemaUpdates)
    ) {
      return true
    }
    // not all true :(

    // if not valid, decorate them to show they are not valid!
    setShowSchemaValidation(true)
    return false
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()

    if (isValid()) {
      dispatch(updateBucket(bucketDraft))

      if (newMeasurementSchemaRequests?.length) {
        newMeasurementSchemaRequests.forEach(item => {
          const createRequest = {
            columns: item.columns,
            name: item.name,
          }

          event('bucket.schema.explicit.editing.uploadSchema')
          dispatch(
            addSchemaToBucket(
              bucketDraft.id,
              bucketDraft.orgID,
              bucketDraft.name,
              createRequest
            )
          )
        })
      }

      if (measurementSchemaUpdates?.length) {
        measurementSchemaUpdates
          .filter(msu => msu.hasUpdate)
          .forEach(item => {
            const {currentSchema, columns} = item
            const {bucketID, id, name, orgID} = currentSchema
            const updateRequest = {columns}
            event('bucket.schema.explicit.editing.updateSchema')
            dispatch(
              updateMeasurementSchema(bucketID, id, name, updateRequest, orgID)
            )
          })
      }

      handleClose()
    }
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
      <Overlay.Container maxWidth={getBucketOverlayWidth()}>
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
              isEditing={true}
              onChangeInput={handleChangeInput}
              retentionSeconds={retentionSeconds}
              onChangeRuleType={handleChangeRuleType}
              onChangeRetentionRule={handleChangeRetentionRule}
              onClickRename={handleClickRename}
              onChangeSchemaType={handleChangeSchemaType}
              schemaType={schemaType as typeof SchemaType}
              measurementSchemaList={measurementSchemaList}
              onAddNewMeasurementSchemas={handleNewMeasurementSchemas}
              onUpdateMeasurementSchemas={handleMeasurementSchemaUpdates}
              showSchemaValidation={showSchemaValidation}
            />
          </Overlay.Body>
        </SpinnerContainer>
      </Overlay.Container>
    </Overlay>
  )
}

export default UpdateBucketOverlay
