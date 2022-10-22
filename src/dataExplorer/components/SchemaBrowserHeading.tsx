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
import {PersistanceContext} from 'src/dataExplorer/context/persistance'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {LanguageType} from 'src/dataExplorer/components/resources'

const FLUX_SYNC_DISABLE_TEXT = `Schema Sync is no longer available because the \
code block has been edited.`

const SchemaBrowserHeading: FC = () => {
  const {fluxSync, toggleFluxSync} = useContext(FluxQueryBuilderContext)
  const {resource, selection} = useContext(PersistanceContext)

  // Disable means diverged, used to not allow turning on or off the toggle
  const disableToggle: boolean = selection.composition?.diverged
  const disableTooltipText = disableToggle ? FLUX_SYNC_DISABLE_TEXT : ''

  const handleFluxSyncToggle = () => {
    event('Toggled Flux Sync in schema browser', {active: `${!fluxSync}`})
    toggleFluxSync(!fluxSync)
  }

  const tooltipContents = (
    <div>
      <span>
        Flux Sync autopopulates the script editor to help you start a query.
      </span>
      <br />
      <br />
      <span>
        You can turn this feature on and off, but typing within this section
        will disable synchronization.
      </span>
    </div>
  )

  if (!isFlagEnabled('schemaComposition')) {
    return null
  }

  if (resource?.language === LanguageType.SQL) {
    return null
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
          disabled={disableToggle}
          tooltipText={disableTooltipText}
        />
        <InputLabel className="flux-sync--label">
          <div
            className={`${disableToggle ? 'disabled' : ''}`}
            title={disableTooltipText}
          >
            <SelectorTitle
              label="Flux Sync"
              tooltipContents={tooltipContents}
              icon={IconFont.Sync}
            />
          </div>
        </InputLabel>
      </FlexBox>
    </FlexBox>
  )
}

export default SchemaBrowserHeading
