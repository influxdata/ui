// Libraries
import React, {FC, useCallback, useContext, useState, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'

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
import {getNotebooksShare, postNotebooksShare} from 'src/client/notebooksRoutes'
import {event} from 'src/cloud/utils/reporting'
import {serialize} from 'src/flows/context/flow.list'
import {updatePinnedItemByParam} from 'src/shared/contexts/pinneditems'
import {getOrg} from 'src/organizations/selectors'
import {showOverlay} from 'src/overlays/actions/overlays'

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
  const [share, setShare] = useState<Share>()
  const [linkLoading, setLinkLoading] = useState(RemoteDataState.NotStarted)
  const dispatch = useDispatch()

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

  const generateLink = () => {
    event('Show Share Menu', {share: !!share ? 'sharing' : 'not sharing'})

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
        const shareObj = {
          id: (res.data as Share).id,
          accessID: (res.data as Share).accessID,
        }
        setShare(shareObj)
        openShareLinkOverlay(shareObj)
      })
      .catch(err => {
        console.error('failed to create share', err)
        setLinkLoading(RemoteDataState.Error)
      })
    event('Notebook Share Link Created')
  }

  const openShareLinkOverlay = (shareObj: Share) => {
    dispatch(
      showOverlay(
        'share-overlay',
        {
          share: shareObj,
          onSetShare: setShare,
        },
        () => {}
      )
    )
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
                onClick={
                  !!share
                    ? () => openShareLinkOverlay(share)
                    : () => generateLink()
                }
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
