import React, {FC, useContext} from 'react'
import {Context as SidebarContext} from 'src/flows/context/sidebar'
import {CLIENT_DEFINITIONS} from 'src/writeData'
import {FlexBox, SelectableCard, ComponentSize} from '@influxdata/clockface'
import placeholderLogo from 'src/writeData/graphics/placeholderLogo.svg'

const ClientList: FC = () => {
  const {id} = useContext(SidebarContext)

  return (
    <FlexBox style={{flexWrap: 'wrap'}}>
      {Object.values(CLIENT_DEFINITIONS).map(item => {
        const click = (client: string) => {
          console.log('lets open the overlay', client, 'for', id)
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
