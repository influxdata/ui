import React, {FC} from 'react'
import {LinkButton, IconFont} from '@influxdata/clockface'

interface Props {
  goToLink: string
  text: string
}

const BackButton: FC<Props> = ({goToLink, text}): JSX.Element => {
  return (
    <LinkButton
      style={{padding: '0.75em'}}
      href={goToLink}
      icon={IconFont.CaretLeft}
      text={text}
    />
  )
}

export default BackButton
