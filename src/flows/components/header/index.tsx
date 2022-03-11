// Libraries
import React, {FC, useCallback, useContext, useState, useEffect} from 'react'
import {useSelector} from 'react-redux'

// Contexts
import {FlowContext} from 'src/flows/context/flow.current'
import {
  VersionPublishContext,
  VersionPublishProvider,
} from 'src/flows/context/version.publish'
import {AppSettingProvider} from 'src/shared/contexts/app'

// Components
import {
  Page,
  SquareButton,
  IconFont,
  ComponentColor,
  ComponentStatus,
  ErrorTooltip,
} from '@influxdata/clockface'

import AutoRefreshButton from 'src/flows/components/header/AutoRefreshButton'
import TimeZoneDropdown from 'src/shared/components/TimeZoneDropdown'
import TimeRangeDropdown from 'src/flows/components/header/TimeRangeDropdown'
import Submit from 'src/flows/components/header/Submit'
import SaveState from 'src/flows/components/header/SaveState'
import PresentationMode from 'src/flows/components/header/PresentationMode'
import RenamablePageTitle from 'src/pageLayout/components/RenamablePageTitle'
import {FeatureFlag} from 'src/shared/utils/featureFlag'
import MenuButton from 'src/flows/components/header/MenuButton'

// Utility
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {
  getNotebooksShare,
  deleteNotebooksShare,
  postNotebooksShare,
} from 'src/client/notebooksRoutes'
import {event} from 'src/cloud/utils/reporting'
import {serialize} from 'src/flows/context/flow.list'
import {updatePinnedItemByParam} from 'src/shared/contexts/pinneditems'
import {getOrg} from 'src/organizations/selectors'

// Types
import {RemoteDataState} from 'src/types'

// Constants
import {DEFAULT_PROJECT_NAME, PROJECT_NAME} from 'src/flows'

interface Share {
  id: string
  accessID: string
}

const FlowHeader: FC = () => {
  const {flow, updateOther} = useContext(FlowContext)
  const {handlePublish} = useContext(VersionPublishContext)
  const {id: orgID} = useSelector(getOrg)
  const [sharing, setSharing] = useState(false)
  const [share, setShare] = useState<Share>()
  const [linkLoading, setLinkLoading] = useState(RemoteDataState.NotStarted)
  const [linkDeleting, setLinkDeleting] = useState(RemoteDataState.NotStarted)

  useEffect(() => {
    getNotebooksShare({query: {orgID: '', notebookID: flow.id}})
      .then(res => {
        if (!!res?.data?.[0]) {
          // TODO: handle there being multiple links?
          setShare({id: res.data[0].id, accessID: res.data[0].accessID})
        }
      })
      .catch(err => console.error('failed to get notebook share', err))
  }, [flow.id])

  const handleSave = useCallback(
    event => {
      if (isFlagEnabled('flowPublishLifecycle')) {
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
          event.preventDefault()
          handlePublish()
        }
      }
    },
    [handlePublish]
  )

  useEffect(() => {
    if (isFlagEnabled('flowPublishLifecycle')) {
      window.addEventListener('keydown', handleSave)
    }
    return () => {
      if (isFlagEnabled('flowPublishLifecycle')) {
        window.removeEventListener('keydown', handleSave)
      }
    }
  }, [handleSave])

  const handleRename = (name: string) => {
    updateOther({name})
    try {
      updatePinnedItemByParam(flow.id, {name})
    } catch (err) {
      console.error(err)
    }
  }

  const hideShare = () => {
    setSharing(false)
  }

  const deleteShare = () => {
    setLinkDeleting(RemoteDataState.Loading)
    deleteNotebooksShare({id: share.id})
      .then(() => {
        setLinkDeleting(RemoteDataState.Done)
        hideShare()
        setShare(null)
        event('Delete Share Link')
      })
      .catch(err => {
        setLinkDeleting(RemoteDataState.Error)
        console.error('failed to delete share', err)
      })
  }

  const generateLink = () => {
    event('Show Share Menu', {share: !!share ? 'sharing' : 'not sharing'})

    if (!!share) {
      setSharing(true)
      return
    }

    setLinkLoading(RemoteDataState.Loading)
    postNotebooksShare({
      data: {
        notebookID: flow.id,
        orgID,
        region: window.location.hostname,
      },
    })
      .then(res => {
        setLinkLoading(RemoteDataState.Done)
        setSharing(true)
        setShare({
          id: (res.data as Share).id,
          accessID: (res.data as Share).accessID,
        })
      })
      .catch(err => {
        console.error('failed to create share', err)
        setLinkLoading(RemoteDataState.Error)
      })
    event('Notebook Share Link Created')
  }

  const printJSON = () => {
    /* eslint-disable no-console */
    console.log(JSON.stringify(serialize(flow), null, 2))
    /* eslint-enable no-console */
  }

  if (!flow) {
    return null
  }

  return (
    <>
      <Page.Header fullWidth>
        <RenamablePageTitle
          onRename={handleRename}
          name={flow.name}
          placeholder={DEFAULT_PROJECT_NAME}
          maxLength={50}
        />
      </Page.Header>
      {!sharing && (
        <Page.ControlBar fullWidth>
          <Page.ControlBarLeft>
            <Submit />
            <AutoRefreshButton />
            <SaveState />
          </Page.ControlBarLeft>
          <Page.ControlBarRight>
            <PresentationMode />
            <TimeZoneDropdown />
            <TimeRangeDropdown />
            {flow?.id && (
              <>
                <SquareButton
                  icon={IconFont.Share}
                  onClick={generateLink}
                  color={
                    !!share ? ComponentColor.Primary : ComponentColor.Secondary
                  }
                  status={
                    linkLoading === RemoteDataState.Loading
                      ? ComponentStatus.Loading
                      : ComponentStatus.Default
                  }
                  titleText={`Share ${PROJECT_NAME}`}
                />
                <MenuButton handleResetShare={() => setShare(null)} />
              </>
            )}
            <FeatureFlag name="flow-snapshot">
              <SquareButton
                icon={IconFont.Export_New}
                onClick={printJSON}
                color={ComponentColor.Default}
                titleText="Export Notebook"
              />
            </FeatureFlag>
          </Page.ControlBarRight>
        </Page.ControlBar>
      )}
      {!!sharing && !!share && (
        <Page.ControlBar fullWidth>
          <Page.ControlBarRight>
            <p className="share-token--link">
              Share with{' '}
              <a
                href={`${window.location.origin}/share/${share.accessID}`}
                target="_blank"
              >
                {`${window.location.origin}/share/${share.accessID}`}
              </a>
            </p>
            <ErrorTooltip
              className="warning-icon"
              tooltipContents="By sharing this link, your org may incur charges when a user visits the page and the query is run."
              tooltipStyle={{width: '250px'}}
            />
            <SquareButton
              icon={IconFont.Trash_New}
              onClick={deleteShare}
              color={ComponentColor.Danger}
              titleText="Delete"
              status={
                linkDeleting === RemoteDataState.Loading
                  ? ComponentStatus.Loading
                  : ComponentStatus.Default
              }
            />
            <SquareButton
              icon={IconFont.Remove_New}
              onClick={hideShare}
              color={ComponentColor.Default}
              titleText="Cancel"
            />
          </Page.ControlBarRight>
        </Page.ControlBar>
      )}
    </>
  )
}

export default () => (
  <AppSettingProvider>
    <VersionPublishProvider>
      <FlowHeader />
    </VersionPublishProvider>
  </AppSettingProvider>
)
