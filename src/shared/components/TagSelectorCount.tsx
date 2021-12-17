import React, {FC} from 'react'
import './TagSelectorCount.scss'

interface OwnProps {
  count: number
}

const TagSelectorCount: FC<OwnProps> = ({count}) => {
  const pluralizer = count <= 1 ? '' : 's'

  return (
    <div
      className="tag-selector-count"
      title={`${count} value${pluralizer} selected`}
    >
      {count}
    </div>
  )
}

export default TagSelectorCount
