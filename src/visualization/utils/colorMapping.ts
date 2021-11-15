export const mapSeriesToColor = (fillColumnMap, properties) => {
  const colorMapping = {...fillColumnMap}

  // console.log(properties, 'properties colors length', properties.colors.length)
  // console.log('fillColumnMap', fillColumnMap)
  console.log('properties colors', properties.colors)

  colorMapping.mappings.forEach((graphLine, colorIndex) => {

    graphLine.colorMapping = properties.colors[colorIndex % properties.colors.length].hex
  })
  console.log('colorMapping', colorMapping)
  return colorMapping
}

export const colorMappingCallback = (theGuy) => {
  console.log('color mapping callback', theGuy)
}
