// Libraries
import React, {FC} from 'react'
import {nanoid} from 'nanoid'

// Components
import {Row} from 'src/shared/components/Row'

interface Item {
  text?: string
  name?: string
}

interface RowsProps {
  tags: Item[]
  confirmText?: string
  onDeleteTag?: (item: Item) => void
  onChange?: (index: number, value: string) => void
}

export const Rows: FC<RowsProps> = ({tags, onDeleteTag, onChange}) => {
  return (
    <div className="input-tag-list" data-testid="multiple-rows">
      {tags.map(item => {
        return (
          <Row
            index={tags.indexOf(item)}
            key={nanoid()}
            item={item}
            onDelete={onDeleteTag}
            onChange={onChange}
          />
        )
      })}
    </div>
  )
}
