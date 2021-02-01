export const defaultHeatmap = {
  type: 'heatmap',
  radius: 20,
  blur: 10,
  intensityDimension: {label: 'Value'},
  intensityField: '_value',
  colors: [
    {type: 'min', hex: '#00ff00'},
    {value: 50, hex: '#ffae42'},
    {value: 60, hex: '#ff0000'},
    {type: 'max', hex: '#ff0000'},
  ],
}

export const defaultPointMap = {
  type: 'pointMap',
  colorDimension: {label: 'Duration'},
  colorField: 'duration',
  colors: [
    {type: 'min', hex: '#ff0000'},
    {value: 50, hex: '#343aeb'},
    {type: 'max', hex: '#343aeb'},
  ],
  isClustered: false,
}

export const defaultTrackMap = {
  type: 'trackMap',
  speed: 200,
  trackWidth: 4,
  randomColors: false,
  endStopMarkers: true,
  endStopMarkerRadius: 4,
  colors: [
    {type: 'min', hex: '#0000FF'},
    {type: 'max', hex: '#F0F0FF'},
  ],
}

export const defaultCircleMap = {
  type: 'circleMap',
  radiusField: 'magnitude',
  radiusDimension: {label: 'Magnitude'},
  colorDimension: {label: 'Duration'},
  colorField: 'duration',
  colors: [
    {type: 'min', hex: '#ff00b3'},
    {value: 50, hex: '#343aeb'},
    {type: 'max', hex: '#343aeb'},
  ],
}
