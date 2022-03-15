// Libraries
import React, {FC, useCallback, useContext, useEffect, useMemo} from 'react'
import QRComponent from 'src/flows/pipes/Visualization/QRCode'

// Components
import {
  AlignItems,
  ComponentSize,
  FlexBox,
  FlexDirection,
  Icon,
  IconFont,
  JustifyContent,
} from '@influxdata/clockface'
import Controls from 'src/flows/pipes/Visualization/Controls'

// Utilities
import {View} from 'src/visualization'

// Types
import {RemoteDataState} from 'src/types'
import {Columns, PipeProp} from 'src/types/flows'

import {PipeContext} from 'src/flows/context/pipe'
import {FlowQueryContext} from 'src/flows/context/flow.query'
import {SidebarContext} from 'src/flows/context/sidebar'

import {event} from 'src/cloud/utils/reporting'
import {downloadTextFile} from 'src/shared/utils/download'

// Constants
import {UNPROCESSED_PANEL_TEXT} from 'src/flows'
import {LINE_COLORS_SOLID_WHITE} from 'src/shared/constants/graphColorPalettes'
import {downloadImage} from 'src/shared/utils/download'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'

// Enable map background
const canvasOption = {
  useCORS: true,
}

const downloadAsImage = (pipeID: string) => {
  const canvas = document.getElementById(pipeID)
  import('html2canvas').then((module: any) =>
    module.default(canvas as HTMLDivElement, canvasOption).then(result => {
      downloadImage(result.toDataURL(), 'visualization.png')
    })
  )
}

const downloadAsPDF = (pipeID: string) => {
  const canvas = document.getElementById(pipeID)
  import('html2canvas').then((module: any) =>
    module.default(canvas as HTMLDivElement, canvasOption).then(result => {
      import('jspdf').then((jsPDF: any) => {
        const doc = new jsPDF.default({
          orientation: 'l',
          unit: 'pt',
          format: [result.width, result.height],
        })
        doc.addImage(
          result.toDataURL('image/png'),
          'PNG',
          0,
          0,
          result.width,
          result.height
        )
        doc.save('visualization.pdf')
      })
    })
  )
}

