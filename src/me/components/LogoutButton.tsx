// Libraries
import React, {FC} from 'react'
import {Link} from 'react-router-dom'

// Components
import {Button, ComponentSize} from '@influxdata/clockface'

const LogoutButton: FC = () => (
  <>
    <Link to="/logout">
      <Button
        text="Logout"
        size={ComponentSize.ExtraSmall}
        testID="logout--button"
      />
    </Link>
  </>
)

export default LogoutButton
