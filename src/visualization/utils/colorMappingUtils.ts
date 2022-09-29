import {XYViewProperties} from 'src/types'
import {addedDiff, deletedDiff} from 'deep-object-diff'
import {getNominalColorScale} from '@influxdata/giraffe'
import {DEFAULT_LINE_COLORS} from 'src/shared/constants/graphColorPalettes'

/**
 * Evaluates whether mappings need to be updated
 * @param map1
 * @param map2
 */
const compareIDPEandLocalMappings = (map1, map2) => {
  // SPECIAL CASE: handle null case when colorMapping from IDPE is `null`
  if (!map1) {
    return {isMappingReusable: false, additions: map2}
  }

  function isEmpty(obj) {
    return Object.keys(obj).length === 0
  }

  const additions = addedDiff(map1, map2)
  const deletions = deletedDiff(map1, map2)

  // if no additions or no deletions we are good to go
  const isMappingReusable = isEmpty(additions) && isEmpty(deletions)

  return {isMappingReusable, additions, deletions}
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

  const {isMappingReusable} = compareIDPEandLocalMappings(
    properties.colorMapping,
    seriesToColorHexMap
  )

  // if the mappings from the IDPE and the *required* one's for the current view are the same, we don't need to generate new mappings
  if (isMappingReusable) {
    const columnKeys = columnGroupMap.columnKeys
    const mappings = {...columnGroupMap}
    const needsToSaveToIDPE = false

    mappings.mappings.forEach(graphLine => {
      const seriesID = getSeriesId(graphLine, columnKeys)

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
      graphLine.color = seriesToColorHexMap[seriesID]
    })

    const newColorMappingForGiraffe = {
      ...mappings,
    }

    const {additions, deletions} = compareIDPEandLocalMappings(
      properties.colorMapping,
      seriesToColorHexMap
    )

    const colorMappingForIDPE = {...properties.colorMapping}

    // perform additions
    for (const add in additions) {
      colorMappingForIDPE[add] = seriesToColorHexMap[add]
    }

    // perform deletions
    for (const minus in deletions) {
      delete colorMappingForIDPE[minus]
    }

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
 * @returns - a map that contains the series ID and it's color hex value
 */

export const generateSeriesToColorHex = (
  columnGroupMap,
  properties: XYViewProperties
) => {
  const cache = {}
  const seriesToColorHex = {}
  columnGroupMap.mappings.forEach((graphLine, colorIndex) => {
    const id = getSeriesId(graphLine, columnGroupMap.columnKeys)
    let colors
    if (Array.isArray(properties.colors) && properties.colors.length) {
      // takes care of when properties.colors is NOT undefined, and NOT an empty array
      colors = properties.colors
    } else {
      // when array is undefined or array IS empty.
      colors = DEFAULT_LINE_COLORS
    }
    const colorsHexArray = colors.map(value => value.hex)
    const key = colorsHexArray.join('')
    let fillScale
    if (cache[key]) {
      fillScale = cache[key]
    } else {
      /**
       * this is an expensive operation to perform, so we want to cache the result and use the returned function
       * Since the size of the columnGroupMap is the same in the context of each function, we can rely upon the
       * colorsHexArray as our unique key identifier and rely upon that for caching the reuslts
       */
      fillScale = getNominalColorScale(columnGroupMap, colorsHexArray)
      cache[key] = fillScale
    }
    seriesToColorHex[id] = fillScale(colorIndex)
  })

  return seriesToColorHex
}
