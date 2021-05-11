// mapping view type to a custom type name
export const chartTypeName = (type: string): string => {
  switch (type) {
    case 'xy':
      return 'xyplot'
  }
  return type
}
