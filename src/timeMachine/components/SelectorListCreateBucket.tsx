// Libraries
import React, {
  FC,
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useReducer,
} from 'react'
import {connect, ConnectedProps, useDispatch} from 'react-redux'

// Components
import {
  Popover,
  PopoverInteraction,
  PopoverPosition,
  Appearance,
  ComponentColor,
  ComponentSize,
  List,
  ListItemRef,
} from '@influxdata/clockface'
import BucketOverlayForm from 'src/buckets/components/createBucketForm/BucketOverlayForm'
import {getBucketOverlayWidth} from 'src/buckets/constants'

// Utils
import {
  extractBucketMaxRetentionSeconds,
  getBucketLimitStatus,
} from 'src/cloud/utils/limits'

// Actions
import {checkBucketLimits} from 'src/cloud/actions/limits'
import {createBucket} from 'src/buckets/actions/thunks'

// Types
import {AppState} from 'src/types'
import {
  createBucketReducer,
  RuleType,
  initialBucketState,
  DEFAULT_RULES,
} from 'src/buckets/reducers/createBucket'

// Selectors
import {getOrg} from 'src/organizations/selectors'
import {SchemaType} from 'src/client/generatedRoutes'

interface OwnProps {}
type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps

/**
 * This is the item in the bucket selector list in the query builder
 * that creates a new bucket (it is at the end of the list of buckets
 * that can be selected
 * */
const SelectorListCreateBucket: FC<Props> = ({
  org,
  createBucket,
  isRetentionLimitEnforced,
  limitStatus,
}) => {
  const reduxDispatch = useDispatch()
  const triggerRef = useRef<ListItemRef>(null)
  const [state, dispatch] = useReducer(
    createBucketReducer,
    initialBucketState(isRetentionLimitEnforced, org.id)
  )

  useEffect(() => {
    // Check bucket limits when component mounts
    reduxDispatch(checkBucketLimits())
  }, [reduxDispatch])

  const limitExceeded = limitStatus === 'exceeded'

  let titleText = 'Click to create a bucket'
  let buttonDisabled = false

  if (limitExceeded) {
    titleText = 'This account has the maximum number of buckets allowed'
    buttonDisabled = true
  }

  const retentionRule = state.retentionRules?.find(r => r.type === 'expire')
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

  const handleSubmit = (onHide: () => void) => (
    e: FormEvent<HTMLFormElement>
  ): void => {
    e.preventDefault()

    createBucket(state)
    onHide()
  }
  const handleChangeSchemaType = (schemaType: SchemaType): void => {
    dispatch({type: 'updateSchema', payload: schemaType})
  }

  const handleChangeInput = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value

    if (e.target.name === 'name') {
      dispatch({type: 'updateName', payload: value})
    }
  }

  return (
    <>
      <List.Item
        className="selector-list--item"
        testID="selector-list add-bucket"
        disabled={buttonDisabled}
        title={titleText}
        ref={triggerRef}
        onClick={() => {}}
        wrapText={false}
        size={ComponentSize.ExtraSmall}
      >
        + Create Bucket
      </List.Item>
      <Popover
        triggerRef={triggerRef}
        appearance={Appearance.Outline}
        color={ComponentColor.Primary}
        position={PopoverPosition.Above}
        showEvent={PopoverInteraction.Click}
        hideEvent={PopoverInteraction.Click}
        style={{maxWidth: getBucketOverlayWidth()}}
        testID="create-bucket-popover"
        contents={onHide => (
          <BucketOverlayForm
            name={state.name}
            buttonText="Create"
            isEditing={false}
            ruleType={state.ruleType}
            onClose={onHide}
            onSubmit={handleSubmit(onHide)}
            onChangeInput={handleChangeInput}
            retentionSeconds={retentionSeconds}
            onChangeRuleType={handleChangeRuleType}
            onChangeRetentionRule={handleChangeRetentionRule}
            onChangeSchemaType={handleChangeSchemaType}
          />
        )}
      />
    </>
  )
}

const mstp = (state: AppState) => {
  const org = getOrg(state)
  const isRetentionLimitEnforced = !!extractBucketMaxRetentionSeconds(state)
  const limitStatus = getBucketLimitStatus(state)

  return {
    org,
    isRetentionLimitEnforced,
    limitStatus,
  }
}

const mdtp = {
  createBucket,
}

const connector = connect(mstp, mdtp)

export default connector(SelectorListCreateBucket)
