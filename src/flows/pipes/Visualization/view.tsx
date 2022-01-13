// Libraries
import React, {FC, useContext, useEffect, useMemo} from 'react'
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
import {PipeProp} from 'src/types/flows'

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

const downloadAsImage = (pipeID: string) => {
  const canvas = document.getElementById(pipeID)
  import('html2canvas').then((module: any) =>
    module.default(canvas as HTMLDivElement).then(result => {
      downloadImage(result.toDataURL(), 'visualization.png')
    })
  )
}

const downloadAsPDF = (pipeID: string) => {
  const canvas = document.getElementById(pipeID)
  import('html2canvas').then((module: any) =>
    module.default(canvas as HTMLDivElement).then(result => {
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

  const queryText = getPanelQueries(id)?.source || ''
  const download = () => {
    event('CSV Download Initiated')
    basic(queryText).promise.then(response => {
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
            title: 'Download As Image',
            action: () => downloadAsImage(id),
            disable: !isFlagEnabled('pdfImageDownload'),
          },
          {
            title: 'Download As PDF',
            action: () => downloadAsPDF(id),
            disable: !isFlagEnabled('pdfImageDownload'),
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

  if (
    isFlagEnabled('flowErrorThresholds') &&
    data?.errorThresholds?.length > 0
  ) {
    const fieldIndices = {}

    data?.errorThresholds.forEach(threshold => {
      fieldIndices[threshold.field] = {
        type: threshold.type,
        value: threshold.value,
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

    for (let i = 0; i < columns['_field'].data.length - 1; i++) {
      const field = columns['_field'].data[i]
      if (fieldIndices[`${field}`]) {
        // find the value based on the indices
        const value = columns['_value'].data[i]
        const val = fieldIndices[`${field}`].value
        switch (fieldIndices[`${field}`].type) {
          case 'between':
            if (
              value > fieldIndices[`${field}`].min &&
              value < fieldIndices[`${field}`].max
            ) {
              triggeredErrorThresholdMessage = `${field} is between ${
                fieldIndices[`${field}`].min
              } and ${fieldIndices[`${field}`].max}`
            }
            break
          case 'not-between':
            if (
              value < fieldIndices[`${field}`].min &&
              value > fieldIndices[`${field}`].max
            ) {
              triggeredErrorThresholdMessage = `${field} is not between ${
                fieldIndices[`${field}`].min
              } and ${fieldIndices[`${field}`].max}`
            }
            break
          case 'not-equal':
            if (value !== val) {
              triggeredErrorThresholdMessage = `${field} is not equal to ${val}`
            }
            break
          case 'equal':
            if (value === val) {
              triggeredErrorThresholdMessage = `${field} is equal to ${val}`
            }
            break
          case 'less-equal':
            if (value <= val) {
              triggeredErrorThresholdMessage = `${field} is less than or equal to ${val}`
            }
            break
          case 'less':
            if (value < val) {
              triggeredErrorThresholdMessage = `${field} is less than ${val}`
            }
            break
          case 'greater-equal':
            if (value >= val) {
              triggeredErrorThresholdMessage = `${field} is greater than or equal to ${val}`
            }
            break
          case 'greater':
            if (value > val) {
              triggeredErrorThresholdMessage = `${field} is greater than ${val}`
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
          <View
            loading={loading}
            properties={data.properties}
            result={results.parsed}
            timeRange={range}
          />
        </div>
      </div>
    </Context>
  )
}

export default Visualization
