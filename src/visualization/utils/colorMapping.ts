import {XYViewProperties} from '../../client'

export const mapSeriesToColor = (fillColumnMap, properties: XYViewProperties) => {

  // check for existence of mapping

  console.log(properties.colorMapping)
  if (properties.colorMapping.mappings){
    return properties.colorMapping
  }
  else {return makeColorMappingFromColors(fillColumnMap, properties)}
}

export const colorMappingCallback = () => {}

export const makeColorMappingFromColors = (fillColumnMap, properties: XYViewProperties) => {
  const colorMapping = {...fillColumnMap}

  colorMapping.mappings.forEach((graphLine, colorIndex) => {
    graphLine.color =
      properties.colors[colorIndex % properties.colors.length].hex
  })

  return colorMapping
}
