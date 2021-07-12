import moo from 'moo'

const WORD = 'WORD'

const lexer = moo.compile({
  SPACE:      /[ \t]+/,
  NUMBER:  /0|[1-9][0-9]*/,
  WORD: /\w+/,
  HYPHEN: /-/,
  COLON: /:/,
})

// grammar
// DATE_TIME = DATE TIME (PERIOD?) (TIMEZONE?)
// DATE_TIME = MONTH_NAME DAY COMMA YEAR TIME (PERIOD?)
// DATE_TIME = DAY_NAME COMMA MONTH_NAME DAY COMMA YEAR TIME (PERIOD?)

// DATE = YEAR HYPHEN MONTH HYPHEN DAY
// DATE = DAY FORWARD_SLASH MONTH FORWARD_SLASH YEAR
// DATE = MONTH FORWARD_SLASH DAY FORWARD_SLASH YEAR
// DATE = YEAR FORWARD_SLASH MONTH FORWARD_SLASH DAY

// TIME = HOUR COLON MINUTE COLON SECONDS (DOT?) (MILLISECONDS?)

// PERIOD = "AM" | "PM"

// TIMEZONE = WORD

//

// function parseDateTime() {
//
// }

lexer.reset('YYYY-MM-DD hh:mm:ss a')

const tokens = Array.from(lexer);

const MONTH_NAMES = ["January","February","March","April","May","June","July",
  "August","September","October","November","December"]

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

function peek(): moo.Token {
  return tokens[0]
}

function next(): moo.Token {
  return tokens.shift()
}

function parseDateTime() {
  const tok = next()
  if (tok.type === WORD) {
    if (MONTH_NAMES.includes(tok.value)){
      // DATE_TIME = MONTH_NAME DAY COMMA YEAR TIME (PERIOD?)
      parseMonthName()
      parseDay()
      expect(COMMA)
      parseYear()
      parseTime()
      const next = peek()
      if (PERIOD_NAMES.includes(next)){
        parsePeriod()
      }
    }
    else {
      // DATE_TIME = DAY_NAME COMMA MONTH_NAME DAY COMMA YEAR TIME (PERIOD?)
      parseDayName()
      expect(COMMA)
      parseMonthName()
      parseDay()
      expect(COMMA)
      parseYear()
      parseTime()

      const next = peek()
      if (PERIOD_NAMES.includes(next)){
        parsePeriod()
      }
    }
  }
  else {
    // DATE_TIME = DATE TIME (PERIOD?) (TIMEZONE?)
    parseDate()
    parseTime()
    const next = peek()
    if (PERIOD_NAMES.includes(next)){
      parsePeriod()
      const next = peek()
      if (next.value != null){
        parseTimeZone()
      }
    }
  }
}

console.log(tokens)