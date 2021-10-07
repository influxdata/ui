// Libraries
import React, {FC} from 'react'

interface Props {
  childrenLeft?: JSX.Element[] | JSX.Element
  childrenRight?: JSX.Element[] | JSX.Element
  width?: number
}

const TabbedPageHeader: FC<Props> = ({childrenLeft, childrenRight, width}) => {
  let leftHeader = <></>
  let rightHeader = <></>

  if (childrenLeft) {
    leftHeader = <div className="tabbed-page--header-left">{childrenLeft}</div>
  }

  if (childrenRight) {
    rightHeader = (
      <div className="tabbed-page--header-right">{childrenRight}</div>
    )
  }

  if (width) {
    return (
      <div
        className="tabbed-page--header"
        data-testid="tabbed-page--header"
        style={{width}}
      >
        {leftHeader}
        {rightHeader}
      </div>
    )
  }

  return (
    <div className="tabbed-page--header" data-testid="tabbed-page--header">
      {leftHeader}
      {rightHeader}
    </div>
  )
}

export default TabbedPageHeader
