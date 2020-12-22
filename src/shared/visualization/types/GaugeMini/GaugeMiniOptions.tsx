// Libraries
import React, {PureComponent} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {
  Button,
  ButtonShape,
  FormElement,
  Grid,
  Input,
  InputType,
  MultiSelectDropdown,
  SelectDropdown,
} from '@influxdata/clockface'
const {Row, Column} = Grid

// Actions
import {setColors} from 'src/timeMachine/actions'

// Types
import {AppState, ViewType} from 'src/types'
import {DecimalPlaces} from 'src/types/dashboards'
import {Color} from 'src/types/colors'

import ColorDropdown from 'src/shared/components/ColorDropdown'
import {
  DEFAULT_GAUGE_COLORS,
  THRESHOLD_COLORS,
} from 'src/shared/constants/thresholds'
import ThresholdsSettings from 'src/shared/components/ThresholdsSettings'
import {GaugeMiniLayerConfig} from '@influxdata/giraffe'
import {
  GAUGE_MINI_THEME_BULLET_DARK,
  GAUGE_MINI_THEME_PROGRESS_DARK,
} from 'src/shared/constants/gaugeMiniSpecs'
import {getGroupableColumns} from 'src/timeMachine/selectors'
import {ComponentStatus} from 'src/clockface'

type ThemeString =
  | 'GAUGE_MINI_THEME_BULLET_DARK'
  | 'GAUGE_MINI_THEME_PROGRESS_DARK'

