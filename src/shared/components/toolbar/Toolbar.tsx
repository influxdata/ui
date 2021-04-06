// Libraries
import React, {FC, ReactNode, useContext} from 'react'
import classnames from 'classnames'

// Components
import {FlexBox, FlexBoxProps, Omit} from '@influxdata/clockface'

import {AppSettingContext} from 'src/shared/contexts/app'

// Styles
import 'src/shared/components/toolbar/Toolbar.scss'

interface Props
  extends Omit<FlexBoxProps, 'stretchToFitWidth' | 'stretchToFitHeight'> {
  children: ReactNode
}

const Toolbar: FC<Props> = ({
  children,
  className,
  testID = 'toolbar',
  direction,
  alignItems,
  justifyContent,
  margin,
  style,
  id = 'toolbar',
}) => {
  const {presentationMode} = useContext(AppSettingContext)

  const toolbarClassName = classnames('toolbar', {
    [`${className}`]: className,
    'toolbar__presentation-mode': presentationMode,
  })

  return (
    <div
      className={toolbarClassName}
      data-testid={testID}
      style={style}
      id={id}
    >
      <FlexBox
        className="toolbar--contents"
        direction={direction}
        alignItems={alignItems}
        justifyContent={justifyContent}
        margin={margin}
        stretchToFitWidth={true}
      >
        {children}
      </FlexBox>
    </div>
  )
}

export default Toolbar
