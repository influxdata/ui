import {Sort} from '@influxdata/clockface'

export interface OrgListSortMethod {
  label: string
  sortKey: string
  sortDirection: Sort
}

export const orgListSortMethods = [
  {
    label: 'Sort by Name (A ➞ Z)',
    sortKey: 'name',
    sortDirection: Sort.Descending,
  },
  {
    label: 'Sort by Name (Z ➞ A)',
    sortKey: 'name',
    sortDirection: Sort.Ascending,
  },
  {
    label: 'Sort by Cloud Provider (A ➞ Z)',
    sortKey: 'provider',
    sortDirection: Sort.Descending,
  },
  {
    label: 'Sort by Cloud Provider (Z ➞ A)',
    sortKey: 'provider',
    sortDirection: Sort.Ascending,
  },
  {
    label: 'Sort by Region (A ➞ Z)',
    sortKey: 'regionCode',
    sortDirection: Sort.Descending,
  },
  {
    label: 'Sort by Region (Z ➞ A)',
    sortKey: 'regionCode',
    sortDirection: Sort.Ascending,
  },
  {
    label: 'Sort by Location (A ➞ Z)',
    sortKey: 'regionName',
    sortDirection: Sort.Descending,
  },
  {
    label: 'Sort by Location (Z ➞ A)',
    sortKey: 'regionName',
    sortDirection: Sort.Ascending,
  },
]
