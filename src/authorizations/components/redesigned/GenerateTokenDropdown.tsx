// Libraries
import React, {FC} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {withRouter, RouteComponentProps} from 'react-router-dom'

// Components
import {Dropdown} from '@influxdata/clockface'

// Types
import {IconFont, ComponentColor} from '@influxdata/clockface'

import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'
import {getResources} from 'src/authorizations/actions/thunks'

type GenerateTokenProps = RouteComponentProps
type ReduxProps = ConnectedProps<typeof connector>

const GenerateTokenDropdown: FC<ReduxProps & GenerateTokenProps> = ({
  onShowOverlay,
  onDismissOverlay,
  getResources,
}) => {
  const allAccessOption = 'All Access Token'

  const customApiOption = 'Custom API Token'

  const handleAllAccess = () => {
    onShowOverlay('add-master-token', null, onDismissOverlay)
  }

  const handleCustomApi = () => {
    getResources()
    onShowOverlay('add-custom-token', null, onDismissOverlay)
  }

  const handleSelect = (selection: string): void => {
    if (selection === allAccessOption) {
      handleAllAccess()
    } else if (selection === customApiOption) {
      handleCustomApi()
    }
  }

  return (
    <Dropdown
      testID="dropdown--gen-token"
      style={{width: '160px'}}
      button={(active, onClick) => (
        <Dropdown.Button
          active={active}
          onClick={onClick}
          icon={IconFont.Plus}
          color={ComponentColor.Primary}
          testID="dropdown-button--gen-token"
        >
          Generate Token
        </Dropdown.Button>
      )}
      menu={onCollapse => (
        <Dropdown.Menu onCollapse={onCollapse}>
          <Dropdown.Item
            testID="dropdown-item generate-token--all-access"
            id={allAccessOption}
            key={allAccessOption}
            value={allAccessOption}
            onClick={handleSelect}
          >
            {allAccessOption}
          </Dropdown.Item>
          <Dropdown.Item
            testID="dropdown-item generate-token--custom-api"
            id={customApiOption}
            key={customApiOption}
            value={customApiOption}
            onClick={handleSelect}
          >
            {customApiOption}
          </Dropdown.Item>
        </Dropdown.Menu>
      )}
    />
  )
}

const mdtp = {
  onShowOverlay: showOverlay,
  onDismissOverlay: dismissOverlay,
  getResources: getResources,
}

const connector = connect(null, mdtp)

export default connector(withRouter(GenerateTokenDropdown))
