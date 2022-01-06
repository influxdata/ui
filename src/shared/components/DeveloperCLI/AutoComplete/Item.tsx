import React, {FC, useCallback, useEffect} from 'react'
import {DeveloperCLIAutoCompleteItem} from '../context'

interface OwnProps {
  item: DeveloperCLIAutoCompleteItem
  selected?: boolean
}

const DeveloperCLIAutoCompleteItem: FC<OwnProps> = ({item, selected}) => {
  const enterListener = useCallback(
    e => {
      if (e.keyCode === 13) {
        item.cbClick()
      }
    },
    [item]
  )

  useEffect(() => {
    if (!selected) {
      return
    }

    window.addEventListener('keydown', enterListener, true)

    return () => {
      window.removeEventListener('keydown', enterListener, true)
    }
  }, [selected, enterListener])

  return (
    <div
      id={item.id}
      className={`developer-cli-ac-item ${selected ? 'Selected' : ''}`}
      onClick={item.cbClick ?? undefined}
    >
      {item.title}
    </div>
  )
}

export default DeveloperCLIAutoCompleteItem
