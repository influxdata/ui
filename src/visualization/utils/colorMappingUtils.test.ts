import {getColorMappingObjects} from './colorMappingUtils'
import {XYViewProperties} from '../../client'

const MOCK_START = 1639775162126
const MOCK_STOP = 1639778762126
const dataFromIDPE_noColorMapping = {
  // the columnGroup is not saved in IDPE but generated using the createGroupIdColumn
  columnGroup: {
    mappings: [
      {
        _start: `${MOCK_START}`,
        _stop: `${MOCK_STOP}`,
        _field: 'co',
        _measurement: 'airSensors',
        sensor_id: 'TLM0100',
        result: 'mean',
      },
      {
        _start: `${MOCK_START}`,
        _stop: `${MOCK_STOP}`,
        _field: 'co',
        _measurement: 'airSensors',
        sensor_id: 'TLM0101',
        result: 'mean',
      },
      {
        _start: `${MOCK_START}`,
        _stop: `${MOCK_STOP}`,
        _field: 'co',
        _measurement: 'airSensors',
        sensor_id: 'TLM0102',
        result: 'mean',
      },
    ],
    columnKeys: [
      '_start',
      '_stop',
      '_field',
      '_measurement',
      'sensor_id',
      'result',
    ],
  },
  properties: {
    // no colorMapping present
    colors: [
      {
        id: '2f2d8b62-5e53-46b2-bde9-a291bcc5f9e7',
        type: 'scale',
        hex: '#31C0F6',
        name: 'Nineteen Eighty Four',
        value: 0,
      },
      {
        id: '4b0d1e17-2177-40cf-b524-980fe80f6ca8',
        type: 'scale',
        hex: '#A500A5',
        name: 'Nineteen Eighty Four',
        value: 0,
      },
      {
        id: 'd90d4be9-14f8-48da-a309-8d2cb50f6961',
        type: 'scale',
        hex: '#FF7E27',
        name: 'Nineteen Eighty Four',
        value: 0,
      },
    ],
  },
}
const dataFromIDPE_sameColorMapping = {
  // the columnGroup is not saved in IDPE but generated using the createGroupIdColumn
  columnGroup: {
    mappings: [
      {
        _start: `${MOCK_START}`,
        _stop: `${MOCK_STOP}`,
        _field: 'co',
        _measurement: 'airSensors',
        sensor_id: 'TLM0100',
        result: 'mean',
        color: '#31C0F6',
      },
      {
        _start: `${MOCK_START}`,
        _stop: `${MOCK_STOP}`,
        _field: 'co',
        _measurement: 'airSensors',
        sensor_id: 'TLM0101',
        result: 'mean',
        color: '#A500A5',
      },
      {
        _start: `${MOCK_START}`,
        _stop: `${MOCK_STOP}`,
        _field: 'co',
        _measurement: 'airSensors',
        sensor_id: 'TLM0102',
        result: 'mean',
        color: '#FF7E27',
      },
    ],
    columnKeys: [
      '_start',
      '_stop',
      '_field',
      '_measurement',
      'sensor_id',
      'result',
    ],
  },
  properties: {
    colors: [
      {
        id: '2f2d8b62-5e53-46b2-bde9-a291bcc5f9e7',
        type: 'scale',
        hex: '#31C0F6',
        name: 'Nineteen Eighty Four',
        value: 0,
      },
      {
        id: '4b0d1e17-2177-40cf-b524-980fe80f6ca8',
        type: 'scale',
        hex: '#A500A5',
        name: 'Nineteen Eighty Four',
        value: 0,
      },
      {
        id: 'd90d4be9-14f8-48da-a309-8d2cb50f6961',
        type: 'scale',
        hex: '#FF7E27',
        name: 'Nineteen Eighty Four',
        value: 0,
      },
    ],
    colorMapping: {
      'co-airSensors-TLM0100-mean-': '#31C0F6',
      'co-airSensors-TLM0101-mean-': '#A500A5',
      'co-airSensors-TLM0102-mean-': '#FF7E27',
    },
  },
}
const dataFromIDPE_fiveSeries = {
  // the columnGroup is not saved in IDPE but generated using the createGroupIdColumn
  columnGroup: {
    mappings: [
      {
        _start: `${MOCK_START}`,
        _stop: `${MOCK_STOP}`,
        _field: 'co',
        _measurement: 'airSensors',
        sensor_id: 'TLM0100',
        result: 'mean',
      },
      {
        _start: `${MOCK_START}`,
        _stop: `${MOCK_STOP}`,
        _field: 'co',
        _measurement: 'airSensors',
        sensor_id: 'TLM0101',
        result: 'mean',
      },
      {
        _start: `${MOCK_START}`,
        _stop: `${MOCK_STOP}`,
        _field: 'co',
        _measurement: 'airSensors',
        sensor_id: 'TLM0102',
        result: 'mean',
      },
      {
        _start: `${MOCK_START}`,
        _stop: `${MOCK_STOP}`,
        _field: 'co',
        _measurement: 'airSensors',
        sensor_id: 'TLM0103',
        result: 'mean',
      },
      {
        _start: `${MOCK_START}`,
        _stop: `${MOCK_STOP}`,
        _field: 'co',
        _measurement: 'airSensors',
        sensor_id: 'TLM0104',
        result: 'mean',
      },
    ],
    columnKeys: [
      '_start',
      '_stop',
      '_field',
      '_measurement',
      'sensor_id',
      'result',
    ],
  },
  properties: {
    // no colorMapping present
    colors: [
      {
        id: '2f2d8b62-5e53-46b2-bde9-a291bcc5f9e7',
        type: 'scale',
        hex: '#31C0F6',
        name: 'Nineteen Eighty Four',
        value: 0,
      },
      {
        id: '4b0d1e17-2177-40cf-b524-980fe80f6ca8',
        type: 'scale',
        hex: '#A500A5',
        name: 'Nineteen Eighty Four',
        value: 0,
      },
      {
        id: 'd90d4be9-14f8-48da-a309-8d2cb50f6961',
        type: 'scale',
        hex: '#FF7E27',
        name: 'Nineteen Eighty Four',
        value: 0,
      },
    ],
  },
}
const expectedData = {
  threeSeries: {
    mappingForGiraffe: {
      mappings: [
        {
          _start: `${MOCK_START}`,
          _stop: `${MOCK_STOP}`,
          _field: 'co',
          _measurement: 'airSensors',
          sensor_id: 'TLM0100',
          result: 'mean',
          color: '#31C0F6',
        },
        {
          _start: `${MOCK_START}`,
          _stop: `${MOCK_STOP}`,
          _field: 'co',
          _measurement: 'airSensors',
          sensor_id: 'TLM0101',
          result: 'mean',
          color: '#A500A5',
        },
        {
          _start: `${MOCK_START}`,
          _stop: `${MOCK_STOP}`,
          _field: 'co',
          _measurement: 'airSensors',
          sensor_id: 'TLM0102',
          result: 'mean',
          color: '#FF7E27',
        },
      ],
      columnKeys: [
        '_start',
        '_stop',
        '_field',
        '_measurement',
        'sensor_id',
        'result',
      ],
    },
    mappingForIDPE: {
      colorMapping: {
        'co-airSensors-TLM0100-mean-': '#31C0F6',
        'co-airSensors-TLM0101-mean-': '#A500A5',
        'co-airSensors-TLM0102-mean-': '#FF7E27',
      },
    },
  },
  fiveSeries: {
    mappingForGiraffe: {
      mappings: [
        {
          _start: `${MOCK_START}`,
          _stop: `${MOCK_STOP}`,
          _field: 'co',
          _measurement: 'airSensors',
          sensor_id: 'TLM0100',
          result: 'mean',
          color: 'rgb(49, 192, 246)',
        },
        {
          _start: `${MOCK_START}`,
          _stop: `${MOCK_STOP}`,
          _field: 'co',
          _measurement: 'airSensors',
          sensor_id: 'TLM0101',
          result: 'mean',
          color: 'rgb(106, 103, 205)',
        },
        {
          _start: `${MOCK_START}`,
          _stop: `${MOCK_STOP}`,
          _field: 'co',
          _measurement: 'airSensors',
          sensor_id: 'TLM0102',
          result: 'mean',
          color: 'rgb(161, 53, 158)',
        },
        {
          _start: `${MOCK_START}`,
          _stop: `${MOCK_STOP}`,
          _field: 'co',
          _measurement: 'airSensors',
          sensor_id: 'TLM0103',
          result: 'mean',
          color: 'rgb(209, 70, 101)',
        },
        {
          _start: `${MOCK_START}`,
          _stop: `${MOCK_STOP}`,
          _field: 'co',
          _measurement: 'airSensors',
          sensor_id: 'TLM0104',
          result: 'mean',
          color: 'rgb(255, 126, 39)',
        },
      ],
      columnKeys: [
        '_start',
        '_stop',
        '_field',
        '_measurement',
        'sensor_id',
        'result',
      ],
    },
    mappingForIDPE: {
      colorMapping: {
        'co-airSensors-TLM0100-mean-': 'rgb(49, 192, 246)',
        'co-airSensors-TLM0101-mean-': 'rgb(106, 103, 205)',
        'co-airSensors-TLM0102-mean-': 'rgb(161, 53, 158)',
        'co-airSensors-TLM0103-mean-': 'rgb(209, 70, 101)',
        'co-airSensors-TLM0104-mean-': 'rgb(255, 126, 39)',
      },
    },
  },
}

