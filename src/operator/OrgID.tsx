import React, {FC} from 'react'
import {Link} from 'react-router-dom'

interface Props {
  orgId: string
}

const OrgID: FC<Props> = ({orgId}) => {
  return (
    <Link data-testid={`orgID${orgId}`} to={`/operator/organizations/${orgId}`}>
      {orgId}
    </Link>
  )
}

export default OrgID
