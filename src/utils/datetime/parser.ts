// types of formats supported that needs parsing
// YYYY-MM-DD hh:mm:ss a
// YYYY-MM-DD hh:mm:ss a ZZ
// YYYY-MM-DD HH:mm:ss
// YYYY-MM-DD HH:mm
// DD/MM/YYYY HH:mm:ss.sss
// DD/MM/YYYY hh:mm:ss.sss a
// MM/DD/YYYY HH:mm:ss.sss
// MM/DD/YYYY hh:mm:ss.sss a
// YYYY/MM/DD HH:mm:ss
// YYYY/MM/DD hh:mm:ss a

// MMMM D, YYYY HH:mm:ss
// MMMM D, YYYY hh:mm:ss a
// dddd, MMMM D, YYYY HH:mm:ss
// dddd, MMMM D, YYYY hh:mm:ss a

import {createDateTimeFormatter} from './formatters'

export type DateTime = {
  year: number
  month: number
  day: number
  hours: number
  minutes: number
  seconds?: number
  milliseconds?: number
  period?: string // AM or PM
  timezone?: string
}

export class Lexer {
  private tokens: string[] = []
  public dateTime: DateTime = {
    year: 0,
    month: 0,
    day: 0,
    hours: 0,
    minutes: 0
  }
  constructor(inputString: string) {
    // two basic cases
    // doesnt have comma
    if (!inputString.includes(',')){
      this.tokens = inputString.split(' ')
      this.parseDate()
      // this.parseTime()
      // this.parsePeriod()
      // this.parseTimeZone()
    }
    else {

    }


    // has comma
  }

  private parseDate() {
    // YYYY-MM-DD
    const date = this.getToken()
    if (date.includes('-')){
      this.dateTime.year = parseInt(date.split('-')[0])
      this.dateTime.month = parseInt(date.split('-')[1])
      this.dateTime.day = parseInt(date.split('-')[2])
    }
    else if (date.includes('/')){
      const parts = date.split('/')
      if (parseInt(parts[0]) > 31){
        // YYYY/MM/DD
        this.dateTime.year = parseInt(parts[0])
        this.dateTime.month = parseInt(parts[1])
        this.dateTime.day = parseInt(parts[2])
      }
      else if (parseInt(parts[0]) <= 12) {
        // MM/DD/YYYY
        this.dateTime.month = parseInt(parts[0])
        this.dateTime.day = parseInt(parts[1])
        this.dateTime.year = parseInt(parts[2])
      }
      else {
        // DD/MM/YYYY
        this.dateTime.day = parseInt(parts[0])
        this.dateTime.month = parseInt(parts[1])
        this.dateTime.year = parseInt(parts[2])
      }
    }
  }

  private parseTime() {
    // hh:mm:ss
    // HH:mm:ss
    // HH:mm
    // HH:mm:ss.sss
    // hh:mm:ss.sss

  }


  public getToken(): string {
    // shift removes the first item in the array and returns it
    return this.tokens.shift()
  }

}

export function parse() {
  //  DD/MM/YYYY
  const date = new Date()

  const formatter = createDateTimeFormatter('YYYY-MM-DD hh:mm:ss a ZZ')
  const formattedString = formatter.format(date)

  console.log(formattedString)
}