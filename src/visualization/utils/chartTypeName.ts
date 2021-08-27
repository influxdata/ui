// mapping view type to a custom type name
export const chartTypeName = (type: string): string => {
  if (!type) {
    return 'undefined_view'
  }

  switch (type) {
    case 'xy': {
      return 'xyplot'
    }
  }
  return type
}
