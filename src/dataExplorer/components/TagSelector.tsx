import React, {FC, useContext} from 'react'

// Components
import {Accordion} from '@influxdata/clockface'
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'
import WaitingText from 'src/shared/components/WaitingText'

// Contexts
import {
  NewDataExplorerContext,
  Tag,
} from 'src/dataExplorer/context/newDataExplorer'

// Types
import {RemoteDataState} from 'src/types'

interface Prop {
  tag: Tag
  onSelect: (value: string) => void
}

const TagValues: FC<Prop> = ({tag, onSelect}) => {
  return (
    <Accordion className="tag-selector-value">
      <Accordion.AccordionHeader className="tag-selector-value--header">
        <SelectorTitle title={tag.key} />
      </Accordion.AccordionHeader>
      <div className="container-side-bar">
        {tag.values.map(value => (
          <div
            className="tag-selector-value--list-item"
            key={value}
            onClick={() => onSelect(value)}
          >
            {value}
          </div>
        ))}
      </div>
    </Accordion>
  )
}

const TagSelector: FC = () => {
  const {tags, loadingTags} = useContext(NewDataExplorerContext)

  const handleSelect = (value: string) => {
    // TODO
    /* eslint-disable no-console */
    console.log(value)
    /* eslint-disable no-console */
  }

  let list: JSX.Element | JSX.Element[] = (
    <div className="tag-selector-key--list-item">No Tags Found</div>
  )

  if (loadingTags === RemoteDataState.Error) {
    list = (
      <div className="tag-selector-key--list-item">Failed to load tags</div>
    )
  } else if (
    loadingTags === RemoteDataState.Loading ||
    loadingTags === RemoteDataState.NotStarted
  ) {
    list = <WaitingText text="Loading tags" />
  } else if (loadingTags === RemoteDataState.Done && tags.length) {
    list = tags.map(tag => (
      <div key={tag.key} className="tag-selector-key--list-item">
        <TagValues tag={tag} onSelect={handleSelect} />
      </div>
    ))
    // TODO: check length of tags to load more
    // list.push(
    //   <div key="load-more" className="tag-selector-key--list-item">
    //     Load More
    //   </div>
    // )
  }

  return (
    <Accordion className="tag-selector-key" expanded={true}>
      <Accordion.AccordionHeader className="tag-selector-key--header">
        <SelectorTitle title="Tag Keys" info="Test info" />
      </Accordion.AccordionHeader>
      <div className="container-side-bar">{list}</div>
    </Accordion>
  )
}

export default TagSelector
