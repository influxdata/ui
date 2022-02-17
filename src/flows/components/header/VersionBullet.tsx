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
  version: VersionHistory
}

const VersionBullet: FC<Props> = ({version}) => {
  const triggerRef: RefObject<HTMLElement> = createRef()
  const {flow} = useContext(FlowContext)
  const history = useHistory()
  const orgID = useSelector(getOrg)?.id
  const params = useParams<{notebookID?: string; id?: string}>()

  const handleBulletClick = () => {
    history.push(
      `/orgs/${orgID}/${PROJECT_NAME_PLURAL.toLowerCase()}/${
        flow.id
      }/versions/${version.id}`
    )
  }

  let activeClassname = ''

  if (params.notebookID && params.id && version.id === params.id) {
    activeClassname = 'active-version--button'
  }

  return (
    <>
      <div onClick={handleBulletClick}>
        <Bullet
          className={`publish-version-bullet--button ${activeClassname}`}
          glyph={IconFont.Checkmark_New}
          size={ComponentSize.Small}
          color={InfluxColors.White}
          backgroundColor={InfluxColors.Amethyst}
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
            Published by {version.publishedBy} at{' '}
            {new Date(version.publishedAt).toLocaleString()}
          </h6>
        )}
      />
    </>
  )
}

export default VersionBullet
