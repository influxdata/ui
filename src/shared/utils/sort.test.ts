import {createDateTimeFormatter} from 'src/utils/datetime/formatters'
import {DEFAULT_TIME_FORMAT} from 'src/utils/datetime/constants'

import {getSortedResources, SortTypes} from 'src/shared/utils/sort'

describe('getSortedResources', () => {
  describe('sorting strings', () => {
    it('sorts naturally, not lexicographically', () => {
      const resources = [
        {name: 'resource 2'},
        {name: 'zoology'},
        {name: 'resource 1'},
      ]
      expect(
        getSortedResources(resources, 'name', 'asc', SortTypes.String)
      ).toEqual([{name: 'resource 1'}, {name: 'resource 2'}, {name: 'zoology'}])
    })

    it('sorts in descending order as well', () => {
      const resources = [
        {name: 'resource 2'},
        {name: 'zoology'},
        {name: 'resource 1'},
      ]
      expect(
        getSortedResources(resources, 'name', 'desc', SortTypes.String)
      ).toEqual([{name: 'zoology'}, {name: 'resource 2'}, {name: 'resource 1'}])
    })
  })

  describe('sorting dates', () => {
    const dateTimeFormatter = createDateTimeFormatter(
      DEFAULT_TIME_FORMAT,
      'UTC'
    )

    it('sorts dates in ascending order', () => {
      const resources = [
        {date: dateTimeFormatter.format(new Date(1630350000000)), name: '1'},
        {date: dateTimeFormatter.format(new Date(1630450000000)), name: '2'},
        {date: dateTimeFormatter.format(new Date(1630150000000)), name: '3'},
      ]
      expect(
        getSortedResources(resources, 'date', 'asc', SortTypes.Date)
      ).toEqual([
        {
          date: '2021-08-28 11:26:40',
          name: '3',
        },
        {
          date: '2021-08-30 19:00:00',
          name: '1',
        },
        {
          date: '2021-08-31 22:46:40',
          name: '2',
        },
      ])
    })

    it('sorts dates in descending order', () => {
      const resources = [
        {date: dateTimeFormatter.format(new Date(1630350000000)), name: '1'},
        {date: dateTimeFormatter.format(new Date(1630450000000)), name: '2'},
        {date: dateTimeFormatter.format(new Date(1630150000000)), name: '3'},
      ]
      expect(
        getSortedResources(resources, 'date', 'desc', SortTypes.Date)
      ).toEqual([
        {
          date: '2021-08-31 22:46:40',
          name: '2',
        },
        {
          date: '2021-08-30 19:00:00',
          name: '1',
        },
        {
          date: '2021-08-28 11:26:40',
          name: '3',
        },
      ])
    })
  })
})
