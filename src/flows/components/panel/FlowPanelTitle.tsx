// Libraries
import React, {FC, ChangeEvent, useContext} from 'react'
import {FlowContext} from 'src/flows/context/flow.current'

interface Props {
  id: string
}

const FlowPanelTitle: FC<Props> = ({id}) => {
  const {flow} = useContext(FlowContext)
  const title = flow.meta.get(id).title
  const onTitleChange = (value: string) => {
    flow.meta.update(id, {
      title: value,
    })
  }

  let sourceName
  let titleElement = <div className="flow-panel--title">{title}</div>

  const onChange = (e: ChangeEvent<HTMLInputElement>): void => {
    onTitleChange(e.target.value)
  }

  titleElement = (
    <input
      type="text"
      value={title}
      onChange={onChange}
      placeholder="Enter an ID"
      className="flow-panel--editable-title"
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      maxLength={30}
    />
  )

  return (
    <>
      {sourceName}
      {titleElement}
    </>
  )
}

export default FlowPanelTitle
