import {DEFAULT_TIME_FORMAT} from 'src/shared/constants'

export const FORMAT_OPTIONS: Array<{text: string}> = [
  {text: DEFAULT_TIME_FORMAT},
  {text: 'DD/MM/YYYY HH:mm:ss.sss'},
  {text: 'MM/DD/YYYY HH:mm:ss.sss'},
  {text: 'YYYY/MM/DD HH:mm:ss'},
  {text: 'hh:mm a'},
  {text: 'HH:mm'},
  {text: 'HH:mm:ss'},
  {text: 'HH:mm:ss ZZ'},
  {text: 'HH:mm:ss.sss'},
  {text: 'MMMM D, YYYY HH:mm:ss'},
  {text: 'dddd, MMMM D, YYYY HH:mm:ss'},
]

export const resolveTimeFormat = (timeFormat: string) => {
  if (FORMAT_OPTIONS.find(d => d.text === timeFormat)) {
    return timeFormat
  }

  return DEFAULT_TIME_FORMAT
}
