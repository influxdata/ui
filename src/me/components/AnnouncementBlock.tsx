import React, {FC} from 'react'

// Components
import {
  ButtonShape,
  ComponentSize,
  Heading,
  HeadingElement,
  JustifyContent,
  LinkButton,
  LinkTarget,
  Panel,
} from '@influxdata/clockface'

interface OwnProps {
  image?: JSX.Element
  title?: string
  body?: string | JSX.Element
  ctaText?: string
  ctaLink?: string
}

const AnnouncementBlock: FC<OwnProps> = (props: OwnProps) => {
  return (
    <Panel>
      <Panel.Header>
        {props.image}
        <Heading element={HeadingElement.H3}>{props.title}</Heading>
      </Panel.Header>
      <Panel.Body>{props.body}</Panel.Body>
      {props.ctaText && props.ctaLink && (
        <Panel.Footer justifyContent={JustifyContent.FlexEnd}>
          <LinkButton
            text={props.ctaText}
            titleText={props.ctaText}
            href={props.ctaLink}
            target={LinkTarget.Blank}
            size={ComponentSize.ExtraSmall}
            shape={ButtonShape.Default}
          />
        </Panel.Footer>
      )}
    </Panel>
  )
}

export default AnnouncementBlock
