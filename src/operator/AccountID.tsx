import React, {FC} from 'react'
import {Link} from 'react-router-dom'

interface Props {
  value: string
}

const AccountID: FC<Props> = ({value}) => {
  return (
    <Link data-testid={`accountID${value}`} to={`/operator/accounts/${value}`}>
      {value}
    </Link>
  )
}

export default AccountID
