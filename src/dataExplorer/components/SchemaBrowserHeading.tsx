import React, {FC, useContext} from 'react'

// Components
import {
  FlexBox,
  InputLabel,
  SlideToggle,
  JustifyContent,
  IconFont,
} from '@influxdata/clockface'
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'

// Context
import {FluxQueryBuilderContext} from 'src/dataExplorer/context/fluxQueryBuilder'

const FLUX_SYNC_TOOLTIP = `Flux Sync autopopulates the script editor to help you \
start a query. You can turn this feature on and off, but typing within this \
section will disable synchronization.`

const SchemaBrowserHeading: FC = () => {
  const {fluxSync, toggleFluxSync} = useContext(FluxQueryBuilderContext)

  const handleFluxSyncToggle = () => {
    toggleFluxSync()
  }

  return (
    <FlexBox
      className="schema-browser-heading"
      justifyContent={JustifyContent.SpaceBetween}
    >
      <div className="schema-browser-heading--text">Schema Browser</div>
      <FlexBox className="flux-sync">
        <SlideToggle
          className="flux-sync--toggle"
          active={fluxSync}
          onChange={handleFluxSyncToggle}
          testID="flux-sync--toggle"
        />
        <InputLabel className="flux-sync--label">
          <SelectorTitle
            title="Flux Sync"
            info={FLUX_SYNC_TOOLTIP}
            icon={IconFont.Switch_New}
          />
        </InputLabel>
      </FlexBox>
    </FlexBox>
  )
}

export default SchemaBrowserHeading