describe('color mapping utils', function () {
  it('should generate a color mapping when view properties from the IDPE do not have colorMapping', function () {
    const {colorMappingForGiraffe, colorMappingForIDPE, needsToSaveToIDPE} =
      getColorMappingObjects(
        dataFromIDPE_noColorMapping.columnGroup,
        dataFromIDPE_noColorMapping.properties as XYViewProperties
      )

    expect(colorMappingForGiraffe).toStrictEqual(
      expectedData.threeSeries.mappingForGiraffe
    )
    expect(needsToSaveToIDPE).toBe(true)
    expect(colorMappingForIDPE).toStrictEqual(
      expectedData.threeSeries.mappingForIDPE.colorMapping
    )
  })

  it('should return the IDPE mapping when the mappings are the same and need not be re-generated', function () {
    const {colorMappingForGiraffe, colorMappingForIDPE, needsToSaveToIDPE} =
      getColorMappingObjects(
        dataFromIDPE_sameColorMapping.columnGroup,
        dataFromIDPE_sameColorMapping.properties as XYViewProperties
      )

    expect(colorMappingForGiraffe).toStrictEqual(
      expectedData.threeSeries.mappingForGiraffe
    )
    expect(needsToSaveToIDPE).toBe(false)

    // no object returned for IDPE since we don't need to save
    expect(colorMappingForIDPE).toStrictEqual(undefined)
  })

  it('should generate a color mapping when view properties from the IDPE do not have colorMapping and there are more series than the number of colors in the color array (5 series, 3 colors)', function () {
    const {colorMappingForGiraffe, colorMappingForIDPE, needsToSaveToIDPE} =
      getColorMappingObjects(
        dataFromIDPE_fiveSeries.columnGroup,
        dataFromIDPE_fiveSeries.properties as XYViewProperties
      )

    expect(colorMappingForGiraffe).toStrictEqual(
      expectedData.fiveSeries.mappingForGiraffe
    )
    expect(needsToSaveToIDPE).toBe(true)
    expect(colorMappingForIDPE).toStrictEqual(
      expectedData.fiveSeries.mappingForIDPE.colorMapping
    )
  })
})
