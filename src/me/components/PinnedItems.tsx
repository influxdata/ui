import React, {FC, memo, useContext, useCallback} from 'react'
import {
  PinnedItemsContext,
  PinnedItemTypes,
  PinnedItem,
} from 'src/shared/contexts/pinneditems'

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
          // @ts-ignore
          routeToFollow = `/orgs/${data.orgID}/dashboards/${data.metadata.dashboardID}`
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
  console.log(pinnedItems)
  return (
    <>
      <h2 className="pinned-items--header">Pinned Items</h2>
      <div className="pinned-items--container">
        {pinnedItems?.map(item => (
          <ResourceCard key={item.id}>
            <ResourceCard.Name
              name={item.metadata.name ?? ''}
              onClick={() => followMetadataToRoute(item)}
            />
            <ResourceCard.Description
              description={item.metadata.description ?? ''}
            />
          </ResourceCard>
        ))}
      </div>
    </>
  )
}

export default memo(PinnedItems)
