import React, {FC} from 'react'
import {Link, useLocation} from 'react-router-dom'

interface Props {
  idpeID: string
}

const OrgID: FC<Props> = ({idpeID}) => {
  const location = useLocation()

  return (
    <Link
      data-testid={`orgID${idpeID}`}
      to={`${location.pathname}/organizations/${idpeID}`}
    >
      {idpeID}
    </Link>
  )
}

export default OrgID
