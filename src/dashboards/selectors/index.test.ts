// Funcs
import {mocked} from 'ts-jest/utils'
import {
  getTimeRange,
  getTimeRangeWithTimezone,
  setTimeToUTC,
} from 'src/dashboards/selectors/index'
import {getTimezoneOffset} from 'src/dashboards/utils/getTimezoneOffset'

jest.mock('src/dashboards/utils/getTimezoneOffset')

// Types
import {RangeState} from 'src/dashboards/reducers/ranges'
import {CurrentDashboardState} from 'src/shared/reducers/currentDashboard'
import {TimeRange, TimeZone, CustomTimeRange} from 'src/types'
import {AppState as AppPresentationState} from 'src/shared/reducers/app'

// Constants
import {
  DEFAULT_TIME_RANGE,
  pastFifteenMinTimeRange,
  pastHourTimeRange,
} from 'src/shared/constants/timeRanges'

const untypedGetTimeRangeByDashboardID = getTimeRange as (a: {
  ranges: RangeState
  currentDashboard: CurrentDashboardState
}) => TimeRange

const untypedGetTimeRangeWithTimeZone = getTimeRangeWithTimezone as (a: {
  ranges: RangeState
  currentDashboard: CurrentDashboardState
  app: AppPresentationState
}) => TimeRange

describe('Dashboards.Selector', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  const dashboardIDs = [
    '04c6f3976f4b8001',
    '04c6f3976f4b8000',
    '04c6f3976f4b8002',
    '04c6f3976f4b8003',
    '04c6f3976f4b8004',
    '04c6f3976f4b8005',
  ]
  const customTimeRangePST = {
    lower: '2020-05-05T10:00:00-07:00',
    upper: '2020-05-05T11:00:00-07:00',
    type: 'custom',
  } as CustomTimeRange
  const customTimeRangeCET = {
    lower: '2020-05-05T10:00:00+02:00',
    upper: '2020-05-05T11:00:00+02:00',
    type: 'custom',
  } as CustomTimeRange
  const customTimeRangeGMT = {
    lower: '2020-05-05T10:00:00+00:00',
    upper: '2020-05-05T11:00:00+00:00',
    type: 'custom',
  } as CustomTimeRange
  const customTimeRangeUTC = {
    lower: '2021-07-17T14:00:00.000Z',
    upper: '2021-07-17T16:00:00.000Z',
    type: 'custom',
  } as CustomTimeRange
  const ranges: RangeState = {
    [dashboardIDs[0]]: pastFifteenMinTimeRange,
    [dashboardIDs[1]]: pastHourTimeRange,
    [dashboardIDs[2]]: customTimeRangePST,
    [dashboardIDs[3]]: customTimeRangeCET,
    [dashboardIDs[4]]: customTimeRangeGMT,
    [dashboardIDs[5]]: customTimeRangeUTC,
  }

  it('should return the correct range when a matching dashboard ID is found', () => {
    const currentDashboard = {id: dashboardIDs[0]}

    expect(
      untypedGetTimeRangeByDashboardID({ranges, currentDashboard})
    ).toEqual(pastFifteenMinTimeRange)
  })

  it('should return the default range when no matching dashboard ID is found', () => {
    const currentDashboard = {id: 'Oogum Boogum'}

    expect(
      untypedGetTimeRangeByDashboardID({ranges, currentDashboard})
    ).toEqual(DEFAULT_TIME_RANGE)
  })

  it('should return the default range when no ranges are passed in', () => {
    const currentDashboard = {id: dashboardIDs[0]}

    expect(
      untypedGetTimeRangeByDashboardID({ranges: {}, currentDashboard})
    ).toEqual(DEFAULT_TIME_RANGE)
  })

  it('should return an unmodified version of the timeRange when the timeZone is local', () => {
    const currentDashboard = {id: dashboardIDs[2]}
    const app: AppPresentationState = {
      ephemeral: {
        inPresentationMode: false,
        hasUpdatedTimeRangeInVEO: false,
      },
      persisted: {
        autoRefresh: 0,
        showTemplateControlBar: false,
        navBarState: 'expanded',
        timeZone: 'Local' as TimeZone,
        theme: 'dark',
        versionInfo: {version: '', commit: ''},
      },
    }

    expect(
      untypedGetTimeRangeWithTimeZone({ranges, currentDashboard, app})
    ).toEqual(customTimeRangePST)
  })

  it('should return the timeRange for the same hour with a UTC timezone when the timeZone is UTC and the locale is 7 timezones behind UTC', () => {
    const currentDashboard = {id: dashboardIDs[2]}

    const app: AppPresentationState = {
      ephemeral: {
        inPresentationMode: false,
        hasUpdatedTimeRangeInVEO: false,
      },
      persisted: {
        autoRefresh: 0,
        showTemplateControlBar: false,
        navBarState: 'expanded',
        timeZone: 'UTC' as TimeZone,
        theme: 'dark',
        versionInfo: {version: '', commit: ''},
      },
    }

    const expected = {
      lower: `2020-05-05T10:00:00Z`,
      upper: `2020-05-05T11:00:00Z`,
      type: 'custom',
    }
    // Offset for PST
    mocked(getTimezoneOffset).mockImplementation(() => 420)

    expect(
      untypedGetTimeRangeWithTimeZone({ranges, currentDashboard, app})
    ).toEqual(expected)
  })

  it('should return the timeRange for the same hour with a UTC timezone when the timeZone is UTC and the locale is 2 timezones ahead of UTC', () => {
    const currentDashboard = {id: dashboardIDs[3]}

    const app: AppPresentationState = {
      ephemeral: {
        inPresentationMode: false,
        hasUpdatedTimeRangeInVEO: false,
      },
      persisted: {
        autoRefresh: 0,
        showTemplateControlBar: false,
        navBarState: 'expanded',
        timeZone: 'UTC' as TimeZone,
        theme: 'dark',
        versionInfo: {version: '', commit: ''},
      },
    }

    const expected = {
      lower: `2020-05-05T10:00:00Z`,
      upper: `2020-05-05T11:00:00Z`,
      type: 'custom',
    }
    // Offset for CET
    mocked(getTimezoneOffset).mockImplementation(() => -120)

    expect(
      untypedGetTimeRangeWithTimeZone({ranges, currentDashboard, app})
    ).toEqual(expected)
  })

  it('should return the same timeRange when the time is already in UTC', () => {
    const currentDashboard = {id: dashboardIDs[5]}

    const app: AppPresentationState = {
      ephemeral: {
        inPresentationMode: false,
        hasUpdatedTimeRangeInVEO: false,
      },
      persisted: {
        autoRefresh: 0,
        showTemplateControlBar: false,
        navBarState: 'expanded',
        timeZone: 'UTC' as TimeZone,
        theme: 'dark',
        versionInfo: {version: '', commit: ''},
      },
    }

    const expected = customTimeRangeUTC

    mocked(getTimezoneOffset).mockImplementation(() => 0)

    expect(
      untypedGetTimeRangeWithTimeZone({ranges, currentDashboard, app})
    ).toEqual(expected)
  })

  it('should return the timeRange when the timezone has no offset', () => {
    const currentDashboard = {id: dashboardIDs[4]}

    const app: AppPresentationState = {
      ephemeral: {
        inPresentationMode: false,
        hasUpdatedTimeRangeInVEO: false,
      },
      persisted: {
        autoRefresh: 0,
        showTemplateControlBar: false,
        navBarState: 'expanded',
        timeZone: 'UTC' as TimeZone,
        theme: 'dark',
        versionInfo: {version: '', commit: ''},
      },
    }

    const expected = {
      lower: `2020-05-05T10:00:00Z`,
      upper: `2020-05-05T11:00:00Z`,
      type: 'custom',
    }

    mocked(getTimezoneOffset).mockImplementation(() => 0)

    expect(
      untypedGetTimeRangeWithTimeZone({ranges, currentDashboard, app})
    ).toEqual(expected)
  })
})

