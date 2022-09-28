const second = 1000
const minute = second * 60
const hour = minute * 60
const day = hour * 24

export interface TimeExpr {
  measure: number
  unit: 's' | 'ms' | 'us' | 'ns' | 'm' | 'h' | 'd'
}

export function parseTime(timeString: string) {
  const result: TimeExpr = {measure: 0, unit: 's'}
  const range: RegExpMatchArray | null = timeString.match(/[-]?[0-9|.]*/)
  if (range) {
    result.measure = parseFloat(range.toString())
    const match: RegExpMatchArray | null = timeString.match(/[mnus].*/)
    if (!match) {
      throw `failed to match timeString to "${timeString}}" to time unit`
    }
    result.unit = match.toString() as TimeExpr['unit']
  }
  return result
}

/* assume number in ms - for now */
function calcTimeStamp(unit: string, prec: string, base: number) {
  let msBase: number = 0
  const now = new Date().getTime()

  switch (unit) {
    case 's':
      msBase = base * second
      break
    case 'm':
      msBase = base * minute
      break
    case 'h':
      msBase = base * hour
      break
    case 'd':
      msBase = base * day
      break
    default:
      throw `Unhandled time unit ${unit}`
  }

  switch (prec) {
    case 's':
      return now / 1000 + msBase / 1000
    case 'ms':
      return now + msBase
    case 'us':
      return now * 1000 + msBase * 1000
    case 'ns':
      return now * 1000 * 1000 + msBase * 1000 * 1000
    default:
      throw `unhandled time precision definition ${prec}`
  }
}

// noinspection DuplicatedCode
export function addTimestampToRecs(
  recs: string[],
  timeDif: string,
  precUnit = 'ns'
) {
  const timeFrame: TimeExpr = parseTime(timeDif)
  const timeStamp = calcTimeStamp(timeFrame.unit, precUnit, timeFrame.measure)
  const result: string[] = []

  recs.forEach(line => {
    if (line.trim().length > 0) {
      result.push(line + ' ' + timeStamp)
    }
  })

  return cy.wrap(result)
}

export function calcNanoTimestamp(timeDif: string) {
  const timeFrame: TimeExpr = parseTime(timeDif)
  return calcTimeStamp(timeFrame.unit, 'ns', timeFrame.measure)
}

export function addStaggerTimestampToRecs(
  recs: string[],
  timeDif: string,
  stagger: string,
  precUnit: 'ns' | 'ms' = 'ns'
) {
  const result: string[] = []

  const timeFrame: TimeExpr = parseTime(timeDif)
  const staggerFrame: TimeExpr = parseTime(stagger)
  if (timeFrame.unit !== staggerFrame.unit) {
    throw `Time units do not match: ${timeFrame.unit} !== ${staggerFrame.unit}`
  }

  for (let i = 0; i < recs.length; i++) {
    if (recs[i].match(/.* .*/)) {
      const timeStamp = calcTimeStamp(
        timeFrame.unit,
        precUnit,
        timeFrame.measure + staggerFrame.measure * i
      )
      result.push(recs[i] + ' ' + timeStamp)
    }
  }
  return cy.wrap(result)
}

/*
The following is for generating richer test data based on trig funcs

examples:
    cy.writeLPData({lines: genCurve({points:60}), offset: "60m", stagger: "1m"})
    cy.writeLPData({lines: genCurve({points:60, freq: 5, shift: 5, pname: 'p1'}), offset: "60m", stagger: "1m"})
    cy.writeLPData({lines: genCurve({points:60, freq: 1, shift: 20, pname: 'p2', amp: 3}), offset: "40m"})
    cy.writeLPData({lines: genCurve({points:60, type: 'tan', measurement: 'krivka', freq: 0.2, pname: 'b1'}), offset: "40m"})
 */

type CurveTypes = 'sin' | 'cos' | 'tan'

export interface CurveArgs {
  points: number
  pname?: string
  shift?: number
  type?: CurveTypes
  freq?: number
  amp?: number
  measurement?: string
  tags?: {key: string; val: string}[]
}

const defaultMeasurement = 'curve'
const defaultTags = [{key: 'loc', val: 'descartes'}]

export function genCurve(args: CurveArgs): string[] {
  args.pname = args.pname ?? 'p'
  args.shift = args.shift ?? 0
  args.type = args.type ?? 'sin'
  args.freq = args.freq ?? 1
  args.amp = args.amp ?? 1
  args.measurement = args.measurement ?? defaultMeasurement
  args.tags = args.tags ?? defaultTags

  const result = []

  let tags = ''
  for (let j = 0; j < args.tags.length; j++) {
    tags += `${args.tags[j].key}=${args.tags[j].val}`
    if (j < args.tags.length - 1) {
      tags += ','
    }
  }

  for (let i = args.shift; i < args.points + args.shift; i++) {
    let point = 0
    point =
      Math[args.type]((i / args.points) * Math.PI * 2 * args.freq) * args.amp
    result[
      i - args.shift
    ] = `${args.measurement},${tags} ${args.pname}=${point}`
  }

  return result
}

export const makeQuartzUseIDPEOrgID = (
  idpeOrgID: string,
  accountType = 'free'
) => {
  cy.fixture('multiOrgAccounts1.json').then(quartzAccounts => {
    cy.intercept('GET', 'api/v2/quartz/accounts', quartzAccounts).as(
      'getQuartzAccounts'
    )
  })

  let fixtureName = 'multiOrgIdentity'
  if (accountType === 'pay_as_you_go') {
    fixtureName = 'multiOrgIdentityPAYG'
  }
  cy.fixture(fixtureName).then(quartzIdentity => {
    quartzIdentity.org.id = idpeOrgID

    cy.intercept('GET', 'api/v2/quartz/identity', quartzIdentity).as(
      'getQuartzIdentity'
    )
  })

  cy.fixture('multiOrgOrgs1').then(quartzOrgs => {
    quartzOrgs[0].id = idpeOrgID

    cy.intercept('GET', 'api/v2/quartz/accounts/**/orgs', quartzOrgs).as(
      'getQuartzOrgs'
    )
  })

  cy.fixture('orgDetails').then(quartzOrgDetails => {
    quartzOrgDetails.id = idpeOrgID
    cy.intercept('GET', 'api/v2/quartz/orgs/*', quartzOrgDetails).as(
      'getQuartzOrgDetails'
    )
  })
}
