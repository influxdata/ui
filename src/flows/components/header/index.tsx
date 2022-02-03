// Libraries
import React, {
  FC,
  useCallback,
  useContext,
  useState,
  useEffect,
  createRef,
  RefObject,
} from 'react'
import {useHistory} from 'react-router-dom'
import {useDispatch, useSelector} from 'react-redux'

// Contexts
import {FlowContext} from 'src/flows/context/flow.current'
import {FlowListContext} from 'src/flows/context/flow.list'
import {AppSettingProvider} from 'src/shared/contexts/app'
import {deletePinnedItemByParam} from 'src/shared/contexts/pinneditems'

// Components
import {
  Page,
  SquareButton,
  Icon,
  IconFont,
  ComponentColor,
  ComponentStatus,
  ErrorTooltip,
  Popover,
  PopoverInteraction,
  List,
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
import {downloadImage} from 'src/shared/utils/download'
import {serialize} from 'src/flows/context/flow.list'
import {updatePinnedItemByParam} from 'src/shared/contexts/pinneditems'
import {getOrg} from 'src/organizations/selectors'
import {notify} from 'src/shared/actions/notifications'
import {
  publishNotebookFailed,
  publishNotebookSuccessful,
} from 'src/shared/copy/notifications'
// Types
import {RemoteDataState} from 'src/types'

// Constants
import {
  DEFAULT_PROJECT_NAME,
  PROJECT_NAME,
  PROJECT_NAME_PLURAL,
} from 'src/flows'

const backgroundColor = '#07070E'

type MenuItemType = {
  title: string
  onClick: () => void
  icon: IconFont
  testID?: string
}
interface ButtonProp {
  menuItems: MenuItemType[]
}

const MenuButton: FC<ButtonProp> = ({menuItems}) => {
  const triggerRef: RefObject<HTMLButtonElement> = createRef()
  return (
    <>
      <SquareButton
        ref={triggerRef}
        icon={IconFont.More}
        testID="flow-menu-button"
      />
      <Popover
        triggerRef={triggerRef}
        enableDefaultStyles={false}
        style={{minWidth: '176px'}}
        showEvent={PopoverInteraction.Click}
        hideEvent={PopoverInteraction.Click}
        contents={onHide => (
          <List>
            {menuItems.map(item => (
              <List.Item
                key={item.title}
                onClick={() => {
                  item.onClick()
                  onHide()
                }}
                testID={item.testID || ''}
              >
                <Icon glyph={item.icon} />
                <span style={{paddingLeft: '10px'}}>{item.title}</span>
              </List.Item>
            ))}
          </List>
        )}
      />
    </>
  )
}

interface Share {
  id: string
  accessID: string
}

const FlowHeader: FC = () => {
  const dispatch = useDispatch()
  const {remove, clone} = useContext(FlowListContext)
  const {flow, updateOther} = useContext(FlowContext)
  const history = useHistory()
  const {id: orgID} = useSelector(getOrg)
  const [sharing, setSharing] = useState(false)
  const [publishLoading, setPublishLoading] = useState<RemoteDataState>(
    RemoteDataState.NotStarted
  )
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

  const handlePublish = useCallback(() => {
    if (isFlagEnabled('flowPublishLifecycle')) {
      setPublishLoading(RemoteDataState.Loading)
      fetch(`/api/v2private/notebooks/${flow.id}/version`, {
        method: 'POST',
      })
        .then(resp => resp.json())
        .then(resp => {
          if (!resp.length) {
            return
          }
          setPublishLoading(RemoteDataState.Done)
          dispatch(notify(publishNotebookSuccessful(flow.name)))
        })
        .catch(error => {
          console.error({error})
          dispatch(notify(publishNotebookFailed(flow.name)))
          setPublishLoading(RemoteDataState.Error)
        })
    }
  }, [dispatch, flow.id, flow.name])

  const handleSave = useCallback(
    event => {
      if (isFlagEnabled('flowPublishLifecycle')) {
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
          // Prevent the Save dialog to open
          event.preventDefault()
          handlePublish()
          // Place your code here
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

  const canvasOptions = {
    backgroundColor,
    onclone: cloneDoc => {
      // Add left and right padding on the selected screenshot
      cloneDoc.getElementById(flow.id).style.padding = '0 12px'
      cloneDoc
        .querySelectorAll('[data-download-hide]')
        .forEach(d => (d.style.display = 'block'))
    },
  }

  const handleDownloadAsPNG = () => {
    const canvas = document.getElementById(flow.id)
    import('html2canvas').then((module: any) =>
      module.default(canvas as HTMLDivElement, canvasOptions).then(result => {
        downloadImage(result.toDataURL(), `${flow.name}.png`)
      })
    )
  }

  const handleDownloadAsPDF = () => {
    const canvas = document.getElementById(flow.id)
    import('html2canvas').then((module: any) =>
      module.default(canvas as HTMLDivElement, canvasOptions).then(result => {
        import('jspdf').then((jsPDF: any) => {
          const doc = new jsPDF.default({
            orientation: 'landscape',
            unit: 'pt',
            format: 'a4',
          })

          // Background Color
          doc.setFillColor(backgroundColor)
          doc.rect(0, 0, 850, 600, 'F')

          const paddingX = 24

          // Pipelist screenshot
          const imgData = result.toDataURL('image/png')

          // a4 format landscape size in pt unit is 842 x 595
          const pageWidth = 842
          const pageHeight = 595
          const imgWidth = pageWidth - paddingX * 2
          const imgHeight = (result.height * imgWidth) / result.width
          let heightLeft = imgHeight
          let position = 0

          // First page
          doc.addImage(imgData, 'PNG', paddingX, 0, imgWidth, imgHeight)
          heightLeft -= pageHeight

          // Add multiple pages
          while (heightLeft >= 0) {
            position = heightLeft - imgHeight
            doc.addPage()

            // Add background color
            doc.setFillColor(backgroundColor)
            doc.rect(0, 0, 850, 600, 'F')

            // Add piplist screenshot
            doc.addImage(
              imgData,
              'PNG',
              paddingX,
              position,
              imgWidth,
              imgHeight
            )
            heightLeft -= pageHeight
          }
          doc.save(`${flow.name}.pdf`)
        })
      })
    )
  }

  const generateLink = () => {
    event('Show Share Menu', {share: !!share ? 'sharing' : 'not sharing'})

    if (!!share) {
      setSharing(true)
      return
    }

    if (isFlagEnabled('flowPublishLifecycle')) {
      handlePublish()
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

  const menuItems: MenuItemType[] = [
    {
      title: 'Clone',
      onClick: handleClone,
      icon: IconFont.Duplicate_New,
    },
    {
      title: 'Delete',
      onClick: handleDelete,
      icon: IconFont.Trash_New,
      testID: 'flow-menu-button-delete',
    },
  ]

  if (isFlagEnabled('downloadNotebookPDF')) {
    menuItems.splice(
      1,
      0,
      {
        title: 'Download as PNG',
        onClick: handleDownloadAsPNG,
        icon: IconFont.Download_New,
      },
      {
        title: 'Download as PDF',
        onClick: handleDownloadAsPDF,
        icon: IconFont.Download_New,
      }
    )
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
            {isFlagEnabled('flowAutoRefresh') && <AutoRefreshButton />}
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
                {isFlagEnabled('flowPublishLifecycle') && (
                  <SquareButton
                    icon={IconFont.Checkmark}
                    onClick={handlePublish}
                    color={ComponentColor.Primary}
                    status={
                      publishLoading === RemoteDataState.Loading
                        ? ComponentStatus.Loading
                        : ComponentStatus.Default
                    }
                    titleText={`Publish ${PROJECT_NAME}`}
                  />
                )}
                <MenuButton menuItems={menuItems} />
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
    <FlowHeader />
  </AppSettingProvider>
)
