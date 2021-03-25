import React, {FC} from 'react'
import {
  ReflessPopover,
  PopoverPosition,
  Appearance,
  SquareButton,
  IconFont,
  PopoverInteraction,
} from '@influxdata/clockface'
import {Link} from 'react-router-dom'
import {get} from 'lodash'

// interface Props {
//   operator: User
// }

const OperatorNav: FC = () => {
  // TODO(ariel): get the operator here
  return (
    <ReflessPopover
      position={PopoverPosition.ToTheLeft}
      showEvent={PopoverInteraction.Click}
      hideEvent={PopoverInteraction.Click}
      contents={() => (
        <>
          <p>{get(operator ?? {}, 'email', '')}</p>
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
