// Libraries
import React, {FC} from 'react'

// Components
import {Icon} from '@influxdata/clockface'

interface Props {
  active: string
  text: string
  type: string
  icon: string
  setFormActive: (any) => void
}

const ProgressMenuItem: FC<Props> = ({
  active,
  setFormActive,
  text,
  type,
  icon,
}) => (
  <div
    className={
      active === type
        ? 'create-subscription-page__progress__bar__wrap--selected'
        : 'create-subscription-page__progress__bar__wrap'
    }
  >
    <button
      className="create-subscription-page__progress__bar__wrap__btn"
      onClick={() => setFormActive(type)}
    >
      <Icon
        className={active === type ? 'cf-icon--selected' : 'cf-icon'}
        glyph={icon}
      />
      <div className={active === type ? 'title--selected' : 'title'}>
        {text}
      </div>
    </button>
  </div>
)

export default ProgressMenuItem
