import React, {FC, useState} from 'react'
import {SlideToggle, ComponentSize} from '@influxdata/clockface'
import {useVisXDomainSettings} from 'src/visualization/utils/useVisDomainSettings'
import {Table} from '@influxdata/giraffe'
interface Props {
  setDomain: (axis: string, xDomain: [number, number]) => void
  xDomain: number[] | null
  table: Table
}
const isValidXDomain = xDomain => {
  return (
    xDomain &&
    xDomain.length === 2 &&
    typeof xDomain[0] === 'number' &&
    typeof xDomain[1] === 'number'
  )
}
export const TimeDomainAutoToggle: FC<Props> = ({
  setDomain,
  xDomain,
  table,
}) => {
  const [isActive, setIsActive] = useState<boolean>(false)
  const [xDom] = useVisXDomainSettings(
    xDomain,
    table.getColumn('_time', 'number')
  )
  const toggleActiveDomain = (): void => {
    if (!isActive) {
      setDomain('x', xDom)
    } else {
      setDomain('x', [null, null])
    }
    setIsActive(!isActive)
  }
  return (
    <div data-testid="time-domain-toggle">
      <SlideToggle
        size={ComponentSize.ExtraSmall}
        active={isActive}
        onChange={toggleActiveDomain}
        disabled={!isValidXDomain(xDom)}
        testID="time-domain-toggle-slide"
      />
    </div>
  )
}
