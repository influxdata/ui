import React, {FC, useState} from 'react'
import {useSelector} from 'react-redux'
import {SlideToggle, ComponentSize} from '@influxdata/clockface'

import {getXColumnTimeDomainBounds} from 'src/timeMachine/selectors'

interface Props {
  onSetDomain: (xDomain: [number, number]) => void
}

const TimeDomainAutoToggle: FC<Props> = ({onSetDomain}) => {
  const [isActive, setIsActive] = useState<boolean>(false)

  const timeDomain = useSelector(getXColumnTimeDomainBounds)

  const handleClick = (): void => {
    if (!isActive) {
      onSetDomain([timeDomain[0], timeDomain[1]])
    } else {
      onSetDomain(null)
    }
    setIsActive(!isActive)
  }
  return (
    <div data-testid="time-domain-toggle">
      <SlideToggle
        style={{height: 'auto'}}
        size={ComponentSize.ExtraSmall}
        active={isActive}
        onChange={handleClick}
        disabled={!timeDomain}
        testID="time-domain-toggle-slide"
      />
    </div>
  )
}

export default TimeDomainAutoToggle
