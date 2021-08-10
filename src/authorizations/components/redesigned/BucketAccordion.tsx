// Libraries
import React, {PureComponent} from 'react'
import {connect} from 'react-redux'

// Clockface
import {
  Accordion,
  FlexBox,
  ComponentSize,
  JustifyContent,
  FlexDirection,
  AlignItems,
  InputLabel,
  Toggle,
  InputToggleType,
} from '@influxdata/clockface'

// Types
import {AppState, ResourceType} from 'src/types'

// Selectors
import {getAll} from 'src/resources/selectors'
import {Bucket} from 'src/client'

interface StateProps {
  buckets: Bucket[]
}

type Props = StateProps

class BucketAccordion extends PureComponent<Props, {}> {
  public render() {
    const {buckets} = this.props
    const accordionBody = title => (
      <FlexBox
        margin={ComponentSize.Small}
        justifyContent={JustifyContent.SpaceBetween}
        direction={FlexDirection.Row}
        stretchToFitWidth={true}
        alignItems={AlignItems.Center}
        /* onClick={(e: MouseEvent<HTMLElement>) => {
          e.stopPropagation()
        }} */
        style={{textAlign: 'start'}}
      >
        <FlexBox.Child basis={40} grow={8}>
          <InputLabel size={ComponentSize.Medium}>{title}</InputLabel>
        </FlexBox.Child>
        <FlexBox.Child grow={1}>
          <Toggle
            id="0"
            type={InputToggleType.Checkbox}
            onChange={() => {}}
            size={ComponentSize.ExtraSmall}
            checked={true}
            style={{marginRight: '10px'}}
            tabIndex={0}
            disabled={false}
          ></Toggle>
        </FlexBox.Child>
        <FlexBox.Child grow={1}>
          <Toggle
            id="1"
            type={InputToggleType.Checkbox}
            onChange={() => {}}
            size={ComponentSize.ExtraSmall}
            checked={true}
            style={{marginRight: '10px'}}
            tabIndex={0}
            disabled={false}
          ></Toggle>
        </FlexBox.Child>
      </FlexBox>
    )

    return (
      <>
        <Accordion.AccordionBodyItem>
          Individual Buckets
        </Accordion.AccordionBodyItem>
        {buckets.map(bucket => (
          <Accordion.AccordionBodyItem key={bucket.id}>
            {accordionBody(bucket.name)}
          </Accordion.AccordionBodyItem>
        ))}
      </>
    )
  }
}

const mstp = (state: AppState) => ({
  buckets: getAll<Bucket>(state, ResourceType.Buckets),
})

export default connect<StateProps>(mstp, null)(BucketAccordion)
