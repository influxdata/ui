import React, {FC, useContext} from 'react'
import {
  ReflessPopover,
  PopoverPosition,
  Appearance,
  SquareButton,
  IconFont,
  PopoverInteraction,
} from '@influxdata/clockface'
import {Link} from 'react-router-dom'
import {OperatorContext} from './context/operator'

const OperatorNav: FC = () => {
  const {operator} = useContext(OperatorContext)
  return (
    <ReflessPopover
      position={PopoverPosition.ToTheLeft}
      showEvent={PopoverInteraction.Click}
      hideEvent={PopoverInteraction.Click}
      contents={() => (
        <>
          <p>{operator?.email ?? ''}</p>
          <Link to="/logout" data-testid="logout-button">
            Logout
          </Link>
        </>
      )}
      appearance={Appearance.Outline}
      className="operator-nav-popover"
    >
      <SquareButton
        className="operator-nav-button"
        icon={IconFont.User}
        testID="operator-nav-button"
      />
    </ReflessPopover>
  )
}

export default OperatorNav
