import React, {FC, useContext, useCallback} from 'react'
import {capitalize} from 'lodash'
import {
  PinnedItemsContext,
  PinnedItemTypes,
  PinnedItem,
} from 'src/shared/contexts/pinneditems'

import {Context} from 'src/clockface'
import {ComponentColor, IconFont} from '@influxdata/clockface'

import './PinnedItems.scss'

import {ResourceCard, ResourceList} from '@influxdata/clockface'

import {useHistory} from 'react-router-dom'

const PinnedItems: FC = () => {
  const history = useHistory()
  const followMetadataToRoute = useCallback(
    (data: PinnedItem) => {
      let routeToFollow = ''
      switch (data.type) {
        case PinnedItemTypes.Dashboard:
          routeToFollow = `/orgs/${data.orgID}/dashboards/${data.metadata.dashboardID}`
          break
        case PinnedItemTypes.Task:
          routeToFollow = `/orgs/${data.orgID}/tasks/${data.metadata.taskID}/edit`
          break
        case PinnedItemTypes.Notebook:
          routeToFollow = `/orgs/${data.orgID}/notebooks/${data.metadata.flowID}`
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

  const {pinnedItems, deletePinnedItemsHelper} = useContext(PinnedItemsContext)

  const handleDeletePinnedItem = async (itemId: string) => {
    await deletePinnedItemsHelper(itemId)
  }
  const emptyState = <h3>Pin Resources Here.</h3>
  return (
    <>
      <h2 className="pinned-items--header">Pinned Items</h2>
      <ResourceList>
        <ResourceList.Body
          emptyState={emptyState}
          className="pinned-items--container"
        >
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
                      label="Unpin"
                      action={async () => await handleDeletePinnedItem(item.id)}
                      testID="delete-token"
                    />
                  </Context.Menu>
                </Context>
              }
            >
              <ResourceCard.Name name={capitalize(item.type)} />
              <ResourceCard.Name
                name={item.metadata.name ?? ''}
                onClick={() => followMetadataToRoute(item)}
              />
              <ResourceCard.Description
                description={item.metadata.description ?? ''}
              />
            </ResourceCard>
          ))}
        </ResourceList.Body>
      </ResourceList>
    </>
  )
}

export default PinnedItems
