import React, {FC, useCallback, useContext} from 'react'
import {
  PinnedItem,
  PinnedItemsContext,
  PinnedItemTypes,
} from 'src/shared/contexts/pinneditems'
import {
  ButtonShape,
  ComponentColor,
  ComponentSize,
  ConfirmationButton,
  FlexBox,
  Heading,
  HeadingElement,
  IconFont,
  Panel,
  ResourceCard,
  Typeface,
} from '@influxdata/clockface'

import './PinnedItems.scss'

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
  const EmptyState = () => (
    <Heading element={HeadingElement.H5} data-testid="pinneditems--emptystate">
      Pin a task, dashboard, or notebook here
    </Heading>
  )
  return CLOUD && isFlagEnabled('pinnedItems') ? (
    <Panel style={{margin: '4px 0px'}}>
      <Panel.Header>
        <h2 className="pinned-items--header">Pinned Items</h2>
      </Panel.Header>
      <Panel.Body
        className="pinneditems--container"
        testID="pinneditems--container"
      >
        {pinnedItems?.length ? (
          pinnedItems.map(item => (
            <ResourceCard
              key={item.id}
              testID="pinneditems--card"
              className="pinned-items--card"
              contextMenuInteraction="showOnHover"
              contextMenu={
                <FlexBox margin={ComponentSize.ExtraSmall}>
                  <ConfirmationButton
                    color={ComponentColor.Colorless}
                    icon={IconFont.Trash_New}
                    shape={ButtonShape.Square}
                    size={ComponentSize.ExtraSmall}
                    confirmationLabel="Unpin this item?"
                    onConfirm={() => handleDeletePinnedItem(item.id)}
                    confirmationButtonText="Yes"
                    testID="context-delete-menu"
                  />
                </FlexBox>
              }
              style={{marginTop: '0px'}}
            >
              <ResourceCard.Meta>
                <Heading
                  type={Typeface.IBMPlexMono}
                  element={HeadingElement.H5}
                >
                  {item.type.toUpperCase()}
                </Heading>
              </ResourceCard.Meta>
              <ResourceCard.Name
                name={item.metadata.name ?? ''}
                onClick={() => followMetadataToRoute(item)}
                testID="pinneditems--link"
              />
            </ResourceCard>
          ))
        ) : (
          <EmptyState />
        )}
        {pinnedItemsError.length ? <h3>{pinnedItemsError}</h3> : null}
      </Panel.Body>
    </Panel>
  ) : null
}

export default PinnedItems
