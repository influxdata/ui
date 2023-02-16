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
  const {compositionSync, toggleCompositionSync} = useContext(
    ScriptQueryBuilderContext
  )
  const {resource} = useContext(PersistanceContext)

  const handleCompositionSyncToggle = () => {
    // Note: kept same event naming, so can compare across time. (Even though is Flux and SQL sync.)
    event('Toggled Flux Sync in schema browser', {
      active: `${!compositionSync}`,
    })
    toggleCompositionSync(!compositionSync)
  }

  const tooltipContents = (
    <div>
      <span>
        Sync autopopulates the script editor to help you start a query.
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

  let label: string = 'Flux Sync'
  switch (resource?.language) {
    case LanguageType.SQL:
      label = 'SQL Sync'
      break
    case LanguageType.INFLUXQL:
      label = 'InfluxQL Sync'
      break
  }

  return (
    <FlexBox
      className="schema-browser-heading"
      justifyContent={JustifyContent.SpaceBetween}
    >
      <div className="schema-browser-heading--text">Schema Browser</div>
      <FlexBox className="editor-sync">
        <SlideToggle
          className="editor-sync--toggle"
          active={compositionSync}
          onChange={handleCompositionSyncToggle}
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
