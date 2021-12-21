import {XYViewProperties} from 'src/types'

/**
 * Evaluates whether mappings need to be updated
 * @param map1
 * @param map2
 */
const isMappingReusable = (map1, map2) => {
  if (!map1 || !map2) {
    return false
  }

  // Create Set of property names
  const aProps = new Set(Object.getOwnPropertyNames(map1))
  const bProps = new Set(Object.getOwnPropertyNames(map2))



  if (aProps.size === 0) {
    return false
  }

  const diff1 = difference(aProps, bProps)
  const diff2 = difference(bProps, aProps)

  if (diff1.size || diff2.size){
    console.log('%c these new elements need to be added to the idpe map', 'background: red; color: white')
    console.log({aProps, bProps})
    console.log(new Set([...diff1, ...diff2]))

  }

  return (
    difference(aProps, bProps).size === 0 &&
    difference(bProps, aProps).size === 0
  )
}

const difference = (setA, setB) => {
  const _difference = new Set(setA)
  for (const elem of setB) {
    _difference.delete(elem)
  }
  return _difference
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
  const seriesToColorIndexMap = generateSeriesToColorIndexMap(
    columnGroupMap,
    properties
  )

  // if the mappings from the IDPE and the *required* one's for the current view are the same, we don't need to generate new mappings
  if (isMappingReusable(properties.colorMapping, seriesToColorIndexMap)) {
    // console.log('mappings can be reused', {
    //   properties: properties.colorMapping,
    //   seriesToColorIndexMap,
    // })
    const columnKeys = columnGroupMap.columnKeys
    const mappings = {...columnGroupMap}
    const needsToSaveToIDPE = false

    mappings.mappings.forEach(graphLine => {
      const seriesID = getSeriesId(graphLine, columnKeys)

      const colors = properties.colors

      // this is needed for giraffe
      graphLine.color = colors[properties.colorMapping[seriesID]].hex
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

      const colors = properties.colors

      // this is needed for giraffe
      graphLine.color = colors[seriesToColorIndexMap[seriesID]].hex
    })

    const newColorMappingForGiraffe = {
      ...mappings,
    }

    console.log(
      '%c mappings can NOT be reused',
      'background: #222; color: #bada55',
      {properties: properties.colorMapping, seriesToColorIndexMap}
    )

    return {
      colorMappingForIDPE: seriesToColorIndexMap,
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

export const generateSeriesToColorIndexMap = (
  columnGroupMap,
  properties: XYViewProperties
) => {
  const seriesToColorIndexMap = {}
  const cgMap = {...columnGroupMap}
  cgMap.mappings.forEach((graphLine, colorIndex) => {
    const id = getSeriesId(graphLine, columnGroupMap.columnKeys)
    seriesToColorIndexMap[id] = colorIndex % properties.colors.length
  })

  return {...seriesToColorIndexMap}
}
