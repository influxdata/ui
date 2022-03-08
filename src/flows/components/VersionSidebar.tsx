import React, {FC, createRef, useContext, RefObject} from 'react'
import {useHistory, useParams} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Components
import {
  AlignItems,
  Button,
  ComponentColor,
  ComponentSize,
  DapperScrollbars,
  FlexBox,
  FlexDirection,
  Icon,
  IconFont,
  InfluxColors,
  List,
  Popover,
  PopoverInteraction,
} from '@influxdata/clockface'

// Context
import {FlowContext} from 'src/flows/context/flow.current'
import {VersionPublishContext} from 'src/flows/context/version.publish'

// Utils & Actions
import {event} from 'src/cloud/utils/reporting'
import {getOrg} from 'src/organizations/selectors'
import {
  patchNotebook,
  postNotebook,
  VersionHistory,
} from 'src/client/notebooksRoutes'
import {getAllAPI} from 'src/flows/context/api'
import {incrementCloneName} from 'src/utils/naming'
import {serialize} from 'src/flows/context/flow.list'

// Constants
import './Sidebar.scss'
import {PROJECT_NAME, PROJECT_NAME_PLURAL} from 'src/flows'
import {Flow} from 'src/types'

interface Props {
  version: VersionHistory | Flow
}

const VersionSidebarListItem: FC<Props> = ({version}) => {
  const triggerRef: RefObject<HTMLButtonElement> = createRef()
  const history = useHistory()
  const {notebookID, id} = useParams<{notebookID: string; id: string}>()
  const {flow} = useContext(FlowContext)
  const {id: orgID} = useSelector(getOrg)

  const isDraft = notebookID === version.id

  const handleClick = () => {
    let route = `/orgs/${orgID}/${PROJECT_NAME_PLURAL.toLowerCase()}/${flow.id}`

    if (!isDraft) {
      route = `${route}/versions/${version.id}`
    }

    history.push(route)
  }

  const handleRevert = async () => {
    event('revert_notebook_version')
    try {
      const _flow = {id: flow.id, ...serialize(flow)}
      const response = await patchNotebook(_flow)

      if (response.status !== 200) {
        throw new Error(response.data.message)
      }

      history.push(
        `/orgs/${orgID}/${PROJECT_NAME_PLURAL.toLowerCase()}/${flow.id}`
      )
    } catch (error) {
      console.error({error})
    }
  }

  const handleClone = async () => {
    event('clone_notebook_version')
    try {
      const {flows} = await getAllAPI(orgID)

      const allFlowNames = Object.values(flows).map(value => value.name)
      const clonedName = incrementCloneName(allFlowNames, flow.name)

      const _flow = serialize({...flow, name: clonedName})
      delete _flow.data.id

      const response = await postNotebook(_flow)

      if (response.status !== 200) {
        throw new Error(response.data.message)
      }

      const clonedId = response.data.id
      history.push(
        `/orgs/${orgID}/${PROJECT_NAME_PLURAL.toLowerCase()}/${clonedId}`
      )
    } catch (error) {
      console.error({error})
    }
  }

  const menuItems = [
    {
      title: 'Restore this version',
      icon: IconFont.Refresh_New,
      onClick: handleRevert,
    },
    {
      title: `Clone version to new ${PROJECT_NAME}`,
      icon: IconFont.Duplicate_New,
      onClick: handleClone,
    },
  ]

  const publishedAt = isDraft
    ? (version as Flow)?.updatedAt
    : (version as VersionHistory)?.publishedAt

  return (
    <List.Item
      selected={!isDraft && id === version.id}
      onClick={handleClick}
      backgroundColor={InfluxColors.Grey15}
      className="version-sidebar--listitem"
    >
      <FlexBox
        alignItems={AlignItems.FlexStart}
        direction={FlexDirection.Column}
      >
        <h6 className="published-date--text">
          {new Date(publishedAt).toLocaleString()}
        </h6>
        {isDraft && <h6 className="current-version--text">Current version</h6>}
        {!isDraft && (
          <h6 className="published-by--text">
            {(version as VersionHistory)?.publishedBy}
          </h6>
        )}
      </FlexBox>
      {isDraft === false && (
        <>
          <Icon
            glyph={IconFont.More}
            ref={triggerRef}
            style={{color: InfluxColors.White}}
          />
          <Popover
            triggerRef={triggerRef}
            enableDefaultStyles={false}
            style={{minWidth: 209}}
            showEvent={PopoverInteraction.Click}
            hideEvent={PopoverInteraction.Click}
            contents={onHide => (
              <List>
                {menuItems.map(item => (
                  <List.Item
                    key={item.title}
                    onClick={() => {
                      item?.onClick()
                      onHide()
                    }}
                  >
                    <Icon glyph={item?.icon} />
                    <span style={{paddingLeft: '10px'}}>{item?.title}</span>
                  </List.Item>
                ))}
              </List>
            )}
          />
        </>
      )}
    </List.Item>
  )
}

export const VersionSidebar: FC = () => {
  const {versions} = useContext(VersionPublishContext)

  const {flow} = useContext(FlowContext)
  const history = useHistory()
  const {id: orgID} = useSelector(getOrg)

  const handleClose = () => {
    event('close version history')
    history.push(
      `/orgs/${orgID}/${PROJECT_NAME_PLURAL.toLowerCase()}/${flow.id}`
    )
  }

  return (
    <div className="version-sidebar">
      <div className="version-sidebar--buttons">
        <h6 className="version-history--title">Version History</h6>
        <Button
          icon={IconFont.Remove_New}
          color={ComponentColor.Colorless}
          onClick={handleClose}
          size={ComponentSize.Large}
        />
      </div>
      <div className="version-sidebar--submenu">
        <DapperScrollbars
          noScrollX={true}
          thumbStopColor="gray"
          thumbStartColor="gray"
        >
          <div className="version-sidebar--submenu-wrapper">
            <List>
              {versions.map(version => (
                <React.Fragment key={version.id}>
                  <VersionSidebarListItem version={version} />
                  <List.Divider style={{margin: 0}} />
                </React.Fragment>
              ))}
            </List>
          </div>
        </DapperScrollbars>
      </div>
    </div>
  )
}
