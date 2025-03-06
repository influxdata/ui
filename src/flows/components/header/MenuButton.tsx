import React, {createRef, FC, RefObject, useContext, useState} from 'react'
import {
  Icon,
  IconFont,
  InfluxColors,
  List,
  Popover,
  PopoverInteraction,
  RemoteDataState,
  SpinnerContainer,
  SquareButton,
  TechnoSpinner,
} from '@influxdata/clockface'
import {useSelector} from 'react-redux'

// Contexts
import {FlowContext} from 'src/flows/context/flow.current'
import {VersionPublishContext} from 'src/flows/context/version.publish'
import {useHistory} from 'react-router-dom'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {getOrg} from 'src/organizations/selectors'
import {downloadImage} from 'src/shared/utils/download'

// Constants
import {PROJECT_NAME_PLURAL} from 'src/flows'
import {CLOUD} from 'src/shared/constants'

const backgroundColor = '#07070E'

type Props = {
  handleResetShare: () => void
}

const MenuButton: FC<Props> = ({handleResetShare}) => {
  const {flow, cloneNotebook, deleteNotebook} = useContext(FlowContext)
  const {versions} = useContext(VersionPublishContext)
  const {id: orgID} = useSelector(getOrg)
  const [loading, setLoading] = useState(RemoteDataState.Done)

  const triggerRef: RefObject<HTMLButtonElement> = createRef()
  const history = useHistory()

  const handleClone = async () => {
    try {
      setLoading(RemoteDataState.Loading)
      event('clone_notebook', {
        context: 'notebook',
      })
      const clonedId = await cloneNotebook()
      handleResetShare()
      setLoading(RemoteDataState.Done)
      history.push(
        `/orgs/${orgID}/${PROJECT_NAME_PLURAL.toLowerCase()}/${clonedId}`
      )
    } catch {
      setLoading(RemoteDataState.Done)
    }
  }

  const handleDelete = async () => {
    try {
      setLoading(RemoteDataState.Loading)
      event('delete_notebook', {
        context: 'notebook',
      })
      await deleteNotebook()
      setLoading(RemoteDataState.Done)
      history.push(`/orgs/${orgID}/${PROJECT_NAME_PLURAL.toLowerCase()}`)
    } catch {
      setLoading(RemoteDataState.Error)
    }
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
    // Enable map background
    useCORS: true,
  }

  const handleDownloadAsPNG = () => {
    event('full notebook png download')
    const canvas = document.getElementById(flow.id)
    import('html2canvas').then((module: any) =>
      module.default(canvas as HTMLDivElement, canvasOptions).then(result => {
        downloadImage(result.toDataURL(), `${flow.name}.png`)
      })
    )
  }

  const handleDownloadAsPDF = () => {
    event('full notebook pdf download')
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

  const handleViewPublish = () => {
    event('viewing_publish_history')
    const [first, second] = versions
    // accounts for the draft state
    let versionId = first?.id
    if (first?.id === 'draft' && second?.id) {
      versionId = second?.id
    }
    history.push(
      `/orgs/${orgID}/${PROJECT_NAME_PLURAL.toLowerCase()}/${
        flow.id
      }/versions/${versionId}`
    )
  }

  const possibleMenuItems: any[] = [
    {
      type: 'menuitem',
      title: 'Version history',
      onClick: handleViewPublish,
      icon: IconFont.History,
      disabled: () => {
        const [first, second] = versions
        // accounts for the draft state
        let versionId = first?.id
        if (first?.id === 'draft' && second?.id) {
          versionId = second?.id
        }
        return !(versionId !== 'draft' && typeof versionId !== undefined)
      },
    },
    {title: 'divider', type: 'divider'},
    {
      type: 'menuitem',
      title: 'Download as PNG',
      onClick: handleDownloadAsPNG,
      icon: IconFont.Download_New,
    },
    {
      type: 'menuitem',
      title: 'Clone',
      onClick: handleClone,
      icon: IconFont.Duplicate_New,
    },
    {
      type: 'menuitem',
      title: 'Download as PDF',
      onClick: handleDownloadAsPDF,
      icon: IconFont.Download_New,
    },
    {
      type: 'menuitem',
      title: 'Delete',
      onClick: handleDelete,
      icon: IconFont.Trash_New,
      testID: 'flow-menu-button-delete',
    },
  ]

  const menuItems = possibleMenuItems.filter(item => {
    if (!CLOUD) {
      return (
        item.title !== 'Version history' &&
        item.title !== 'divider' &&
        item.title !== 'Clone'
      )
    }
    return true
  })

  return (
    <SpinnerContainer
      loading={loading}
      spinnerComponent={<TechnoSpinner style={{width: 20, height: 20}} />}
      style={{width: 20, height: 20}}
    >
      <>
        <SquareButton
          ref={triggerRef}
          icon={IconFont.More}
          testID="flow-menu-button"
        />
        <Popover
          triggerRef={triggerRef}
          enableDefaultStyles={false}
          style={{minWidth: 209}}
          onShow={() => {
            event('Notebook main menu opened')
          }}
          showEvent={PopoverInteraction.Click}
          hideEvent={PopoverInteraction.Click}
          contents={onHide => (
            <List>
              {menuItems.map(item => {
                if (item.type === 'divider') {
                  return (
                    <List.Divider
                      key={item.title}
                      style={{backgroundColor: InfluxColors.Grey35}}
                    />
                  )
                }
                return (
                  <List.Item
                    key={item.title}
                    disabled={item?.disabled ? item.disabled() : false}
                    onClick={() => {
                      item?.onClick()
                      onHide()
                    }}
                    testID={item?.testID || ''}
                  >
                    <Icon glyph={item?.icon} />
                    <span style={{paddingLeft: '10px'}}>{item.title}</span>
                  </List.Item>
                )
              })}
            </List>
          )}
        />
      </>
    </SpinnerContainer>
  )
}

export default MenuButton
