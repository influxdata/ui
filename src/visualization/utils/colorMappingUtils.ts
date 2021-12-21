import {XYViewProperties} from 'src/types'
import { addedDiff, deletedDiff } from 'deep-object-diff';
import {getNominalColorScale} from '../../../../giraffe/giraffe/src/transforms'


/**
 * Evaluates whether mappings need to be updated
 * @param map1
 * @param map2
 */
const compareIDPEandLocalMappings = (map1, map2) => {
  if (!map1 || !map2) {
    return {isMappingReusable: false}
  }

  const additions = addedDiff(map1, map2)
  const deletions = deletedDiff(map1, map2)

  if (!isEmpty(additions) || !isEmpty(deletions)){
    console.log('%c these new elements need to be updated in to the idpe map', 'background: red; color: white')
    console.log(`%c additions : `, 'background: green; color: black', additions)
    console.log(`%c deletions : `, 'background: red; color: white', deletions)
  }

  // if no additions or no deletionsm we are good to go
  const isMappingReusable = isEmpty(additions) && isEmpty(deletions)

  return {isMappingReusable, additions, deletions}
}

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}


/**
 * Returns the colorMapping objects for UI, based on the state of the current view it will return the existing or generate a new one and request trigger saving to IDPE
 * @param columnGroupMap
 * @param properties
 * @returns an object shaped : {colorMappingForIDPE?, colorMappingForGiraffe?, needsToSaveToIDPE}
 */

export const getColorMappingObjects = (
  columnGroupMap,
  properties: XYViewProperties
) => {
  const seriesToColorHexMap = generateSeriesToColorHex(
    columnGroupMap,
    properties
  )

  console.log({seriesToColorHexMap})
  // if the mappings from the IDPE and the *required* one's for the current view are the same, we don't need to generate new mappings
  const {isMappingReusable} = compareIDPEandLocalMappings(properties.colorMapping, seriesToColorHexMap)

  if (isMappingReusable) {
    const columnKeys = columnGroupMap.columnKeys
    const mappings = {...columnGroupMap}
    const needsToSaveToIDPE = false

    mappings.mappings.forEach(graphLine => {
      const seriesID = getSeriesId(graphLine, columnKeys)

      // TODO: change here
      // this is needed for giraffe
      graphLine.color = properties.colorMapping[seriesID]
    })

    return {
      colorMappingForGiraffe: {columnKeys, ...mappings},
      needsToSaveToIDPE,
    }
  } else {
    const columnKeys = columnGroupMap.columnKeys
    const mappings = {...columnGroupMap}
    const needsToSaveToIDPE = true

    mappings.mappings.forEach(graphLine => {
      const seriesID = getSeriesId(graphLine, columnKeys)

      // this is needed for giraffe
      // TODO: change here
      // graphLine.color = colors[seriesToColorIndexMap[seriesID]].hex
      graphLine.color = seriesToColorHexMap[seriesID]
    })

    const newColorMappingForGiraffe = {
      ...mappings,
    }

    console.log(
      '%c mappings can NOT be reused',
      'background: #222; color: #bada55',
      {properties: properties.colorMapping, seriesToColorIndexMap: seriesToColorHexMap}
    )

    const {additions, deletions} = compareIDPEandLocalMappings(properties.colorMapping, seriesToColorHexMap)

    const colorMappingForIDPE = {...properties.colorMapping}

    // perform additions
    for (const add in additions) {
       colorMappingForIDPE[add] = seriesToColorHexMap[add]
    }

    // perform deletions
    for (const minus in deletions) {
      delete colorMappingForIDPE[minus]
    }

    console.log({colorMappingForIDPE})

    return {
      colorMappingForIDPE: colorMappingForIDPE,
      colorMappingForGiraffe: newColorMappingForGiraffe,
      needsToSaveToIDPE,
    }
  }
}

/**
 * This function returns the series id of the graphLine.
 * Example Graph line would look like:
 * {
 *    _start: `${MOCK_START}`,
 *    _stop: `${MOCK_STOP}`,
 *    _field: 'co',
 *    _measurement: 'airSensors',
 *    sensor_id: 'TLM0102',
 *    result: 'mean',
 * },
 *
 * The columnKeys are:
 * columnKeys: [
 *       '_start',
 *       '_stop',
 *       '_field',
 *       '_measurement',
 *       'sensor_id',
 *       'result',
 *     ],
 *
 * the seriesID would be : "co-airSensors-TLM0102-mean-"
 *
 * @param graphLine
 * @param columnKeys
 */
const getSeriesId = (graphLine, columnKeys) => {
  let id = ''
  for (const key of columnKeys) {
    // ignore the '_start' and '_stop' columns when generating the ID.
    if (key !== '_start' && key !== '_stop') {
      id += graphLine[key] + '-'
    }
  }
  return id
}

/**
 * This function generates a map that maps the series ID to the color Index.
 * @param columnGroupMap - generated using the createGroupIDColumn function
 * @param properties - XYViewProperties
 * @returns - a map that contains the series ID and it's color index (value bounded by the properties.colors array)
 */

const generateSeriesToColorHex = (
  columnGroupMap,
  properties: XYViewProperties
) => {
  const seriesToColorHex = {}
  const cgMap = {...columnGroupMap}
  cgMap.mappings.forEach((graphLine, colorIndex) => {
    const id = getSeriesId(graphLine, columnGroupMap.columnKeys)
    // seriesToColorIndexMap[id] = colorIndex % properties.colors.length
    const colors = properties.colors.map(value => value.hex)
    const fillScale = getNominalColorScale(columnGroupMap, colors)
    seriesToColorHex[id] = fillScale(colorIndex)
  })

  return {...seriesToColorHex}
}