interface OwnProps {
  defaultTheme: ThemeString
  type: ViewType
  colors: Color[]
  decimalPlaces?: DecimalPlaces
  prefix: string
  tickPrefix: string
  suffix: string
  tickSuffix: string
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps

type Field =
  | {
      /** type of input field */
      type: 'text' | 'number' | 'color'
      /** JSON key of theme property */
      name: keyof GaugeMiniLayerConfig
      label: string
    }
  | {
      type: 'heading'
      label: string
    }
  | {
      type: 'element'
      jsx: JSX.Element
    }
  | {
      type: 'select'
      name: keyof GaugeMiniLayerConfig
      label: string
      options: string[]
    }

// todo: move action to /ui/src/timeMachine/actions/index.ts
interface SetGaugeMiniPropAction {
  type: 'SET_GAUGE_MINI_PROP'
  payload: Partial<GaugeMiniLayerConfig>
}

export const setGaugeMiniProp = (
  props: Partial<GaugeMiniLayerConfig> & {
    defaultTheme?: ThemeString
  }
): SetGaugeMiniPropAction => ({
  type: 'SET_GAUGE_MINI_PROP',
  payload: props,
})

class GaugeMiniOptions extends PureComponent<Props> {
  public render() {
    const {availableGroupColumns, onUpdateColors, onUpdateProp} = this.props

    const theme: GaugeMiniLayerConfig = this.props as any

    const renderFields = (fields: Field[]) =>
      fields.map(x => {
        switch (x.type) {
          case 'element':
            return x.jsx

          case 'heading':
            return <h5 className="view-options--header">{x.label}</h5>

          case 'number':
            return (
              <FormElement label={x.label}>
                <Input
                  type={InputType.Number}
                  value={theme[x.name] as any}
                  onChange={e => onUpdateProp({[x.name]: +e.target.value})}
                />
              </FormElement>
            )

          case 'text':
            return (
              <FormElement label={x.label}>
                <Input
                  type={InputType.Text}
                  value={theme[x.name] as any}
                  onChange={e => onUpdateProp({[x.name]: e.target.value})}
                />
              </FormElement>
            )

          case 'select':
            return (
              <FormElement label={x.label}>
                <SelectDropdown
                  options={x.options}
                  selectedOption={theme[x.name] as any}
                  onSelect={e => onUpdateProp({[x.name]: e})}
                />
              </FormElement>
            )

          case 'color':
            const hex = theme[x.name]
            const name = THRESHOLD_COLORS.find(x => x.hex === hex)?.name ?? hex

            return (
              <>
                <FormElement label={x.label}>
                  <ColorDropdown
                    colors={THRESHOLD_COLORS}
                    selected={{hex, name} as any}
                    onChoose={({hex}) => {
                      onUpdateProp({[x.name]: hex})
                    }}
                  />
                </FormElement>
              </>
            )
        }
      })

    const groupDropdownStatus = availableGroupColumns.length
      ? ComponentStatus.Default
      : ComponentStatus.Disabled

    const columns = Object.keys(theme.barsDefinitions.groupByColumns).filter(
      x => theme.barsDefinitions.groupByColumns[x]
    )

    const onSelectMulti = (option: string) => {
      const res = columns.some(x => option === x)
      onUpdateProp({
        barsDefinitions: {
          ...theme.barsDefinitions,
          groupByColumns: {
            ...theme.barsDefinitions.groupByColumns,
            [option]: !res,
          },
        },
      })
    }

    const grupby = (
      <FormElement label="Group By">
        <MultiSelectDropdown
          options={availableGroupColumns}
          selectedOptions={columns}
          onSelect={onSelectMulti}
          buttonStatus={groupDropdownStatus}
        />
      </FormElement>
    )

    const defaultThemesSelector = (
      <Row>
        <Column widthXS={8}>
          <SelectDropdown
            options={
              [
                'GAUGE_MINI_THEME_BULLET_DARK',
                'GAUGE_MINI_THEME_PROGRESS_DARK',
              ] as ThemeString[]
            }
            selectedOption={this.props.defaultTheme}
            onSelect={x => {
              onUpdateProp({defaultTheme: x as ThemeString})
            }}
          />
        </Column>
        <Column widthXS={4}>
          <Button
            shape={ButtonShape.StretchToFit}
            text="Apply"
            onClick={() => {
              onUpdateProp({
                ...(this.props.defaultTheme === 'GAUGE_MINI_THEME_PROGRESS_DARK'
                  ? GAUGE_MINI_THEME_PROGRESS_DARK
                  : GAUGE_MINI_THEME_BULLET_DARK),
                ...({
                  colors: DEFAULT_GAUGE_COLORS,
                  type: 'gauge-mini',
                } as any),
              })
            }}
          />
        </Column>
      </Row>
    )

    return (
      <>
        <h4 className="view-options--header">Customize Gauge MINI</h4>

        {renderFields([
          {type: 'heading', label: 'Default themes'},
          {type: 'element', jsx: defaultThemesSelector},

          {type: 'heading', label: 'Options'},
          {
            type: 'select',
            name: 'textMode',
            options: ['follow', 'left'] as GaugeMiniLayerConfig['textMode'][],
            label: 'textMode',
          },
          {
            type: 'element',
            jsx: <FormElement label="Bar definitions">{grupby}</FormElement>,
          },
          {
            type: 'element',
            jsx: <div> show text? </div>,
          },
          {type: 'heading', label: 'Gauge colors'},
          {
            type: 'element',
            jsx: (
              <>
                <ThresholdsSettings
                  thresholds={this.props.colors}
                  onSetThresholds={onUpdateColors}
                />
                <div style={{height: '20px', width: '100%'}} />
              </>
            ),
          },
          {type: 'color', name: 'colorSecondary', label: 'colorSecondary'},

          {type: 'heading', label: 'Bars'},
          {type: 'number', name: 'valueHeight', label: 'valueHeight'},
          {type: 'number', name: 'gaugeHeight', label: 'gaugeHeight'},
          {type: 'number', name: 'valueRounding', label: 'valueRounding'},
          {type: 'number', name: 'gaugeRounding', label: 'gaugeRounding'},
          {type: 'number', name: 'barPaddings', label: 'barPaddings'},
          {type: 'number', name: 'sidePaddings', label: 'sidePaddings'},
          {type: 'number', name: 'oveflowFraction', label: 'oveflowFraction'},

          {type: 'heading', label: 'Main label'},
          {type: 'text', name: 'labelMain', label: 'labelMain'},
          {
            type: 'number',
            name: 'labelMainFontSize',
            label: 'labelMainFontSize',
          },
          {
            type: 'color',
            name: 'labelMainFontColor',
            label: 'labelMainFontColor',
          },

          {type: 'heading', label: 'Bar labels'},
          {
            type: 'number',
            name: 'labelBarsFontSize',
            label: 'labelBarsFontSize',
          },
          {
            type: 'color',
            name: 'labelBarsFontColor',
            label: 'labelBarsFontColor',
          },

          {type: 'heading', label: 'Value text'},
          {type: 'number', name: 'valuePadding', label: 'valuePadding'},
          {type: 'number', name: 'valueFontSize', label: 'valueFontSize'},
          {
            type: 'color',
            name: 'valueFontColorInside',
            label: 'valueFontColorInside',
          },
          {
            type: 'color',
            name: 'valueFontColorOutside',
            label: 'valueFontColorOutside',
          },
          {
            type: 'element',
            jsx: (
              <FormElement label="valueFormater">
                {
                  // todo
                }
              </FormElement>
            ),
          },

          {type: 'heading', label: 'Axes'},
          {
            type: 'element',
            jsx: (
              <FormElement label="axesSteps">
                {
                  // todo
                }
              </FormElement>
            ),
          },
          {type: 'number', name: 'axesFontSize', label: 'axesFontSize'},
          {type: 'color', name: 'axesFontColor', label: 'axesFontColor'},
          {
            type: 'element',
            jsx: (
              <FormElement label="axesFormater">
                {
                  // todo
                }
              </FormElement>
            ),
          },
        ])}
      </>
    )
  }
}

const mstp = (state: AppState) => {
  const availableGroupColumns = getGroupableColumns(state)

  return {availableGroupColumns}
}

const mdtp = {
  onUpdateColors: setColors,
  onUpdateProp: setGaugeMiniProp,
}

const connector = connect(mstp, mdtp)

export default connector(GaugeMiniOptions)
