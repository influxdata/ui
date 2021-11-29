export const mapSeriesToColor = (fillColumnMap, properties) => {
  const colorMapping = {...fillColumnMap}

  const colors = ['#ffffff', `#ff0000`]
  colorMapping.mappings.forEach((graphLine, colorIndex) => {
    graphLine.color =
      // properties.colors[colorIndex % properties.colors.length].hex
    graphLine.color = colors[colorIndex % colors.length]
  })

  // TODO: save the color mapping to IDPE

  return colorMapping
}

export const colorMappingCallback = theGuy => {
  console.log('UI: color mapping callback', theGuy)
}
