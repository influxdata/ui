import {addAnnotationToCSV} from 'src/shared/utils/addAnnotationToCSV'

describe('addAnnotationToCSV:', () => {
  it('happy path', () => {
    const inputCSV =
      'name,tags,time,co\nairSensors,,1685053302000000000,0.48846466523558424\n'
    const expectedCSV =
      '#group,false,false,false,false\n#datatype,string,string,string,string\n#default,,,,\nname,tags,time,co\nairSensors,,1685053302000000000,0.48846466523558424\n'
    expect(addAnnotationToCSV(inputCSV)).toEqual(expectedCSV)
  })
  it('returns an empty csv if the input is empty', () => {
    expect(addAnnotationToCSV('')).toEqual('')
  })
  it('returns an empty csv if the input is null', () => {
    expect(addAnnotationToCSV(null)).toEqual('')
  })
})
