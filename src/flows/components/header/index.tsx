// Libraries
import React, {FC, useContext, useState, useEffect} from 'react'
import {useHistory, Link} from 'react-router-dom'
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
  Dropdown,
  ErrorTooltip,
} from '@influxdata/clockface'
import {PROJECT_NAME, PROJECT_NAME_PLURAL} from 'src/flows'
import TimeZoneDropdown from 'src/shared/components/TimeZoneDropdown'
import TimeRangeDropdown from 'src/flows/components/header/TimeRangeDropdown'
import Submit from 'src/flows/components/header/Submit'
import SaveState from 'src/flows/components/header/SaveState'
import PresentationMode from 'src/flows/components/header/PresentationMode'
import RenamablePageTitle from 'src/pageLayout/components/RenamablePageTitle'
import {DEFAULT_PROJECT_NAME} from 'src/flows'
import {serialize} from 'src/flows/context/flow.list'
import {FeatureFlag} from 'src/shared/utils/featureFlag'
import {updatePinnedItemByParam} from 'src/shared/contexts/pinneditems'
import {getOrg} from 'src/organizations/selectors'
import {getAuthorizations} from 'src/client/generatedRoutes'
import {RemoteDataState} from 'src/types'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {
  getNotebooksShare,
  deleteNotebooksShare,
  postNotebooksShare,
} from 'src/client/notebooksRoutes'
import {event} from 'src/cloud/utils/reporting'

type MenuItemType = {
  title: string
  onClick: () => void
}
interface ButtonProp {
  menuItems: MenuItemType[]
}

