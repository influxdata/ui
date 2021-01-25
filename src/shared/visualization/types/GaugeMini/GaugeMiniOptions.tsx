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
  SelectDropdown,
  AutoInput,
  AutoInputMode,
} from '@influxdata/clockface'
import Checkbox from 'src/shared/components/Checkbox'
const {Row, Column} = Grid

// Actions
import {setColors, setGaugeMiniProp} from 'src/timeMachine/actions'

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
  gaugeMiniGetTheme,
  GaugeMiniThemeString,
  gaugeMiniThemeStrings,
} from 'src/shared/constants/gaugeMiniSpecs'

import {MIN_DECIMAL_PLACES, MAX_DECIMAL_PLACES} from 'src/dashboards/constants'
import {FormatStatValueOptions} from 'src/client/generatedRoutes'
import {SelectGroup as _SelectGroup} from '@influxdata/clockface'
import {GaugeMiniAxesInputs} from './GaugeMiniAxesInputs'

interface OwnProps {
  defaultTheme: GaugeMiniThemeString
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
      type: 'text' | 'number' | 'color' | 'boolean'
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

class GaugeMiniOptions extends PureComponent<Props> {
  public render() {
    const {onUpdateColors, onUpdateProp} = this.props

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

          case 'boolean':
            return (
              <Checkbox
                label={x.label}
                checked={!!theme[x.name]}
                onSetChecked={e => onUpdateProp({[x.name]: e})}
              />
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

    const defaultThemesSelector = (
      <Row>
        <Column widthXS={8}>
          <SelectDropdown
            options={gaugeMiniThemeStrings}
            selectedOption={this.props.defaultTheme}
            onSelect={x => {
              onUpdateProp({defaultTheme: x as GaugeMiniThemeString})
            }}
          />
        </Column>
        <Column widthXS={4}>
          <Button
            shape={ButtonShape.StretchToFit}
            text="Apply"
            onClick={() => {
              onUpdateProp({
                ...gaugeMiniGetTheme(this.props.defaultTheme),
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

    const renderFormater = (
      name: keyof Pick<GaugeMiniLayerConfig, 'axesFormater' | 'valueFormater'>
    ) => {
      const formater = theme[name] as FormatStatValueOptions | undefined
      const onUpdateFormaterProp = <T extends keyof typeof formater>(
        field: T,
        value: typeof formater[T]
      ) => {
        onUpdateProp({[name]: {...formater, [field]: value}})
      }

      return (
        <>
          <Grid.Row>
            <Grid.Column widthXS={6}>
              <FormElement label="Prefix">
                <Input
                  type={InputType.Text}
                  value={formater?.prefix || ''}
                  onChange={e => {
                    onUpdateFormaterProp('prefix', e.target.value)
                  }}
                  placeholder="%, MPH, etc."
                />
              </FormElement>
            </Grid.Column>
            <Grid.Column widthXS={6}>
              <FormElement label="Suffix">
                <Input
                  type={InputType.Text}
                  value={formater?.suffix || ''}
                  onChange={e => {
                    onUpdateFormaterProp('suffix', e.target.value)
                  }}
                  placeholder="%, MPH, etc."
                />
              </FormElement>
            </Grid.Column>
          </Grid.Row>
          <FormElement label="Decimal Places">
            <AutoInput
              mode={
                formater?.decimalPlaces?.isEnforced
                  ? AutoInputMode.Custom
                  : AutoInputMode.Auto
              }
              onChangeMode={(mode: AutoInputMode) => {
                onUpdateFormaterProp('decimalPlaces', {
                  ...formater?.decimalPlaces,
                  isEnforced: mode === AutoInputMode.Custom,
                })
              }}
              inputComponent={
                <Input
                  name="decimal-places"
                  placeholder="Enter a number"
                  onChange={e => {
                    onUpdateFormaterProp('decimalPlaces', {
                      ...formater?.decimalPlaces,
                      digits: +e.target.value,
                    })
                  }}
                  value={formater?.decimalPlaces?.digits || 0}
                  min={MIN_DECIMAL_PLACES}
                  max={MAX_DECIMAL_PLACES}
                  type={InputType.Number}
                />
              }
            />
          </FormElement>
        </>
      )
    }

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
            type: 'boolean',
            name: 'labelBarsEnabled',
            label: 'labelBarsEnabled',
          },
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
                {renderFormater('valueFormater')}
              </FormElement>
            ),
          },

          {type: 'heading', label: 'Axes'},
          {
            type: 'element',
            jsx: (
              <FormElement label="axesSteps">
                <GaugeMiniAxesInputs
                  axesSteps={theme?.axesSteps}
                  onUpdateProp={onUpdateProp}
                />
              </FormElement>
            ),
          },
          {type: 'number', name: 'axesFontSize', label: 'axesFontSize'},
          {type: 'color', name: 'axesFontColor', label: 'axesFontColor'},
          {
            type: 'element',
            jsx: (
              <FormElement label="axesFormater">
                {renderFormater('axesFormater')}
              </FormElement>
            ),
          },
        ])}
      </>
    )
  }
}

const mstp = (_state: AppState) => {}

const mdtp = {
  onUpdateColors: setColors,
  onUpdateProp: setGaugeMiniProp,
}

const connector = connect(mstp, mdtp)

export default connector(GaugeMiniOptions)
