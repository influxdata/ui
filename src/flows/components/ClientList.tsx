import React, {FC, useContext} from 'react'
import {SidebarContext} from 'src/flows/context/sidebar'
import {CLIENT_DEFINITIONS} from 'src/writeData'
import {FlexBox, SelectableCard, ComponentSize} from '@influxdata/clockface'
import placeholderLogo from 'src/writeData/graphics/placeholderLogo.svg'
import PanelQueryOverlay from 'src/flows/components/panel/PanelQueryOverlay'
import {PopupContext} from 'src/flows/context/popup'

// Utils
import {event} from 'src/cloud/utils/reporting'

const ClientList: FC = () => {
  const {id} = useContext(SidebarContext)
  const {launch} = useContext(PopupContext)

  return (
    <FlexBox
      style={{flexWrap: 'wrap', gap: '8px'}}
      className="flow-sidebar--client-list"
    >
      {Object.values(CLIENT_DEFINITIONS).map(item => {
        const click = (client: string) => {
          event('Export Client Library Opened', {client})

          launch(<PanelQueryOverlay />, {
            panelID: id,
            contentID: client,
          })
        }

        const thumb = <img src={item.logo ? item.logo : placeholderLogo} />

        return (
          <FlexBox.Child key={item.id}>
            <SelectableCard
              id={item.id}
              formName="load-data-cards"
              label={item.name}
              testID={`load-data-item ${item.id}`}
              selected={false}
              onClick={() => click(item.id)}
              fontSize={ComponentSize.ExtraSmall}
              className="sidebar--item"
            >
              <div className="sidebar--item-thumb">{thumb}</div>
            </SelectableCard>
          </FlexBox.Child>
        )
      })}
    </FlexBox>
  )
}

export default ClientList
