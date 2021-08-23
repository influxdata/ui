import React, {FC, useContext, useCallback} from 'react'
import {capitalize} from 'lodash'
import {
  PinnedItemsContext,
  PinnedItemTypes,
  PinnedItem,
} from 'src/shared/contexts/pinneditems'

import {Context} from 'src/clockface'
import {ComponentColor, IconFont, Panel} from '@influxdata/clockface'

import './PinnedItems.scss'

import {ResourceCard, ResourceList} from '@influxdata/clockface'

import {useHistory} from 'react-router-dom'
import {CLOUD} from 'src/shared/constants'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

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

  const {pinnedItems, deletePinnedItemsHelper, pinnedItemsError} = useContext(
    PinnedItemsContext
  )

  const handleDeletePinnedItem = async (itemId: string) => {
    await deletePinnedItemsHelper(itemId)
  }
  const emptyState = (
    <h3 data-testid="pinneditems--emptystate">
      Pin a task, dashboard, or notebook here
    </h3>
  )
  return CLOUD && isFlagEnabled('pinnedItems') ? (
    <Panel style={{margin: '4px 0px'}}>
      <Panel.Header>
        <h2 className="pinned-items--header">Pinned Items</h2>
      </Panel.Header>
      <Panel.Body>
        <ResourceList>
          <ResourceList.Body
            emptyState={emptyState}
            className="pinned-items--container"
          >
            {!pinnedItemsError.length ? (
              pinnedItems?.map(item => (
                <ResourceCard
                  key={item.id}
                  testID="pinneditems--card"
                  className="pinned-items--card"
                  contextMenu={
                    <Context>
                      <Context.Menu
                        icon={IconFont.Trash}
                        color={ComponentColor.Danger}
                        testID="pinneditems-delete--menu"
                      >
                        <Context.Item
                          label="Unpin"
                          action={() => handleDeletePinnedItem(item.id)}
                          testID="pinneditems-delete--confirm"
                        />
                      </Context.Menu>
                    </Context>
                  }
                >
                  <ResourceCard.Name
                    testID="pinneditems--type"
                    name={capitalize(item.type)}
                  />
                  <ResourceCard.Name
                    name={item.metadata.name ?? ''}
                    onClick={() => followMetadataToRoute(item)}
                    testID="pinneditems--link"
                  />
                  <ResourceCard.Description
                    description={item.metadata.description ?? ''}
                  />
                </ResourceCard>
              ))
            ) : (
              <h3>{pinnedItemsError}</h3>
            )}
          </ResourceList.Body>
        </ResourceList>
      </Panel.Body>
    </Panel>
  ) : null
}

export default PinnedItems
