export const mapSeriesToColor = (fillColumnMap, properties) => {
  const colorMapping = {...fillColumnMap}

  colorMapping.mappings.forEach((graphLine, colorIndex) => {
    graphLine.colorMapping =
      properties.colors[colorIndex % properties.colors.length].hex
    // graphLine.colorMapping = '#ffffff'
  })

  return colorMapping
}

export const colorMappingCallback = theGuy => {
  console.log('UI: color mapping callback', theGuy)
}
