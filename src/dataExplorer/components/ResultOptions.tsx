import React, {FC} from 'react'
import {useSelector} from 'react-redux'

// Components
import {Accordion} from '@influxdata/clockface'
import {FieldsAsColumns} from 'src/dataExplorer/components/FieldsAsColumns'
import {GroupBy} from 'src/dataExplorer/components/GroupBy'
import {Aggregate} from 'src/dataExplorer/components/Aggregate'

// Context
import {FieldsProvider} from 'src/dataExplorer/context/fields'
import {TagsProvider} from 'src/dataExplorer/context/tags'
import {GroupKeysProvider} from 'src/dataExplorer/context/groupKeys'

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
      <Accordion className="result-options" expanded={true}>
        <Accordion.AccordionHeader className="result-options--header">
          Result Options
        </Accordion.AccordionHeader>
        <FieldsAsColumns />
        <GroupBy />
        <Aggregate />
      </Accordion>
    </GroupKeysProvider>
  )
}

export {ResultOptions}
