// Libraries
import React, {FC} from 'react'
import {useSelector} from 'react-redux'
import {withRouter, RouteComponentProps} from 'react-router-dom'

// Components
import {Dropdown} from '@influxdata/clockface'

// Types
import {IconFont, ComponentColor} from '@influxdata/clockface'

// Selectors
import {getOrg} from 'src/organizations/selectors'

type GenerateTokenProps = RouteComponentProps

const GenerateTokenDropdown: FC<GenerateTokenProps> = ({history}) => {
  const org = useSelector(getOrg)

  const allAccessOption = 'All Access Token'

  const customApiOption = 'Custom API Token'

  const handleAllAccess = () => {
    history.push(`/orgs/${org.id}/load-data/tokens/generate/all-access`)
  }

  const handleCustomApi = () => {
    history.push(`/orgs/${org.id}/load-data/tokens/generate/custom-api`)
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

export default withRouter(GenerateTokenDropdown)
