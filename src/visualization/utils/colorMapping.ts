import {XYViewProperties} from '../../client'

export const mapSeriesToColor = (fillColumnMap, properties: XYViewProperties) => {

  // check for existence of mapping
  if (properties.colorMapping?.mappings &&
      properties.colorMapping?.mappings === fillColumnMap.mappings){
    console.log("color mapping already exists returning" , properties.colorMapping)
    return properties.colorMapping
  }
  else {return makeColorMappingFromColors(fillColumnMap, properties)}
}

export const colorMappingCallback = () => {}

const getSeriesId = (graphLine, columnKeys) => {
  let id = ''
  for (const key of columnKeys) {
    if (key !== '_start' && key !== '_stop'){
      id += graphLine[key]
    }
  }
  return id
}

export const makeColorMappingFromColors = (fillColumnMap, properties: XYViewProperties) => {
  const colorMapping = {...fillColumnMap}

  const map = {}

  colorMapping.mappings.forEach((graphLine, colorIndex) => {
    const id = getSeriesId(graphLine, colorMapping.columnKeys)
    map[id] = properties.colors[colorIndex % properties.colors.length].hex
  })

  return {... colorMapping, map}
}
