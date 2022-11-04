import React, {FC} from 'react'
import {useSelector} from 'react-redux'

// Components
import {Accordion} from '@influxdata/clockface'
import {FieldsAsColumns} from 'src/dataExplorer/components/FieldsAsColumns'
import {GroupBy} from 'src/dataExplorer/components/GroupBy'
import {AggregateWindow} from 'src/dataExplorer/components/AggregateWindow'

// Context
import {GroupKeysProvider} from 'src/dataExplorer/context/groupKeys'
import {ColumnsProvider} from 'src/dataExplorer/context/columns'

// Utils
import {getOrg} from 'src/organizations/selectors'

// Types
import {QueryScope} from 'src/shared/contexts/query'

// Style
import './Sidebar.scss'

const ResultOptions: FC = () => {
  const org = useSelector(getOrg)
  const scope = {
    org: org.id,
    region: window.location.origin,
  } as QueryScope

  return (
    <GroupKeysProvider scope={scope}>
      <ColumnsProvider scope={scope}>
        <Accordion className="result-options" expanded={true}>
          <Accordion.AccordionHeader className="result-options--header">
            Result Options
          </Accordion.AccordionHeader>
          <FieldsAsColumns />
          <GroupBy />
          <AggregateWindow />
        </Accordion>
      </ColumnsProvider>
    </GroupKeysProvider>
  )
}

export {ResultOptions}
