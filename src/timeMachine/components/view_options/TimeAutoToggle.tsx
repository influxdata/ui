import React, {FC, useState} from 'react'
import {useSelector} from 'react-redux'
import {SlideToggle, ComponentSize} from '@influxdata/clockface'

import {getVisTable} from 'src/timeMachine/selectors'

import {useVisXDomainSettings} from 'src/shared/utils/useVisDomainSettings'

interface Props {
  setDomain: (xDomain: [number, number]) => void
  xDom: number[] | null
}

const isValidXDomain = xDomain => {
  return (
    xDomain &&
    xDomain.length === 2 &&
    typeof xDomain[0] === 'number' &&
    typeof xDomain[1] === 'number'
  )
}

export const TimeDomainAutoToggle: FC<Props> = ({setDomain, xDom}) => {
  const [isActive, setIsActive] = useState<boolean>(false)

  const {table} = useSelector(getVisTable)

  const [xDomain] = useVisXDomainSettings(
    xDom,
    table.getColumn('_time', 'number')
  )

  const toggleActiveDomain = (): void => {
    if (!isActive) {
      setDomain([xDomain[0], xDomain[1]])
    } else {
      setDomain(null)
    }
    setIsActive(!isActive)
  }
  return (
    <div data-testid="time-domain-toggle">
      <SlideToggle
        size={ComponentSize.ExtraSmall}
        active={isActive}
        onChange={toggleActiveDomain}
        disabled={!isValidXDomain(xDomain)}
        testID="time-domain-toggle-slide"
      />
    </div>
  )
}
