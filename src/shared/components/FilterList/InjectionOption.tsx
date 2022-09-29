// Libraries
import React, {FC, createRef, useContext} from 'react'
import {useRouteMatch} from 'react-router-dom'

// Component
import {
  Popover,
  PopoverPosition,
  PopoverInteraction,
  Appearance,
  Button,
  ComponentSize,
  ComponentColor,
} from '@influxdata/clockface'
import {AppSettingContext} from 'src/shared/contexts/app'

type OptionType = Record<string, any>

interface Props {
  option: OptionType
  extractor: (func: OptionType) => string
  onClick: (func: OptionType) => void
  testID: string
  ToolTipContent?: (props: {
    item: any
    searchTerm?: string
    setToolTipPopup?: (boolean: boolean) => void
    setHoverdFunction?: any
  }) => JSX.Element
  searchTerm?: string
  setToolTipPopup?: (boolean: boolean) => void
  setHoverdFunction?: (string: string) => void
}

const FluxInjectionOption: FC<Props> = ({
  option,
  extractor,
  onClick,
  testID = 'flux-injection-option',
  ToolTipContent,
  searchTerm,
  setToolTipPopup,
  setHoverdFunction,
}) => {
  // TODO: move this to a flag once design wants to branch it out further
  const {fluxQueryBuilder} = useContext(AppSettingContext)
  const {path} = useRouteMatch()
  const useNewStyling =
    fluxQueryBuilder && path === '/orgs/:orgID/data-explorer'
  const itemRef = createRef<HTMLDListElement>()
  const handleClick = () => {
    onClick(option)
  }

  const fullClick = () => {
    if (!useNewStyling) {
      return
    }
    onClick(option)
  }

  const classer = [
    ['flux-toolbar--list-item', true],
    ['flux-toolbar--function', true],
    ['flux-toolbar--new-style', useNewStyling],
  ]
    .filter(c => c[1])
    .map(c => c[0])
    .join(' ')

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
          distanceFromTrigger={4}
          testID="toolbar-popover"
          contents={() => (
            <ToolTipContent
              item={option}
              searchTerm={searchTerm}
              setToolTipPopup={setToolTipPopup}
              setHoverdFunction={setHoverdFunction}
            />
          )}
        />
      )}
      <dd
        ref={itemRef}
        data-testid={`flux--${testID}`}
        className={classer}
        onClick={fullClick}
      >
        <code>{extractor(option)}</code>
        {!useNewStyling && (
          <Button
            testID={`flux--${testID}--inject`}
            text="Inject"
            onClick={handleClick}
            size={ComponentSize.ExtraSmall}
            className="flux-toolbar--injector"
            color={ComponentColor.Primary}
          />
        )}
      </dd>
    </>
  )
}

export default FluxInjectionOption
