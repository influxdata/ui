export const ADDING = 'adding'
export const EDITING = 'editing'

export const TEMP_ANNOTATION = {
  id: 'tempAnnotation',
  name: 'New Annotation',
  text: '',
  type: '',
  startTime: '',
  endTime: '',
}

export const getAnnotations = (graph, annotations = []) => {
  if (!graph) {
    return []
  }

  const [xStart, xEnd] = graph.xAxisRange()
  return annotations.reduce((acc, a) => {
    // Don't render if annotation.time is outside the graph
    const time = +a.startTime
    const endTime = +a.endTime
    const endAnnotation = {
      ...a,
      id: `${a.id}-end`,
      startTime: `${endTime}`,
      endTime: '',
    }

    if (time < xStart) {
      if (endTime > xStart) {
        return [...acc, a, endAnnotation]
      }

      return acc
    }

    if (time > xEnd) {
      return acc
    }

    // If annotation does not have duration, include in array
    if (!endTime) {
      return [...acc, a]
    }

    // If endTime is out of bounds, just render the start point
    if (endTime > xEnd) {
      return [...acc, a]
    }

    // Render both the start and end point
    return [...acc, a, endAnnotation]
  }, [])
}
