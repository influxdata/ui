// Libraries
import React, {FC} from 'react'

// Components
import {
  Button,
  ComponentColor,
  Icon,
  IconFont,
  TreeNav,
} from '@influxdata/clockface'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {safeBlankLinkOpen} from 'src/utils/safeBlankLinkOpen'

// Styles
import 'src/pageLayout/components/RequestPocWidget.scss'

interface Props {
  expanded: boolean
}

export const RequestPocWidget: FC<Props> = ({expanded}) => {
  const handleRequestPocClick = () => {
    event('nav.requestPOC.clicked')
    safeBlankLinkOpen('https://www.influxdata.com/proof-of-concept/')
  }

  const contents = (
    <div className="nav-item-poc--contents">
      <span>
        This is a rate limited environment. Want to test the performance and
        scalability of your workload?
      </span>
      <Button
        icon={IconFont.Flask}
        text="Request a POC"
        color={ComponentColor.Primary}
        onClick={handleRequestPocClick}
      />
    </div>
  )

  if (expanded) {
    return <div className="nav-item-poc">{contents}</div>
  } else {
    return (
      <TreeNav.Item
        id="nav-item-poc"
        testID="nav-item-poc"
        icon={<Icon glyph={IconFont.Flask} />}
        label="Request a POC"
        shortLabel="POC"
        className="nav-item-poc"
      >
        <TreeNav.SubMenu>{contents}</TreeNav.SubMenu>
      </TreeNav.Item>
    )
  }
}
