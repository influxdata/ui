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
import {ScriptQueryBuilderContext} from 'src/dataExplorer/context/scriptQueryBuilder'
import {PersistanceContext} from 'src/dataExplorer/context/persistance'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {LanguageType} from 'src/dataExplorer/components/resources'

const SchemaBrowserHeading: FC = () => {
  const {fluxSync, toggleFluxSync} = useContext(ScriptQueryBuilderContext)
  const {resource} = useContext(PersistanceContext)

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

  const label =
    resource?.language === LanguageType.SQL ? 'SQL Sync' : 'Flux Sync'

  return (
    <FlexBox
      className="schema-browser-heading"
      justifyContent={JustifyContent.SpaceBetween}
    >
      <div className="schema-browser-heading--text">Schema Browser</div>
      <FlexBox className="editor-sync">
        <SlideToggle
          className="editor-sync--toggle"
          active={fluxSync}
          onChange={handleFluxSyncToggle}
          testID="editor-sync--toggle"
        />
        <InputLabel className="editor-sync--label">
          <SelectorTitle
            label={label}
            tooltipContents={tooltipContents}
            icon={IconFont.Sync}
          />
        </InputLabel>
      </FlexBox>
    </FlexBox>
  )
}

export default SchemaBrowserHeading
