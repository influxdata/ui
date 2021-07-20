import React, {FC, useContext, useCallback} from 'react'
import {
  PinnedItemsContext,
  PinnedItemTypes,
  PinnedItem,
  deletePinnedItem,
} from 'src/shared/contexts/pinneditems'

import {Context} from 'src/clockface'
import {ComponentColor, IconFont} from '@influxdata/clockface'

import './PinnedItems.scss'

import {ResourceCard} from '@influxdata/clockface'

import {useHistory} from 'react-router-dom'

const PinnedItems: FC = () => {
  const history = useHistory()
  const followMetadataToRoute = useCallback(
    (data: PinnedItem) => {
      let routeToFollow
      switch (data.type) {
        case PinnedItemTypes.Dashboard:
          routeToFollow = `/orgs/${data.orgID}/dashboards/${data.metadata[0].dashboardID}`
          break
        default:
          break
      }

      if (routeToFollow.length) {
        history.push(routeToFollow)
      } else {
        return
      }
    },
    [history]
  )

  const {pinnedItems} = useContext(PinnedItemsContext)
  const handleDeletePinnedItem = async (itemId: string) => {
    await deletePinnedItem(itemId)
  }
  return (
    <>
      <h2 className="pinned-items--header">Pinned Items</h2>
      <div className="pinned-items--container">
        {pinnedItems?.map(item => (
          <ResourceCard
            key={item.id}
            contextMenu={
              <Context>
                <Context.Menu
                  icon={IconFont.Trash}
                  color={ComponentColor.Danger}
                >
                  <Context.Item
                    label="Delete"
                    action={async () => await handleDeletePinnedItem(item.id)}
                    testID="delete-token"
                  />
                </Context.Menu>
              </Context>
            }
          >
            <ResourceCard.Name
              name={item.metadata[0].name ?? ''}
              onClick={() => followMetadataToRoute(item)}
            />
            <ResourceCard.Description
              description={item.metadata[0].description ?? ''}
            />
          </ResourceCard>
        ))}
      </div>
    </>
  )
}

export default PinnedItems
