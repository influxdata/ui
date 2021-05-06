// Libraries
import React, {FC, useContext} from 'react'
import {Link} from 'react-router-dom'

// Context
import {ResourceIDsContext} from 'src/alerting/components/AlertHistoryIndex'

// Utils
import {formatOrgRoute} from 'src/shared/utils/formatOrgRoute'

// Types
import {StatusRow} from 'src/types'

interface Props {
  row: StatusRow
}

const CheckHistoryTableField: FC<Props> = ({row: {checkName, checkID}}) => {
  const {checkIDs} = useContext(ResourceIDsContext)

  if (!checkIDs[checkID]) {
    return (
      <div
        className="check-name-field"
        title="The check that created this no longer exists"
      >
        {checkName}
      </div>
    )
  }

  const href = formatOrgRoute(
    `/checks/${checkID}/?filter="checkID"=="${checkID}"&type=statuses`
  )

  return <Link to={href}>{checkName}</Link>
}

export default CheckHistoryTableField
