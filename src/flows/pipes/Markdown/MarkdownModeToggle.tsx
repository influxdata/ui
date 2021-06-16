// Libraries
import React, {FC, useContext} from 'react'

// Components
import {SelectGroup} from '@influxdata/clockface'
import {PipeContext} from 'src/flows/context/pipe'

const MarkdownModeToggle: FC = () => {
  const {data, update} = useContext(PipeContext)

  return (
    <SelectGroup>
      <SelectGroup.Option
        active={data.mode === 'edit'}
        onClick={() => update({mode: 'edit'})}
        value="edit"
        id="edit"
      >
        Edit
      </SelectGroup.Option>
      <SelectGroup.Option
        active={data.mode === 'preview'}
        onClick={() => update({mode: 'preview'})}
        value="preview"
        id="preview"
      >
        Preview
      </SelectGroup.Option>
    </SelectGroup>
  )
}

export default MarkdownModeToggle
