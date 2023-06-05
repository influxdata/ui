// Annotation row format:
// https://docs.influxdata.com/influxdb/cloud/reference/syntax/annotated-csv
export const addAnnotationToCSV = (csv: string): string => {
  if (!csv) {
    return csv
  }

  // get number of columns
  const headerRow = csv.split('\n')[0]
  const headerSize = headerRow.split(',').length

  // #group, #datatype, and #default are required
  // https://docs.influxdata.com/influxdb/cloud/reference/syntax/annotated-csv/#annotations
  const group: string[] = ['#group']
  const dataType: string[] = ['#datatype']
  const dflt: string[] = ['#default']

  for (let i = 0; i < headerSize; i++) {
    group.push('false')
    dataType.push('string')
    dflt.push('')
  }

  return [[...group], [...dataType], [...dflt], []]
    .map(row => {
      return row.join(',')
    })
    .join('\n')
    .concat(csv)
}
