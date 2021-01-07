import React, {FC, useState} from 'react'
import {useSelector} from 'react-redux'
import {SlideToggle, ComponentSize} from '@influxdata/clockface'

import {getXColumnTimeDomainBounds} from 'src/timeMachine/selectors'

interface Props {
  onSetDomain: (xDomain: [number, number]) => void
}
const TimeDomainAutoToggle: FC<Props> = ({onSetDomain}) => {
  const [isActive, setIsActive] = useState<boolean>(false)

  const [start, end] = useSelector(getXColumnTimeDomainBounds)

  const handleClick = (): void => {
    if (!isActive) {
      onSetDomain([start, end])
    } else {
      onSetDomain(null)
    }
    setIsActive(!isActive)
  }
  return (
    <>
      <SlideToggle
        style={{height: 'auto'}}
        size={ComponentSize.ExtraSmall}
        active={isActive}
        onChange={handleClick}
      />
    </>
  )
}

export default TimeDomainAutoToggle
