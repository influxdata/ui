import {XYViewProperties} from '../../client'

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

export const mapSeriesToColor = (
  fillColumnMap,
  properties: XYViewProperties
) => {
  const newColorMapping = makeColorMappingFromColors(fillColumnMap, properties)
  let needsToSaveToIDPE = false
  if (
    areMappingsSame(
      properties.colorMapping?.seriesToColorIndexMap,
      newColorMapping.seriesToColorIndexMap
    )
  ) {
    console.log('@ui color mapping already exists returning', properties)

    const columnKeys = fillColumnMap.columnKeys
    const mappings = {...fillColumnMap}

    mappings.mappings.forEach(graphLine => {
      const seriesID = getSeriesId(graphLine, columnKeys)
      const colors = properties.colors
      graphLine.color =
        colors[properties.colorMapping?.seriesToColorIndexMap[seriesID]].hex
    })
    needsToSaveToIDPE = false
    return [{columnKeys, ...mappings}, needsToSaveToIDPE]
  } else {
    console.log('@ui needs new colormapping, generating...')
    needsToSaveToIDPE = true
    return [newColorMapping, needsToSaveToIDPE]
  }
}

export const colorMappingCallback = () => {}

const getSeriesId = (graphLine, columnKeys) => {
  let id = ''
  for (const key of columnKeys) {
    if (key !== '_start' && key !== '_stop') {
      id += graphLine[key] + '-'
    }
  }
  return id
}

export const makeColorMappingFromColors = (
  fillColumnMap,
  properties: XYViewProperties
) => {
  const colorMapping = {...fillColumnMap}

  const seriesToColorIndexMap = {}

  colorMapping.mappings.forEach((graphLine, colorIndex) => {
    const id = getSeriesId(graphLine, colorMapping.columnKeys)
    seriesToColorIndexMap[id] = colorIndex % properties.colors.length
    graphLine.color =
      properties.colors[colorIndex % properties.colors.length].hex
  })

  return {...colorMapping, seriesToColorIndexMap}
}
