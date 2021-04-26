import {DEFAULT_TIME_FORMAT} from 'src/shared/constants'

export const FORMAT_OPTIONS: Array<{text: string}> = [
  {text: DEFAULT_TIME_FORMAT}, // 'YYYY-MM-DD HH:mm:ss ZZ'
  {text: 'YYYY-MM-DD hh:mm:ss a ZZ'},
  {text: 'DD/MM/YYYY HH:mm:ss.sss'},
  {text: 'DD/MM/YYYY hh:mm:ss.sss a'},
  {text: 'MM/DD/YYYY HH:mm:ss.sss'},
  {text: 'MM/DD/YYYY hh:mm:ss.sss a'},
  {text: 'YYYY/MM/DD HH:mm:ss'},
  {text: 'YYYY/MM/DD hh:mm:ss a'},
  {text: 'HH:mm'},
  {text: 'hh:mm a'},
  {text: 'HH:mm:ss'},
  {text: 'hh:mm:ss a'},
  {text: 'HH:mm:ss ZZ'},
  {text: 'hh:mm:ss a ZZ'},
  {text: 'HH:mm:ss.sss'},
  {text: 'hh:mm:ss.sss a'},
  {text: 'MMMM D, YYYY HH:mm:ss'},
  {text: 'MMMM D, YYYY hh:mm:ss a'},
  {text: 'dddd, MMMM D, YYYY HH:mm:ss'},
  {text: 'dddd, MMMM D, YYYY hh:mm:ss a'},
]

export const resolveTimeFormat = (timeFormat: string) => {
  if (FORMAT_OPTIONS.find(d => d.text === timeFormat)) {
    console.log('found something....', timeFormat)
    return timeFormat
  }

  console.log('using default time format: ', DEFAULT_TIME_FORMAT)
  return DEFAULT_TIME_FORMAT
}
