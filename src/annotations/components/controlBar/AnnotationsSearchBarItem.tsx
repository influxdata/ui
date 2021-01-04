// Libraries
import React, {FC} from 'react'

// Components
import {List, Bullet} from '@influxdata/clockface'

interface Props {
  id: string
  name: string
  description?: string
  color: string
  onClick: (id: string) => void
}

export const AnnotationsSearchBarItem: FC<Props> = ({
  id,
  name,
  description,
  color,
  onClick,
}) => {
  return (
    <List.Item
      key={name}
      value={id}
      onClick={onClick}
      className="annotations-searchbar--item"
      testID={`annotations-suggestion ${id}`}
    >
      <Bullet
        backgroundColor={color}
        className="annotations-searchbar--swatch"
      />
      <div className="annotations-searchbar--item-details">
        <span className="annotations-searchbar--item-name">{name}</span>
        {description && (
          <span className="annotations-searchbar--item-desc">
            {description}
          </span>
        )}
      </div>
    </List.Item>
  )
}
