import React, {FC, useContext, useMemo} from 'react'

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
import {PersistanceContext} from 'src/dataExplorer/context/persistance'

const FLUX_SYNC_TOOLTIP = `Flux Sync autopopulates the script editor to help you \
start a query. You can turn this feature on and off, but typing within this \
section will disable synchronization.`

const FLUX_SYNC_DISABLE_TEXT = `Schema Sync is no longer available because the \
code block has been edited.`

const SchemaBrowserHeading: FC = () => {
  const {fluxSync, toggleFluxSync} = useContext(FluxQueryBuilderContext)
  const {selection} = useContext(PersistanceContext)

  const disableToggle: boolean = selection.composition?.diverged

  const handleFluxSyncToggle = () => {
    toggleFluxSync(!fluxSync)
  }

  return useMemo(
    () => (
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
            disabled={disableToggle}
            tooltipText={disableToggle ? FLUX_SYNC_DISABLE_TEXT : ''}
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
    ),
    [fluxSync, toggleFluxSync]
  )
}

export default SchemaBrowserHeading
