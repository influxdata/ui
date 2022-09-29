import {AppState} from 'src/types'
import {DEFAULT_TIME_FORMAT} from 'src/utils/datetime/constants'
import {getTimeFormatForView} from 'src/views/selectors/index'

const MOCK_APP_STATE = {
  app: {
    persisted: {
      timeZone: 'UTC',
    },
  },
  currentDashboard: {
    id: '',
  },
  resources: {
    views: {
      status: 'Done',
      byID: {
        mock_cell_id_with_DEFAULT_TIME_FORMAT: {
          id: 'mock_cell_id_with_DEFAULT_TIME_FORMAT',
          name: 'dummy cell',
          status: 'Done',
          cellID: 'mock_cell_id_with_DEFAULT_TIME_FORMAT',
          properties: {
            timeFormat: DEFAULT_TIME_FORMAT,
          },
          dashboardID: 'mock_dashboard_id',
        },
        mock_cell_id_with_NO_TIME_FORMAT: {
          id: 'mock_cell_id_with_NO_TIME_FORMAT',
          name: 'dummy cell',
          status: 'Done',
          cellID: 'mock_cell_id_with_NO_TIME_FORMAT',
          properties: {
            timeFormat: '',
          },
          dashboardID: 'mock_dashboard_id',
        },
        'mock_cell_id_with_YYYY-MM-DD HH:mm:ss.sss': {
          id: 'mock_cell_id_with_YYYY-MM-DD HH:mm:ss.sss',
          name: 'dummy cell',
          status: 'Done',
          cellID: 'mock_cell_id_with_YYYY-MM-DD HH:mm:ss.sss',
          properties: {
            timeFormat: 'YYYY-MM-DD HH:mm:ss.sss',
          },
          dashboardID: 'mock_dashboard_id',
        },
        mock_cell_id_with_NO_PROPERTIES: {
          id: 'mock_cell_id_with_NO_PROPERTIES',
          name: 'dummy cell',
          status: 'Done',
          cellID: 'mock_cell_id_with_NO_PROPERTIES',
          dashboardID: 'mock_dashboard_id',
        },
        mock_cell_id_with_EMPTY_PROPERTIES: {
          id: 'mock_cell_id_with_EMPTY_PROPERTIES',
          name: 'dummy cell',
          status: 'Done',
          cellID: 'mock_cell_id_with_EMPTY_PROPERTIES',
          properties: {},
          dashboardID: 'mock_dashboard_id',
        },
      },
      allIDs: [
        'mock_cell_id_with_DEFAULT_TIME_FORMAT',
        'mock_cell_id_with_NO_TIME_FORMAT',
      ],
    },
  },
} as any as AppState

describe('Views.Selectors', () => {
  describe('getTimeFormatForView', () => {
    it("should return the default time format for a cell when cell's format is the constant DEFAULT_TIME_FORMAT", () => {
      const timeFormat = getTimeFormatForView(
        MOCK_APP_STATE,
        'mock_cell_id_with_DEFAULT_TIME_FORMAT'
      )
      expect(timeFormat).toBe(DEFAULT_TIME_FORMAT)
    })

    it("should return the default time format for a cell when cell's format is an empty string", () => {
      const timeFormat = getTimeFormatForView(
        MOCK_APP_STATE,
        'mock_cell_id_with_NO_TIME_FORMAT'
      )
      expect(timeFormat).toBe(DEFAULT_TIME_FORMAT)
    })

    it("should return the correct time format for a cell when cell's format is YYYY-MM-DD HH:mm:ss.sss", () => {
      const timeFormat = getTimeFormatForView(
        MOCK_APP_STATE,
        'mock_cell_id_with_YYYY-MM-DD HH:mm:ss.sss'
      )
      expect(timeFormat).toBe('YYYY-MM-DD HH:mm:ss.sss')
    })

    it("should return the default time format for a cell when cell's view.properties is absent", () => {
      const timeFormat = getTimeFormatForView(
        MOCK_APP_STATE,
        'mock_cell_id_with_NO_PROPERTIES'
      )
      expect(timeFormat).toBe(DEFAULT_TIME_FORMAT)
    })

    it("should return the default time format for a cell when cell's view.properties is {} (empty, but not absent)", () => {
      const timeFormat = getTimeFormatForView(
        MOCK_APP_STATE,
        'mock_cell_id_with_EMPTY_PROPERTIES'
      )
      expect(timeFormat).toBe(DEFAULT_TIME_FORMAT)
    })
  })
})
