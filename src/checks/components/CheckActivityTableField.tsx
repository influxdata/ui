// Libraries
import React, {FC} from 'react'
import {Link} from 'react-router-dom'

// Utils
import {formatOrgRoute} from 'src/shared/utils/formatOrgRoute'

// Types
import {StatusRow} from 'src/types'

interface OwnProps {
  row: StatusRow
}

const CheckActivityTableField: FC<OwnProps> = ({row: {checkName, checkID}}) => {
  const href = formatOrgRoute(
    `/checks/${checkID}/?filter="checkID"=="${checkID}"&type=statuses`
  )

  return <Link to={href}>{checkName}</Link>
}

export default CheckActivityTableField
