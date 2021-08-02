// Libraries
import React, {PureComponent} from 'react'
import {connect} from 'react-redux'

// Clockface
import {Accordion} from '@influxdata/clockface'

// Types
import {AppState, Telegraf, ResourceType} from 'src/types'

// Selectors
import {getAll} from 'src/resources/selectors'

interface StateProps {
  telegrafs: Telegraf[]
}

type Props = StateProps

class TelegrafAccordion extends PureComponent<Props, {}> {
  public render() {
    const {telegrafs} = this.props

    return telegrafs.map(telegraf => (
      <Accordion.AccordionBodyItem key={telegraf.id}>
        {telegraf.name}
      </Accordion.AccordionBodyItem>
    ))
  }
}

const mstp = (state: AppState) => ({
  telegrafs: getAll<Telegraf>(state, ResourceType.Telegrafs),
})

export default connect<StateProps>(mstp, null)(TelegrafAccordion)
