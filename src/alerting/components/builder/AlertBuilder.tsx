// Libraries
import React, {FC} from 'react'

// Components
import CheckMetaCard from 'src/checks/components/CheckMetaCard'
import CheckMessageCard from 'src/checks/components/CheckMessageCard'
import CheckConditionsCard from 'src/checks/components/CheckConditionsCard'

const AlertBuilder: FC = () => {
  return (
    <div className="alert-builder" data-testid="query-builder">
      <CheckMetaCard />
      <CheckMessageCard />
      <CheckConditionsCard />
    </div>
  )
}

export default AlertBuilder