const Visualization: FC<PipeProp> = ({Context}) => {
  const {id, data, range, loading, results} = useContext(PipeContext)
  const {basic, getPanelQueries} = useContext(FlowQueryContext)
  const {register} = useContext(SidebarContext)

  const dataExists = !!(results?.parsed?.table || []).length

  const download = () => {
    event('CSV Download Initiated')
    const query = getPanelQueries(id)
    basic(query?.source, query?.scope).promise.then(response => {
      if (response.type !== 'SUCCESS') {
        return
      }

      downloadTextFile(response.csv, 'influx.data', '.csv', 'text/csv')
    })
  }

  const loadingText = useMemo(() => {
    if (loading === RemoteDataState.Loading) {
      return 'Loading'
    }

    if (loading === RemoteDataState.NotStarted) {
      return UNPROCESSED_PANEL_TEXT
    }

    return 'No Data Returned'
  }, [loading])

  const getValueColumn = useCallback((columns: Columns) => {
    return Object.values(columns).filter(column => column.name === '_value')
  }, [])

  useEffect(() => {
    if (!id) {
      return
    }

    register(id, [
      {
        title: 'Visualization',
        actions: [
          {
            title: 'Download as CSV',
            disable: !dataExists,
            action: download,
          },
          {
            title: 'Download as Image',
            action: () => downloadAsImage(id),
            hidden: !isFlagEnabled('pdfImageDownload'),
            disable: !dataExists,
          },
          {
            title: 'Download as PDF',
            action: () => downloadAsPDF(id),
            hidden: !isFlagEnabled('pdfImageDownload'),
            disable: !dataExists,
          },
        ],
      },
    ])
  }, [id, data.properties, results.parsed, range])

  if (results.error) {
    return (
      <Context controls={<Controls />}>
        <div className="panel-resizer panel-resizer__visible panel-resizer--error-state">
          <div className="panel-resizer--header panel-resizer--header__multiple-controls">
            <Icon
              glyph={IconFont.AlertTriangle}
              className="panel-resizer--vis-toggle"
            />
          </div>
          <div className="panel-resizer--error">{results.error}</div>
        </div>
      </Context>
    )
  }

  if (!dataExists) {
    return (
      <Context controls={<Controls />}>
        <div className="panel-resizer panel-resizer__visible" id={id}>
          <div className="panel-resizer--header panel-resizer--header__multiple-controls">
            <Icon
              glyph={IconFont.BarChart_New}
              className="panel-resizer--vis-toggle"
            />
          </div>
          <div className="panel-resizer--body">
            <div className="panel-resizer--empty">{loadingText}</div>
          </div>
        </div>
      </Context>
    )
  }

  if (data?.errorThresholds?.length > 0) {
    const fieldIndices = {}

    data?.errorThresholds.forEach(threshold => {
      fieldIndices[threshold.field] = {
        type: threshold.type,
        value: threshold.value,
        fieldType: threshold.fieldType,
      }
      if (threshold.min) {
        fieldIndices[threshold.field].min = threshold.min
      }
      if (threshold.max) {
        fieldIndices[threshold.field].max = threshold.max
      }
    })

    const {columns} = results.parsed.table

    let triggeredErrorThresholdMessage = ''
    const fields: any[] = columns['_field'].data

    const values = getValueColumn(columns)

    const realValues = fields.map((_, index) =>
      values.reduce((acc, curr) => {
        if (curr.data[index] != null) {
          return curr.data[index]
        }
        return acc
      }, undefined)
    )

    for (let i = 0; i < fields.length - 1; i++) {
      const field = fields[i]
      if (fieldIndices[`${field}`]) {
        // find the value based on the indices
        const value = realValues[i]
        let thresholdValue = fieldIndices[`${field}`]?.value
        const fieldType = fieldIndices[`${field}`]?.fieldType

        if (fieldType === 'number') {
          thresholdValue = Number(thresholdValue)
        }

        const min = Number(fieldIndices[`${field}`].min)
        const max = Number(fieldIndices[`${field}`].max)
        const type = fieldIndices[`${field}`].type

        switch (type) {
          case 'between':
            if (value > min && value < max) {
              triggeredErrorThresholdMessage = `${field} is between ${min} and ${max}`
            }
            break
          case 'not-between':
            if (!(value > min && value < max)) {
              triggeredErrorThresholdMessage = `${field} is not between ${min} and ${max}`
            }
            break
          case 'not-equal':
            if (value !== thresholdValue) {
              triggeredErrorThresholdMessage = `${field} is not equal to ${thresholdValue}`
            }
            break
          case 'equal':
            if (value === thresholdValue) {
              triggeredErrorThresholdMessage = `${field} is equal to ${thresholdValue}`
            }
            break
          case 'less-equal':
            if (value <= thresholdValue) {
              triggeredErrorThresholdMessage = `${field} is less than or equal to ${thresholdValue}`
            }
            break
          case 'less':
            if (value < thresholdValue) {
              triggeredErrorThresholdMessage = `${field} is less than ${thresholdValue}`
            }
            break
          case 'greater-equal':
            if (value >= thresholdValue) {
              triggeredErrorThresholdMessage = `${field} is greater than or equal to ${thresholdValue}`
            }
            break
          case 'greater':
            if (value > thresholdValue) {
              triggeredErrorThresholdMessage = `${field} is greater than ${thresholdValue}`
            }
            break
          default:
            break
        }
      }

      if (triggeredErrorThresholdMessage) {
        break
      }
    }

    if (triggeredErrorThresholdMessage) {
      // show the QR code if it exists
      const url = new URL(
        `${window.location.origin}${window.location.pathname}?panel=${id}`
      ).toString()

      return (
        <Context controls={<Controls />} resizes>
          <div
            className="flow-visualization"
            id={`${triggeredErrorThresholdMessage}-${id}`}
          >
            <div className="flow-visualization--view-error">
              <FlexBox
                direction={FlexDirection.Row}
                margin={ComponentSize.Small}
                justifyContent={JustifyContent.SpaceBetween}
                stretchToFitHeight
              >
                <div
                  className="flow-visualization--view-error"
                  style={{height: '100%'}}
                >
                  <View
                    loading={loading}
                    properties={{
                      ...data.properties,
                      colors: LINE_COLORS_SOLID_WHITE,
                    }}
                    result={results.parsed}
                    timeRange={range}
                  />
                </div>
                <FlexBox
                  direction={FlexDirection.Column}
                  margin={ComponentSize.Small}
                  justifyContent={JustifyContent.Center}
                  alignItems={AlignItems.Center}
                >
                  <QRComponent url={url} />
                  <div className="panel-threshold--message">
                    {triggeredErrorThresholdMessage}
                  </div>
                </FlexBox>
              </FlexBox>
            </div>
          </div>
        </Context>
      )
    }
  }

  return (
    <Context controls={<Controls />} resizes>
      <div className="flow-visualization" id={id}>
        <div className="flow-visualization--view">
          <ErrorBoundary>
            <View
              loading={loading}
              properties={data.properties}
              result={results.parsed}
              timeRange={range}
            />
          </ErrorBoundary>
        </div>
      </div>
    </Context>
  )
}

export default Visualization
