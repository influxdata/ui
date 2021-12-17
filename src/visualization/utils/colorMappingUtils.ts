import {XYViewProperties} from 'src/types'

/**
 * Evaluates deeper equality for two map objects based on their key:value pair
 * @param map1
 * @param map2
 */
const areMappingsSame = (map1, map2) => {
  if (!map1 || !map2) {
    return false
  }

  // Create arrays of property names
  const aProps = Object.getOwnPropertyNames(map1)
  const bProps = Object.getOwnPropertyNames(map2)

  // If number of properties is different,
  // objects are not equivalent
  if (aProps.length != bProps.length) {
    return false
  }

  for (let i = 0; i < aProps.length; i++) {
    const propName = aProps[i]

    // If values of same property are not equal,
    // objects are not equivalent
    if (map1[propName] !== map2[propName]) {
      return false
    }
  }

  return true
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
  let needsToSaveToIDPE = false

  // if the mappings from the IDPE and the *required* one's for the current view are the same, we don't need to generate new mappings
  if (areMappingsSame(properties.colorMapping, seriesToColorIndexMap)) {
    const columnKeys = columnGroupMap.columnKeys
    const mappings = {...columnGroupMap}

    mappings.mappings.forEach(graphLine => {
      const seriesID = getSeriesId(graphLine, columnKeys)

      const colors = properties.colors

      // this is needed for giraffe
      graphLine.color = colors[properties.colorMapping[seriesID]].hex
    })

    needsToSaveToIDPE = false

    return {
      colorMappingForGiraffe: {columnKeys, ...mappings},
      needsToSaveToIDPE,
    }
  } else {
    const columnKeys = columnGroupMap.columnKeys
    const mappings = {...columnGroupMap}

    mappings.mappings.forEach(graphLine => {
      const seriesID = getSeriesId(graphLine, columnKeys)

      const colors = properties.colors

      // this is needed for giraffe
      graphLine.color = colors[seriesToColorIndexMap[seriesID]].hex
    })

    const newColorMappingForGiraffe = {
      ...mappings,
      seriesToColorIndexMap,
    }
    needsToSaveToIDPE = true

    return {
      colorMappingForIDPE: seriesToColorIndexMap,
      colorMappingForGiraffe: newColorMappingForGiraffe,
      needsToSaveToIDPE,
    }
  }
}

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

  columnGroupMap.mappings.forEach((graphLine, colorIndex) => {
    const id = getSeriesId(graphLine, columnGroupMap.columnKeys)
    seriesToColorIndexMap[id] = colorIndex % properties.colors.length
  })

  return {...seriesToColorIndexMap}
}
