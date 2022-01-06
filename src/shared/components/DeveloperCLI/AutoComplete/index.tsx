import React, {FC, useCallback, useContext, useEffect} from 'react'
import {DeveloperCLIContext} from '../context'
import DeveloperCLIAutoCompleteItem from './Item'

const DeveloperCLIAutoComplete: FC = () => {
  const {items, selected, setSelected, setSearchTerm} = useContext(
    DeveloperCLIContext
  )

  const shortcutzListener = useCallback(
    e => {
      let newSelected = null
      if (e.keyCode !== 38 && e.keyCode !== 40 && e.keyCode !== 9) {
        return
      }

      e.preventDefault()

      if (e.keyCode === 9 && selected !== null) {
        setSearchTerm(items[selected].title)
      } else if (e.keyCode && items.length === 1) {
        setSearchTerm(items[0].title)
      }

      if (e.keyCode === 38) {
        // Up Arrow
        if (!selected) {
          if (items.length) {
            newSelected = items.length - 1
          }
        } else if (selected > 0) {
          newSelected = selected - 1
        }
      } else if (e.keyCode === 40) {
        // Down Arrow
        if (selected === null) {
          if (items.length) {
            newSelected = 0
          }
        } else if (selected === items.length - 1) {
          newSelected = 0
        } else {
          newSelected = selected + 1
        }
      }

      setSelected(newSelected)
    },
    [selected, items, setSelected]
  )

  useEffect(() => {
    window.addEventListener('keydown', shortcutzListener, true)

    return () => {
      window.removeEventListener('keydown', shortcutzListener, true)
    }
  }, [items, selected, shortcutzListener])
  return (
    <div className="developer-cli-ac">
      {items.map((item, i) => (
        <DeveloperCLIAutoCompleteItem
          key={i}
          item={item}
          selected={selected === i}
        />
      ))}
    </div>
  )
}

export default DeveloperCLIAutoComplete
