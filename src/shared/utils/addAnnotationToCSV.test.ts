import {addAnnotationToCSV} from 'src/shared/utils/addAnnotationToCSV'

describe('addAnnotationToCSV:', () => {
  it('TODO test', () => {
    const inputCSV =
      'name,tags,time,co\nairSensors,,1685053302000000000,0.48846466523558424\n'
    const annotatedCSV =
      '#group,false,false,false,false\n#datatype,string,string,string,string\n#default,,,,\nname,tags,time,co\nairSensors,,1685053302000000000,0.48846466523558424\n'
    expect(addAnnotationToCSV(inputCSV)).toEqual(annotatedCSV)
  })
  // TODO chunchun: more than one table?
})
