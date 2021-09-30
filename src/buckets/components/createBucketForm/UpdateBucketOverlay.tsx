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
import BucketOverlayForm from 'src/buckets/components/createBucketForm/BucketOverlayForm'

// Actions
import {
  getBucketSchema,
  updateBucket,
  addSchemasToBucket,
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

let SchemaType = null,
  MeasurementSchemaCreateRequest = null

if (CLOUD) {
  SchemaType = require('src/client/generatedRoutes').MeasurementSchema
  MeasurementSchemaCreateRequest = require('src/client/generatedRoutes')
    .MeasurementSchemaCreateRequest
}

interface DispatchProps {
  onUpdateBucket: typeof updateBucket
  getSchema: typeof getBucketSchema
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps & RouteComponentProps<{bucketID: string; orgID: string}>

const UpdateBucketOverlay: FunctionComponent<Props> = ({
  onUpdateBucket,
  getSchema,
  match,
  history,
}) => {
  const {orgID, bucketID} = match.params
  const dispatch = useDispatch()
  const [bucketDraft, setBucketDraft] = useState<OwnBucket>(null)

  const [loadingStatus, setLoadingStatus] = useState(RemoteDataState.Loading)

  const [retentionSelection, setRetentionSelection] = useState(DEFAULT_SECONDS)

  const [schemaType, setSchemaType] = useState('implicit')
  const [measurementSchemaList, setMeasurementSchemaList] = useState(null)
  const [
    newMeasurementSchemaRequests,
    setNewMeasurementSchemaRequests,
  ] = useState(null)
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
        const schema = await getSchema(bucketID)
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
      console.log('all true!')
      return true
    }

    console.log('not all true :(')
    // not all true :(

    // if not valid, decorate them to show they are not valid!
    // TODO!  do the decoration!
    setShowSchemaValidation(true)
    return false
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()

    if (isValid()) {
      onUpdateBucket(bucketDraft)

      // TODO:  put an event here!
      // like: 'bucket.editing.add.measurementSchema'
      if (newMeasurementSchemaRequests?.length) {
        const mSchemas = newMeasurementSchemaRequests.map(item => ({
          columns: item.columns,
          name: item.name,
        }))
        console.log('bucket info??', bucketDraft)

        console.log(
          'would handle the new schema requests here (would create the ' +
            'measurement schemas one by one here! TODO: ',
          mSchemas
        )

        mSchemas.forEach(createRequest => {
          addSchemasToBucket(bucketDraft.id, bucketDraft.orgID, createRequest)
        })
      } else {
        console.log('no measurement schemas to set')
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
              isEditing={true}
              onChangeInput={handleChangeInput}
              retentionSeconds={retentionSeconds}
              onChangeRuleType={handleChangeRuleType}
              onChangeRetentionRule={handleChangeRetentionRule}
              onClickRename={handleClickRename}
              onChangeSchemaType={handleChangeSchemaType}
              schemaType={schemaType as typeof SchemaType}
              measurementSchemaList={measurementSchemaList}
              onUpdateNewMeasurementSchemas={handleNewMeasurementSchemas}
              showSchemaValidation={showSchemaValidation}
            />
          </Overlay.Body>
        </SpinnerContainer>
      </Overlay.Container>
    </Overlay>
  )
}

const mdtp = {
  onUpdateBucket: updateBucket,
  getSchema: getBucketSchema,
}

const connector = connect(null, mdtp)

export default connect<{}, DispatchProps>(
  null,
  mdtp
)(withRouter(UpdateBucketOverlay))
