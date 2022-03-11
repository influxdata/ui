import React, {FC, createRef, RefObject, useContext} from 'react'
import {
  IconFont,
  Icon,
  List,
  Popover,
  PopoverInteraction,
  SquareButton,
  InfluxColors,
} from '@influxdata/clockface'
import {useSelector} from 'react-redux'

// Contexts
import {FlowContext} from 'src/flows/context/flow.current'
import {FlowListContext} from 'src/flows/context/flow.list'
import {VersionPublishContext} from 'src/flows/context/version.publish'
import {useHistory} from 'react-router-dom'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {event} from 'src/cloud/utils/reporting'
import {getOrg} from 'src/organizations/selectors'
import {deletePinnedItemByParam} from 'src/shared/contexts/pinneditems'
import {downloadImage} from 'src/shared/utils/download'

// Constants
import {PROJECT_NAME_PLURAL} from 'src/flows'

const backgroundColor = '#07070E'

type Props = {
  handleResetShare: () => void
}

const MenuButton: FC<Props> = ({handleResetShare}) => {
  const {remove, clone} = useContext(FlowListContext)
  const {flow} = useContext(FlowContext)
  const {handlePublish, versions} = useContext(VersionPublishContext)
  const {id: orgID} = useSelector(getOrg)

  const triggerRef: RefObject<HTMLButtonElement> = createRef()
  const history = useHistory()

  const handleClone = async () => {
    event('clone_notebook')
    const clonedId = await clone(flow.id)
    handleResetShare()
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

  const menuItems: any[] = [
    {
      type: 'menuitem',
      title: 'Clone',
      onClick: handleClone,
      icon: IconFont.Duplicate_New,
    },
    {
      type: 'menuitem',
      title: 'Download as PNG',
      onClick: handleDownloadAsPNG,
      icon: IconFont.Download_New,
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

  if (isFlagEnabled('flowPublishLifecycle')) {
    menuItems.splice(
      0,
      0,
      {
        type: 'menuitem',
        title: 'Save to version history',
        onClick: handlePublish,
        icon: IconFont.Save,
      },
      {
        type: 'menuitem',
        title: 'Version history',
        onClick: handleViewPublish,
        icon: IconFont.UploadOutline, // TODO(ariel): update the icon when its available
        disabled: () => {
          if (versions.length > 1) {
            return false
          }
          return versions[0]?.id === 'draft'
        },
      },
      {title: 'divider', type: 'divider'}
    )
  }

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
        style={{minWidth: 209}}
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
  )
}

export default MenuButton
