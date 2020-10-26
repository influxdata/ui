// Libraries
import React, {FC, ReactNode} from 'react'
import {useSelector} from 'react-redux'
import classnames from 'classnames'

// Selectors
import {getPresentationMode} from 'src/shared/selectors/app'

// Components
import {FlexBox, FlexBoxProps, Omit} from '@influxdata/clockface'

// Styles
import 'src/shared/components/toolbar/Toolbar.scss'

interface Props
  extends Omit<
    FlexBoxProps,
    'style' | 'id' | 'stretchToFitWidth' | 'stretchToFitHeight'
  > {
  children: ReactNode
}

const Toolbar: FC<Props> = ({
  children,
  testID = 'toolbar',
  direction,
  alignItems,
  justifyContent,
  margin,
}) => {
  const isInPresentationMode = useSelector(getPresentationMode)

  const toolbarClassName = classnames('toolbar', {
    'toolbar__presentation-mode': isInPresentationMode,
  })

  return (
    <div className={toolbarClassName} data-testid={testID}>
      <FlexBox
        className="toolbar-contents"
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
