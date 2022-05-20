import React, {FC, useContext} from 'react'

// Components
import {Accordion} from '@influxdata/clockface'
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'

// Contexts
import {NewDataExplorerContext} from 'src/dataExplorer/context/newDataExplorer'
import WaitingText from 'src/shared/components/WaitingText'

// Types
import {RemoteDataState} from 'src/types'

// Syles
import './Schema.scss'

const FieldSelector: FC = () => {
  const {fields, loadingFields} = useContext(NewDataExplorerContext)

  let list: JSX.Element | JSX.Element[] = (
    <div className="field-selector--list-item">No Fields Found</div>
  )

  if (loadingFields === RemoteDataState.Error) {
    list = (
      <div className="field-selector--list-item">Failed to load fields</div>
    )
  } else if (
    loadingFields === RemoteDataState.Loading ||
    loadingFields === RemoteDataState.NotStarted
  ) {
    list = <WaitingText text="Loading fields" />
  } else if (loadingFields === RemoteDataState.Done && fields.length) {
    list = fields.map(field => (
      <div key={field} className="field-selector--list-item">
        {field}
      </div>
    ))
    // TODO: check length of fields to load more
    // list.push(
    //   <div key="load-more" className="field-selector--list-item">
    //     Load More
    //   </div>
    // )
  }

  return (
    <Accordion className="field-selector" expanded={true}>
      <Accordion.AccordionHeader className="field-selector--header">
        <SelectorTitle title="Fields" info="Test info" />
      </Accordion.AccordionHeader>
      <div className="container-side-bar">{list}</div>
    </Accordion>
  )
}

export default FieldSelector
