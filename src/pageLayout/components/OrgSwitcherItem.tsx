// Libraries
import React, {FC} from 'react'
import {useHistory} from 'react-router-dom'

// Components
import {IconFont, Icon} from '@influxdata/clockface'

interface Props {
  orgName: string
  orgID: string
  selected: boolean
  onDismiss: () => void
}

const OrgSwitcherItem: FC<Props> = ({orgName, selected, onDismiss, orgID}) => {
  const history = useHistory()
  const orgSwitcherItemClass = `org-switcher--item ${
    selected ? 'org-switcher--item__selected' : ''
  }`

  const orgSwitcherIcon = selected
    ? IconFont.CheckMark_New
    : IconFont.CaretRight_New

  const handleClick = (): void => {
    onDismiss()
    history.push(`/orgs/${orgID}`)
  }

  const currentOrgIndicator = selected ? <em>Current</em> : null

  return (
    <li className={orgSwitcherItemClass} onClick={handleClick}>
      <div className="org-switcher--item-circle">
        <Icon glyph={orgSwitcherIcon} className="org-switcher--item-icon" />
      </div>
      <span className="org-switcher--item-label">
        {orgName}
        {currentOrgIndicator}
      </span>
    </li>
  )
}

export default OrgSwitcherItem
