// Libraries
import React, {PureComponent} from 'react'
import {connect} from 'react-redux'

// Clockface
import {Accordion} from '@influxdata/clockface'

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

    return (
      <>
        <Accordion.AccordionBodyItem>
          Individual Buckets
        </Accordion.AccordionBodyItem>
        {buckets.map(bucket => (
          <Accordion.AccordionBodyItem key={bucket.id}>
            {bucket.name}
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
