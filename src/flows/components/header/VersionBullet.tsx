import React, {createRef, FC, RefObject, useContext} from 'react'
import {useHistory, useParams} from 'react-router-dom'
import {useSelector} from 'react-redux'
import {
  Appearance,
  Bullet,
  ComponentSize,
  IconFont,
  InfluxColors,
  Popover,
  PopoverInteraction,
} from '@influxdata/clockface'

// Context
import {FlowContext} from 'src/flows/context/flow.current'

// Selectors
import {getOrg} from 'src/organizations/selectors'

// Types
import {VersionHistory} from 'src/client/notebooksRoutes'
import {PROJECT_NAME_PLURAL} from 'src/flows'

type Props = {
  draftVersion?: boolean
  version?: VersionHistory
}

const VersionBullet: FC<Props> = ({version, draftVersion}) => {
  const triggerRef: RefObject<HTMLElement> = createRef()
  const {flow} = useContext(FlowContext)
  const history = useHistory()
  const orgID = useSelector(getOrg)?.id
  const params = useParams<{notebookID?: string; id?: string}>()

  const handleBulletClick = () => {
    let baseRoute = `/orgs/${orgID}/${PROJECT_NAME_PLURAL.toLowerCase()}/${
      flow.id
    }`

    if (!draftVersion) {
      baseRoute = `${baseRoute}/versions/${version.id}`
    }

    history.push(baseRoute)
  }

  let activeClassname = ''

  const currentPublishedVersion =
    params?.notebookID && params?.id && version?.id === params?.id
  const notVersionedDraft = draftVersion && !params.notebookID && !version?.id

  if (currentPublishedVersion || notVersionedDraft) {
    activeClassname = 'active-version--button'
  }

  let popoverMessage = `current draft version`

  if (version) {
    popoverMessage = `Published at ${new Date(
      version.publishedAt
    ).toLocaleString()}\n
    by ${version.publishedBy}`
  }

  return (
    <>
      <div onClick={handleBulletClick} className="publish-version--bullet">
        <Bullet
          className={`${activeClassname} ${
            draftVersion
              ? 'publish-version-draft'
              : 'publish-version-bullet--button'
          }`}
          glyph={IconFont.Checkmark_New}
          size={ComponentSize.Small}
          color={InfluxColors.White}
          backgroundColor={
            draftVersion ? InfluxColors.Grey45 : InfluxColors.Amethyst
          }
          ref={triggerRef}
        />
      </div>
      <Popover
        appearance={Appearance.Outline}
        triggerRef={triggerRef}
        enableDefaultStyles={false}
        showEvent={PopoverInteraction.Hover}
        hideEvent={PopoverInteraction.Hover}
        contents={() => (
          <h6 className="publish-version--tooltip">
            <pre>{popoverMessage}</pre>
          </h6>
        )}
      />
    </>
  )
}

export default VersionBullet
