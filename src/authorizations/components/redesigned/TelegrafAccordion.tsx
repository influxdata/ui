// Libraries
import React, {Component} from 'react'
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
import {AppState, Telegraf, ResourceType} from 'src/types'

// Selectors
import {getAll} from 'src/resources/selectors'

interface OwnProps {
  loadTelegrafs: (telegrafs) => void
  permissions: any
  onToggle: (id, permission) => void
}

interface StateProps {
  telegrafs: Telegraf[]
}

type Props = OwnProps & StateProps

class TelegrafAccordion extends Component<Props, {}> {
  public componentDidMount() {
    this.props.loadTelegrafs(this.props.telegrafs)
  }

  public render() {
    const {permissions} = this.props
    console.log('permissions', permissions)
    const accordionBody = telegraf => (
      <FlexBox
        margin={ComponentSize.Small}
        justifyContent={JustifyContent.SpaceBetween}
        direction={FlexDirection.Row}
        stretchToFitWidth={true}
        alignItems={AlignItems.Center}
        style={{textAlign: 'start'}}
      >
        <FlexBox.Child basis={40} grow={8}>
          <InputLabel size={ComponentSize.Medium}>{telegraf.name}</InputLabel>
        </FlexBox.Child>
        <FlexBox.Child grow={1}>
          <Toggle
            id={telegraf.id}
            value={telegraf.id}
            type={InputToggleType.Checkbox}
            onChange={this.handleReadToggle}
            size={ComponentSize.ExtraSmall}
            checked={telegraf.permissions.read}
            style={{marginRight: '10px'}}
            tabIndex={0}
            disabled={false}
          ></Toggle>
        </FlexBox.Child>
        <FlexBox.Child grow={1}>
          <Toggle
            id={telegraf.id}
            value={telegraf.id}
            type={InputToggleType.Checkbox}
            onChange={this.handleWriteToggle}
            size={ComponentSize.ExtraSmall}
            checked={telegraf.permissions.write}
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
          Individual Telegraf Configurations
        </Accordion.AccordionBodyItem>
        {Object.keys(permissions).map(key => {
          return (
            <Accordion.AccordionBodyItem key={permissions[key].id}>
              {accordionBody(permissions[key])}
            </Accordion.AccordionBodyItem>
          )
        })}
      </>
    )
  }

  handleReadToggle = id => {
    console.log('inread')
    this.props.onToggle(id, 'read') // TODO: Palak turn into enums
  }
  handleWriteToggle = id => {
    this.props.onToggle(id, 'write')
  }
}

const mstp = (state: AppState) => ({
  telegrafs: getAll<Telegraf>(state, ResourceType.Telegrafs),
})

export default connect<StateProps>(mstp, null)(TelegrafAccordion)
