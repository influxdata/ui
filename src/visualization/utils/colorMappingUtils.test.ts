// tests will go here

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
      'co-airSensors-TLM0100-mean-': 0,
      'co-airSensors-TLM0101-mean-': 1,
      'co-airSensors-TLM0102-mean-': 2,
    },
  },
}

const expectedData = {
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
      'co-airSensors-TLM0100-mean-': 0,
      'co-airSensors-TLM0101-mean-': 1,
      'co-airSensors-TLM0102-mean-': 2,
    },
  },
}

describe('color mapping utils', function() {
  it('should generate a color mapping when view properties from the IDPE do not have colorMapping', function() {
    const {
      colorMappingForGiraffe,
      colorMappingForIDPE,
      needsToSaveToIDPE,
    } = getColorMappingObjects(
      dataFromIDPE_noColorMapping.columnGroup,
      dataFromIDPE_noColorMapping.properties as XYViewProperties
    )

    expect(colorMappingForGiraffe).toStrictEqual(expectedData.mappingForGiraffe)
    expect(needsToSaveToIDPE).toBe(true)
    expect(colorMappingForIDPE).toStrictEqual(
      expectedData.mappingForIDPE.colorMapping
    )
  })

  it('should return the IDPE mapping when the mappings are the same and need not be re-generated', function() {
    const {
      colorMappingForGiraffe,
      colorMappingForIDPE,
      needsToSaveToIDPE,
    } = getColorMappingObjects(
      dataFromIDPE_sameColorMapping.columnGroup,
      dataFromIDPE_sameColorMapping.properties as XYViewProperties
    )

    expect(colorMappingForGiraffe).toStrictEqual(expectedData.mappingForGiraffe)
    expect(needsToSaveToIDPE).toBe(false)

    // no object returned for IDPE since we don't need to save
    expect(colorMappingForIDPE).toStrictEqual(undefined)
  })
})
