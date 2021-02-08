// Libraries
import React, {FC, MouseEvent, useContext, useCallback} from 'react'

// Components
import {List, Gradients} from '@influxdata/clockface'
import {PipeContext} from 'src/flows/context/pipe'
import {SchemaContext} from 'src/flows/context/schemaProvider'

// Utils
import {event as reportEvent} from 'src/cloud/utils/reporting'

type Props = {
  tags: any[]
}

const TagSelectors: FC<Props> = ({tags}) => {
  const {data, update} = useContext(PipeContext)
  const {searchTerm} = useContext(SchemaContext)
  const selectedTags = data?.tags

  const selectEventText = 'Selecting Tag in Flow Query Builder'
  const deselectEventText = 'Deselecting Tag in Flow Query Builder'

  const handleSublistMultiSelect = useCallback(
    (tagName: string, tagValue: string): void => {
      let tagValues = []
      if (!selectedTags[tagName]) {
        tagValues = [tagValue]
      } else if (
        selectedTags[tagName] &&
        selectedTags[tagName].includes(tagValue)
      ) {
        tagValues = selectedTags[tagName].filter(v => v !== tagValue)
      } else {
        tagValues = [...selectedTags[tagName], tagValue]
      }

      const updatedTags = {
        ...selectedTags,
        [tagName]: tagValues,
      }

      if (tagValues.length < selectedTags[tagName]?.length) {
        reportEvent('metric_selector_add_filter')
        reportEvent(deselectEventText, {
          type: 'multi-select',
          tags: JSON.stringify(updatedTags),
        })
      } else {
        reportEvent('metric_selector_remove_filter')
        reportEvent(selectEventText, {
          type: 'multi-select',
          tags: JSON.stringify(updatedTags),
        })
      }
      update({
        tags: updatedTags,
      })
    },
    [update]
  )

  const handleSubListItemClick = useCallback(
    (event: MouseEvent, tagName: string, tagValue: string) => {
      if (event.metaKey || event.ctrlKey) {
        handleSublistMultiSelect(tagName, tagValue)
        return
      }
      let updatedValue = [tagValue]
      let updatedTags = {
        [tagName]: updatedValue,
      }
      if (selectedTags[tagName]?.includes(tagValue)) {
        updatedValue = []
        updatedTags[tagName] = updatedValue
      }
      if (tagName in selectedTags && updatedValue.length === 0) {
        reportEvent(deselectEventText, {
          type: 'single-select',
        })
        updatedTags = {}
      } else {
        reportEvent(selectEventText, {
          type: 'single-select',
          tags: JSON.stringify(updatedTags),
        })
      }
      update({
        tags: updatedTags,
      })
    },
    [update]
  )

  return (
    <>
      {tags.map(tag => {
        return (
          <React.Fragment key={JSON.stringify(tag)}>
            {Object.entries(tag).map(([tagName, tagValues]) => {
              const values = tagValues as any[]
              return (
                <React.Fragment key={tagName}>
                  {values
                    .filter(
                      tagValue =>
                        tagName
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        tagValue
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                    )
                    .map(tagValue => (
                      <List.Item
                        key={tagValue}
                        value={tagValue}
                        onClick={(value: string, event) => {
                          handleSubListItemClick(
                            event as MouseEvent,
                            tagName,
                            value
                          )
                        }}
                        selected={selectedTags[tagName]?.includes(tagValue)}
                        title={tagValue}
                        gradient={Gradients.GundamPilot}
                        wrapText={true}
                      >
                        <List.Indicator type="dot" />
                        <div className="selectors--item-value selectors--item__tag">{`${tagName} = ${tagValue}`}</div>
                        <div className="selectors--item-name">tag</div>
                      </List.Item>
                    ))}
                </React.Fragment>
              )
            })}
          </React.Fragment>
        )
      })}
    </>
  )
}

export default TagSelectors
