import React, {FC} from 'react'

// Components
import {
  ComponentSize,
  FlexBox,
  FlexDirection,
  Heading,
  HeadingElement,
  Icon,
  IconFont,
  InfluxColors,
  JustifyContent,
  Panel,
} from '@influxdata/clockface'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

// Utils
import {event} from 'src/cloud/utils/reporting'

// Styles
import 'src/me/components/AnnouncementBlock.scss'

interface OwnProps {
  body?: string | JSX.Element
  ctaLink?: string
  ctaText?: string
  date?: string
  icon?: IconFont
  iconColor?: InfluxColors | string
  image?: JSX.Element
  title?: string
}

export const AnnouncementBlock: FC<OwnProps> = ({
  body,
  ctaLink,
  ctaText,
  date,
  icon = IconFont.Star,
  iconColor,
  image,
  title,
}) => {
  const handleCtaClick = () => {
    event(`announcementBlock.${title}.clicked`)
  }

  const headerClasses = `announcement-block--panel-header${
    image && ' announcement-block--panel-header__image'
  }`

  return (
    <FlexBox direction={FlexDirection.Row} className="announcement-block">
      <FlexBox.Child basis={0} grow={0} className="announcement-block--type">
        <Icon
          glyph={icon}
          className="announcement-block--type-icon"
          style={iconColor && {color: iconColor}}
        />
        <div className="announcement-block--date">{date}</div>
      </FlexBox.Child>
      <FlexBox.Child basis={0} grow={1}>
        <Panel
          className="announcement-block--panel"
          backgroundColor="rgba(0, 0, 0, 0)"
        >
          <Panel.Header
            size={ComponentSize.ExtraSmall}
            className={headerClasses}
          >
            {image}
            <Heading element={HeadingElement.H4}>
              {ctaLink ? (
                <SafeBlankLink href={ctaLink} onClick={handleCtaClick}>
                  {title}
                </SafeBlankLink>
              ) : (
                <>{title}</>
              )}
            </Heading>
          </Panel.Header>
          <Panel.Body
            size={ComponentSize.ExtraSmall}
            className="announcement-block--panel-body"
          >
            {body}
          </Panel.Body>
          {ctaText && ctaLink && (
            <Panel.Footer
              justifyContent={JustifyContent.FlexEnd}
              size={ComponentSize.ExtraSmall}
              className="announcement-block--panel-footer"
            >
              <SafeBlankLink href={ctaLink} onClick={handleCtaClick}>
                <div className="cf-button cf-button-xs cf-button-tertiary">
                  <span className="cf-button-label">{ctaText}</span>
                </div>
              </SafeBlankLink>
            </Panel.Footer>
          )}
        </Panel>
      </FlexBox.Child>
    </FlexBox>
  )
}
