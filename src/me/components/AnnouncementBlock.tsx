import React, {FC} from 'react'

// Components
import {
  ButtonShape,
  ComponentColor,
  ComponentSize,
  FlexBox,
  FlexDirection,
  Heading,
  HeadingElement,
  Icon,
  IconFont,
  JustifyContent,
  LinkButton,
  LinkTarget,
  Panel,
} from '@influxdata/clockface'

// Styles
import 'src/me/components/AnnouncementBlock.scss'

interface OwnProps {
  body?: string | JSX.Element
  ctaLink?: string
  ctaText?: string
  icon?: IconFont
  image?: JSX.Element
  title?: string
}

const AnnouncementBlock: FC<OwnProps> = ({
  body,
  ctaLink,
  ctaText,
  icon = IconFont.Star,
  image,
  title,
}) => {
  return (
    <FlexBox direction={FlexDirection.Row} className="announcement-block">
      <FlexBox.Child basis={0} grow={0} className="announcement-block--type">
        <Icon glyph={icon} className="announcement-block--type-icon" />
      </FlexBox.Child>
      <FlexBox.Child basis={0} grow={1}>
        <Panel
          className="announcement-block--panel"
          backgroundColor="rgba(0, 0, 0, 0)"
        >
          <Panel.Header
            size={ComponentSize.ExtraSmall}
            className="announcement-block--panel-header"
          >
            {image}
            <Heading element={HeadingElement.H4}>{title}</Heading>
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
              <LinkButton
                text={ctaText}
                titleText={ctaText}
                href={ctaLink}
                target={LinkTarget.Blank}
                size={ComponentSize.ExtraSmall}
                shape={ButtonShape.Default}
                color={ComponentColor.Tertiary}
              />
            </Panel.Footer>
          )}
        </Panel>
      </FlexBox.Child>
    </FlexBox>
  )
}

export default AnnouncementBlock
