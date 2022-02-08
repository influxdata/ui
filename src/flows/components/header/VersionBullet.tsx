import React, {createRef, FC, RefObject} from 'react'
import {
  Appearance,
  Bullet,
  ComponentSize,
  IconFont,
  InfluxColors,
  Popover,
  PopoverInteraction,
} from '@influxdata/clockface'

// Types
import {VersionHistory} from 'src/client/notebooksRoutes'

type Props = {
  version: VersionHistory
}

const VersionBullet: FC<Props> = ({version}) => {
  const triggerRef: RefObject<HTMLElement> = createRef()

  const handleBulletClick = () => {
    // TODO(ariel): navigate to the version history based on the passed in version
  }

  return (
    <>
      <div onClick={handleBulletClick}>
        <Bullet
          className="publish-version-bullet--button"
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
