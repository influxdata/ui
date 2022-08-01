// Libraries
import React, {FC, useContext} from 'react'

// Components
import {SquareButton, IconFont} from '@influxdata/clockface'

// Actions
import {AppSettingContext} from 'src/shared/contexts/app'

const PresentationModeToggle: FC = () => {
  const {setPresentationMode} = useContext(AppSettingContext)

  return (
    <SquareButton
      icon={IconFont.ExpandB}
      testID="presentation-mode-toggle"
      onClick={() => setPresentationMode(true)}
    />
  )
}

export default PresentationModeToggle
