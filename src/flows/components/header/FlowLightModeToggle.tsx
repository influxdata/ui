import React, {FC, useCallback, useContext} from 'react'
import {FlowContext} from 'src/flows/context/flow.current'

// Components
import {SelectGroup, ButtonShape, Icon, IconFont} from '@influxdata/clockface'
import {AppSettingContext} from 'src/shared/contexts/app'

// Utils
import {event} from 'src/cloud/utils/reporting'

// Types
import {Theme} from 'src/types'

const FlowLightModeToggle: FC = () => {
  const {flow, updateOther} = useContext(FlowContext)
  const {setTheme} = useContext(AppSettingContext)

  const updateTheme = useCallback(
    (theme: Theme) => {
      event('update_notebook_theme', {
        theme,
      })
      updateOther({theme})
      setTheme(theme)
    },
    [setTheme, updateOther]
  )

  return (
    <SelectGroup
      testID="presentation-mode-toggle-group"
      shape={ButtonShape.Square}
    >
      <SelectGroup.Option
        onClick={() => updateTheme('dark')}
        value={false}
        id="presentation-mode-toggle--dark"
        active={!flow?.theme || flow.theme === 'dark'}
        titleText="Dark Mode"
        style={{display: 'flex'}}
      >
        <Icon glyph={IconFont.Darkmode_New} />
      </SelectGroup.Option>
      <SelectGroup.Option
        onClick={() => updateTheme('light')}
        id="presentation-mode-toggle--light"
        value={true}
        active={flow.theme === 'light'}
        titleText="Light Mode"
        style={{display: 'flex'}}
      >
        <Icon glyph={IconFont.Lightmode_New} />
      </SelectGroup.Option>
    </SelectGroup>
  )
}

export default FlowLightModeToggle
