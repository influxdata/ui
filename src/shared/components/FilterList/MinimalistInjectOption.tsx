// Libraries
import React, {FC, createRef} from 'react'

// Component
import {
  Appearance,
  ComponentSize,
  Popover,
  PopoverPosition,
  PopoverInteraction,
  TextBlock,
} from '@influxdata/clockface'
import './MinimalistInjectionOption.scss'

type OptionType = Record<string, any>

interface Props {
  option: OptionType
  extractor: (func: OptionType) => string
  onClick: (func: OptionType) => void
  testID?: string
  ToolTipContent?: (props: {item: any; searchTerm?: string}) => JSX.Element
  searchTerm?: string
}

const InjectionOption: FC<Props> = ({
  option,
  extractor,
  onClick,
  testID = 'injection-option',
  ToolTipContent,
  searchTerm,
}) => {
  const itemRef = createRef<HTMLDListElement>()
  const handleClick = () => {
    onClick(option)
  }

  return (
    <>
      {!!ToolTipContent && (
        <Popover
          appearance={Appearance.Outline}
          enableDefaultStyles={false}
          position={PopoverPosition.ToTheLeft}
          triggerRef={itemRef}
          showEvent={PopoverInteraction.Hover}
          hideEvent={PopoverInteraction.Hover}
          distanceFromTrigger={8}
          testID="toolbar-popover"
          contents={() => (
            <ToolTipContent item={option} searchTerm={searchTerm} />
          )}
        />
      )}
      <dd
        ref={itemRef}
        data-testid={`flux--${testID}`}
        className="flux-toolbar--minimal-list-item"
        onClick={handleClick}
      >
        <TextBlock
          testID={`flux--${testID}--inject`}
          text={extractor(option)}
          size={ComponentSize.ExtraSmall}
        />
      </dd>
    </>
  )
}

export default InjectionOption