describe('Dashboards.Selector helper method(s)', () => {
  it('should swap the time zone with UTC without affecting the hours when local timezone is GMT-7', () => {
    // Example: user selected 10-11:00am and sets the dropdown to UTC
    // Query should run against 10-11:00am UTC rather than querying
    // 10-11:00am local time (offset depending on timezone)

    const localTimeString = '2021-07-04 12:00:00 GMT-7'
    const expectedUTCTime = '2021-07-04T12:00:00Z'

    // mock the time zone offset for GMT-7
    mocked(getTimezoneOffset).mockImplementation(() => 420)

    expect(setTimeToUTC(localTimeString)).toEqual(expectedUTCTime)
  })

  it('should swap the time zone with UTC without affecting the hours when local timezone is GMT-5', () => {
    // Example: user selected 10-11:00am and sets the dropdown to UTC
    // Query should run against 10-11:00am UTC rather than querying
    // 10-11:00am local time (offset depending on timezone)

    const localTimeString = '2021-07-04 12:00:00 GMT-5'
    const expectedUTCTime = '2021-07-04T12:00:00Z'

    // mock the time zone offset for GMT-5
    mocked(getTimezoneOffset).mockImplementation(() => 300)

    expect(setTimeToUTC(localTimeString)).toEqual(expectedUTCTime)
  })

  it('should swap the time zone with UTC without affecting the hours when local timezone is GMT', () => {
    // Example: user selected 10-11:00am and sets the dropdown to UTC
    // Query should run against 10-11:00am UTC rather than querying
    // 10-11:00am local time (offset depending on timezone)

    const localTimeString = '2021-07-04 12:00:00 GMT'
    const expectedUTCTime = '2021-07-04T12:00:00Z'

    // mock the time zone offset for GMT
    mocked(getTimezoneOffset).mockImplementation(() => 0)

    expect(setTimeToUTC(localTimeString)).toEqual(expectedUTCTime)
  })
})
