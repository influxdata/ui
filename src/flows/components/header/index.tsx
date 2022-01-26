// Libraries
import React, {FC, useContext, useState, useEffect} from 'react'
import {useHistory} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Contexts
import {FlowContext} from 'src/flows/context/flow.current'
import {FlowListContext} from 'src/flows/context/flow.list'
import {AppSettingProvider} from 'src/shared/contexts/app'
import {deletePinnedItemByParam} from 'src/shared/contexts/pinneditems'

// Components
import {
  Page,
  SquareButton,
  IconFont,
  ComponentColor,
  ComponentStatus,
  ConfirmationButton,
  ButtonShape,
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
import {Authorization} from 'src/client'

// Constants
import {
  DEFAULT_PROJECT_NAME,
  PROJECT_NAME,
  PROJECT_NAME_PLURAL,
} from 'src/flows'
import {createReadOnlyAllAuthorization} from 'src/authorizations/apis'

interface Share {
  id: string
  accessID: string
}

const FlowHeader: FC = () => {
  const {remove, clone} = useContext(FlowListContext)
  const {flow, updateOther} = useContext(FlowContext)
  const history = useHistory()
  const {id: orgID} = useSelector(getOrg)
  const [sharing, setSharing] = useState(false)
  const [share, setShare] = useState<Share>()
  const [linkLoading, setLinkLoading] = useState(RemoteDataState.NotStarted)

  useEffect(() => {
    if (isFlagEnabled('shareNotebook')) {
      getNotebooksShare({query: {orgID: '', notebookID: flow.id}})
        .then(res => {
          if (!!res?.data?.[0]) {
            // TODO: handle there being multiple links?
            setShare({id: res.data[0].id, accessID: res.data[0].accessID})
          }
        })
        .catch(err => console.error('failed to get notebook share', err))
    }
  }, [flow.id])

  const handleRename = (name: string) => {
    updateOther({name})
    try {
      updatePinnedItemByParam(flow.id, {name})
    } catch (err) {
      console.error(err)
    }
  }

  const showShare = () => {
    setSharing(true)
    event('Show Share Menu', {share: !!share ? 'sharing' : 'not sharing'})
  }

  const hideShare = () => {
    setSharing(false)
  }

  const deleteShare = () => {
    deleteNotebooksShare({id: share.id})
      .then(() => {
        hideShare()
        setShare(null)
        event('Delete Share Link')
      })
      .catch(err => console.error('failed to delete share', err))
  }

  const createAndGetReadOnlyToken = async (): Promise<string> => {
    const authName = `${flow.name} ${flow.createdAt}`
    const response = await createReadOnlyAllAuthorization(orgID, authName)

    return response.token
  }

  const generateLink = async () => {
    setLinkLoading(RemoteDataState.Loading)
    let token: string

    try {
      token = await createAndGetReadOnlyToken()
    } catch (e) {
      console.error('failed to create read-only token')
      setLinkLoading(RemoteDataState.Error)

      return
    }

    postNotebooksShare({
      data: {
        notebookID: flow.id,
        orgID,
        token: token,
        region: window.location.hostname,
      },
    })
      .then(res => {
        setLinkLoading(RemoteDataState.Done)
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

  const handleClone = async () => {
    event('clone_notebook')
    const clonedId = await clone(flow.id)
    history.push(
      `/orgs/${orgID}/${PROJECT_NAME_PLURAL.toLowerCase()}/${clonedId}`
    )
  }

  const handleDelete = () => {
    event('delete_notebook')
    deletePinnedItemByParam(flow.id)
    remove(flow.id)
    history.push(`/orgs/${orgID}/${PROJECT_NAME_PLURAL.toLowerCase()}`)
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
            <SaveState />
          </Page.ControlBarLeft>
          <Page.ControlBarRight>
            <PresentationMode />
            <TimeZoneDropdown />
            <TimeRangeDropdown />
            {isFlagEnabled('flowAutoRefresh') && <AutoRefreshButton />}
            {flow?.id && (
              <>
                <ConfirmationButton
                  icon={IconFont.Trash_New}
                  shape={ButtonShape.Square}
                  confirmationLabel={`Yes, delete this ${PROJECT_NAME}`}
                  onConfirm={handleDelete}
                  confirmationButtonText="Confirm"
                  testID="context-delete-menu"
                />
                <SquareButton
                  icon={IconFont.Duplicate_New}
                  onClick={handleClone}
                  titleText="Clone"
                />
                <FeatureFlag name="shareNotebook">
                  <SquareButton
                    icon={IconFont.Share}
                    onClick={showShare}
                    color={
                      !!share
                        ? ComponentColor.Primary
                        : ComponentColor.Secondary
                    }
                    titleText="Share Notebook"
                  />
                </FeatureFlag>
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
      {!!sharing && !share && (
        <Page.ControlBar fullWidth>
          <Page.ControlBarRight>
            <ErrorTooltip
              className="warning-icon"
              tooltipContents="By sharing this link, your org may incur charges when a user visits the page and the query is run."
              tooltipStyle={{width: '250px'}}
            />
            <SquareButton
              icon={IconFont.Checkmark_New}
              onClick={generateLink}
              color={ComponentColor.Success}
              status={
                linkLoading === RemoteDataState.Loading
                  ? ComponentStatus.Loading
                  : ComponentStatus.Default
              }
              titleText="Set Token"
            />
            <SquareButton
              icon={IconFont.Remove_New}
              onClick={hideShare}
              color={ComponentColor.Danger}
              titleText="Cancel"
            />
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
            <SquareButton
              icon={IconFont.Trash_New}
              onClick={deleteShare}
              color={ComponentColor.Danger}
              titleText="Delete"
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
    <FlowHeader />
  </AppSettingProvider>
)
