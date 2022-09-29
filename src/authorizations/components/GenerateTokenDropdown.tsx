// Libraries
import React, {FC} from 'react'
import {connect, ConnectedProps, useDispatch} from 'react-redux'

// Components
import {Dropdown} from '@influxdata/clockface'

// Types
import {IconFont, ComponentColor} from '@influxdata/clockface'

import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'
import {getAllResources} from 'src/authorizations/actions/thunks'
import {notify} from 'src/shared/actions/notifications'
import {getResourcesTokensFailure} from 'src/shared/copy/notifications'

// Utils
import {event} from 'src/cloud/utils/reporting'

type ReduxProps = ConnectedProps<typeof connector>

const GenerateTokenDropdown: FC<ReduxProps> = ({
  showOverlay,
  dismissOverlay,
  getAllResources,
}) => {
  const dispatch = useDispatch()
  const allAccessOption = 'All Access API Token'

  const customApiOption = 'Custom API Token'

  const handleAllAccess = async () => {
    try {
      await getAllResources()
      showOverlay('add-master-token', null, dismissOverlay)
      event('generate_token_dropdown.all_access_overlay.opened')
    } catch (e) {
      dispatch(notify(getResourcesTokensFailure('all access token')))
      event('generate_token_dropdown.all_access_overlay.failed')
    }
  }

  const handleCustomApi = async () => {
    try {
      await getAllResources()
      showOverlay('add-custom-token', null, dismissOverlay)
      event('generate_token_dropdown.custom_API_token_overlay.opened')
    } catch (e) {
      dispatch(notify(getResourcesTokensFailure('custom api token')))
      event('generate_token_dropdown.custom_API_token_overlay.failed')
    }
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
      style={{width: '240px'}}
      button={(active, onClick) => (
        <Dropdown.Button
          active={active}
          onClick={onClick}
          icon={IconFont.Plus_New}
          color={ComponentColor.Primary}
          testID="dropdown-button--gen-token"
          style={{textTransform: 'uppercase', letterSpacing: '0.07em'}}
        >
          Generate API Token
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
  showOverlay,
  dismissOverlay,
  getAllResources,
}

const connector = connect(null, mdtp)

export default connector(GenerateTokenDropdown)