const MenuButton: FC<ButtonProp> = ({menuItems}) => {
  return (
    <Dropdown
      button={(active, onClick) => (
        <SquareButton
          icon={IconFont.More}
          onClick={onClick}
          active={active}
          // TODO: testID=""
        />
      )}
      menu={() => (
        <Dropdown.Menu style={{width: '200px'}}>
          {menuItems.map(item => (
            <Dropdown.Item key={item.title} onClick={item.onClick}>
              {item.title}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      )}
    />
  )
}
interface Token {
  token: string
  description: string
}

interface Share {
  id: string
  accessID: string
}

const FlowHeader: FC = () => {
  const {remove, clone, currentID} = useContext(FlowListContext)
  const {flow, updateOther} = useContext(FlowContext)
  const history = useHistory()
  const {id: orgID} = useSelector(getOrg)
  const [sharing, setSharing] = useState(false)
  const [token, setToken] = useState<Token>()
  const [loadingToken, setLoadingToken] = useState(RemoteDataState.NotStarted)
  const [tokens, setTokens] = useState<Token[]>([])
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
    setLoadingToken(RemoteDataState.Loading)
    getAuthorizations({query: {orgID}}).then(resp => {
      if (resp.status !== 200) {
        return
      }

      setLoadingToken(RemoteDataState.Done)
      const _tokens = resp.data.authorizations.map(a => ({
        token: a.token,
        description: a.description || 'Describe this token',
      }))

      setTokens(_tokens)
    })
    event('Show Share Menu', {share: !!share ? 'sharing' : 'not sharing'})
  }

  const hideShare = () => {
    setSharing(false)
    setToken(null)
    setLoadingToken(RemoteDataState.NotStarted)
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

  const handleDownloadAsPNG = () => {
    console.log('download PNG...')
  }

  const handleDownloadAsPDF = () => {
    console.log('download PDF...')
    const canvas = document.getElementById(currentID)
    import('html2canvas').then((module: any) =>
      module
        .default(canvas as HTMLDivElement, {
          backgroundColor: '#07070e',
        })
        .then(result => {
          import('jspdf').then((jsPDF: any) => {
            const doc = new jsPDF.default({
              orientation: 'landscape',
              unit: 'pt',
              format: 'a4',
            })
            // Background Color
            doc.setFillColor('#07070E')
            doc.rect(0, 0, 850, 600, 'F')

            // InfluxData logo
            const paddingX = 24
            const logoX = paddingX
            const logoY = logoX
            const logoWidth = 138
            const logoHeight = (logoWidth * 220) / 1080 // Logo size is 220 x 1080
            const logoData =
              'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABDgAAADcCAMAAACiVOE6AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MDU5RjYzQzE2N0ZFMTFFOTkxRjBFMTEwREFDRjU5M0MiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MDU5RjYzQzI2N0ZFMTFFOTkxRjBFMTEwREFDRjU5M0MiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDowNTlGNjNCRjY3RkUxMUU5OTFGMEUxMTBEQUNGNTkzQyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDowNTlGNjNDMDY3RkUxMUU5OTFGMEUxMTBEQUNGNTkzQyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PqVyoJUAAAAGUExURf//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'
            doc.addImage(logoData, 'PNG', logoX, logoY, logoWidth, logoHeight)

            // Notebook title
            const fontSize = 24
            const fontX = logoX
            const fontY = logoY + logoHeight + fontSize * 1.5
            doc.setFontSize(fontSize)
            doc.setTextColor('#FFF')
            doc.text(flow.name, fontX, fontY)

            // Pipelist screenshot
            const imgData = result.toDataURL('image/png')

            // a4 format landscape size in pt unit is 842 x 595
            const pageWidth = 842
            const pageHeight = 595
            const imgWidth = pageWidth - paddingX * 2
            const imgHeight = (result.height * imgWidth) / result.width
            let heightLeft = imgHeight
            let position = 0

            doc.addImage(
              imgData,
              'PNG',
              paddingX,
              position + fontY + fontSize,
              imgWidth,
              imgHeight
            )
            heightLeft -= pageHeight

            // Add multiple pages
            while (heightLeft >= 0) {
              position = heightLeft - imgHeight
              doc.addPage()

              // Add background color
              doc.setFillColor('#07070E')
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
            doc.save('visualization.pdf')
          })
        })
    )
  }

  const generateLink = () => {
    setLinkLoading(RemoteDataState.Loading)
    postNotebooksShare({
      data: {
        notebookID: flow.id,
        orgID,
        token: token.token,
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

  let tokenDropdownStatus = ComponentStatus.Disabled

  if (loadingToken === RemoteDataState.Loading) {
    tokenDropdownStatus = ComponentStatus.Loading
  }
  if (loadingToken === RemoteDataState.Done && tokens.length) {
    tokenDropdownStatus = ComponentStatus.Default
  }

  let linkGenerationStatus = ComponentStatus.Disabled

  if (linkLoading === RemoteDataState.Loading) {
    linkGenerationStatus = ComponentStatus.Loading
  } else if (!!token) {
    linkGenerationStatus = ComponentStatus.Default
  }

  const tokenOptions = tokens.map(t => (
    <Dropdown.Item
      key={t.token}
      value={t.token}
      selected={t.token === token?.token}
      title={t.description}
      className="share-token--option"
      onClick={() => setToken(t)}
    >
      <h1>{t.description}</h1>
      <h3>{t.token}</h3>
    </Dropdown.Item>
  ))

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
                <MenuButton
                  menuItems={[
                    {
                      title: 'Delete',
                      onClick: handleDelete,
                    },
                    {
                      title: 'Clone',
                      onClick: handleClone,
                    },
                    {
                      title: 'Download as PNG',
                      onClick: handleDownloadAsPNG,
                    },
                    {
                      title: 'Download as PDF',
                      onClick: handleDownloadAsPDF,
                    },
                  ]}
                />
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
            <p className="share-token--steps">
              Choose an{' '}
              <Link to={`/orgs/${orgID}/load-data/tokens`}>API Token</Link>{' '}
              scoped to the resources you want to share
            </p>
            <Dropdown
              button={(active, onClick) => (
                <Dropdown.Button
                  onClick={onClick}
                  active={active}
                  status={tokenDropdownStatus}
                >
                  {token ? token.description : 'Select an API Token'}
                </Dropdown.Button>
              )}
              menu={onCollapse => (
                <Dropdown.Menu onCollapse={onCollapse}>
                  {tokenOptions}
                </Dropdown.Menu>
              )}
              style={{width: '250px', flex: '0 0 250px'}}
            />
            <ErrorTooltip
              className="warning-icon"
              tooltipContents="By sharing this link, your org may incur charges when a user visits the page and the query is run."
              tooltipStyle={{width: '250px'}}
            />
            <SquareButton
              icon={IconFont.Checkmark_New}
              onClick={generateLink}
              color={ComponentColor.Success}
              status={linkGenerationStatus}
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
