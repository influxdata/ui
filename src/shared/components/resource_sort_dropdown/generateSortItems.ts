import {Sort} from '@influxdata/clockface'
import {SortTypes} from 'src/shared/utils/sort'
import {
  ResourceType,
  Dashboard,
  Task,
  Variable,
  Label,
  Template,
  Bucket,
  Telegraf,
  Scraper,
  Authorization,
  Flow,
  Subscription,
} from 'src/types'

export type DashboardSortKey = keyof Dashboard | 'meta.updatedAt'
export type TaskSortKey = keyof Task
export type VariableSortKey = keyof Variable | 'arguments.type'
export type SecretSortKey = string
export type LabelSortKey = keyof Label | 'properties.description'
export type TemplateSortKey = keyof Template | 'meta.name' | 'meta.description'
export type BucketSortKey = keyof Bucket | 'retentionRules[0].everySeconds'
export type TelegrafSortKey = keyof Telegraf
export type ScraperSortKey = keyof Scraper
export type AuthorizationSortKey = keyof Authorization
export type FlowSortKey = keyof Flow
export type SubscriptionKey = keyof Subscription

export type SortKey =
  | DashboardSortKey
  | TaskSortKey
  | VariableSortKey
  | SecretSortKey
  | LabelSortKey
  | TemplateSortKey
  | BucketSortKey
  | TelegrafSortKey
  | ScraperSortKey
  | AuthorizationSortKey
  | FlowSortKey
  | SubscriptionKey

export interface SortDropdownItem {
  label: string
  sortKey: SortKey
  sortType: SortTypes
  sortDirection: Sort
}

export const generateSortItems = (
  resourceType: ResourceType
): SortDropdownItem[] => {
  switch (resourceType) {
    case ResourceType.Dashboards:
      return [
        {
          label: 'Name (A → Z)',
          sortKey: 'name',
          sortType: SortTypes.String,
          sortDirection: Sort.Ascending,
        },
        {
          label: 'Name (Z → A)',
          sortKey: 'name',
          sortType: SortTypes.String,
          sortDirection: Sort.Descending,
        },
        {
          label: 'Modified (Oldest)',
          sortKey: 'meta.updatedAt',
          sortType: SortTypes.Date,
          sortDirection: Sort.Ascending,
        },
        {
          label: 'Modified (Newest)',
          sortKey: 'meta.updatedAt',
          sortType: SortTypes.Date,
          sortDirection: Sort.Descending,
        },
      ]
    case ResourceType.Tasks:
      return [
        {
          label: 'Name (A → Z)',
          sortKey: 'name',
          sortType: SortTypes.String,
          sortDirection: Sort.Ascending,
        },
        {
          label: 'Name (Z → A)',
          sortKey: 'name',
          sortType: SortTypes.String,
          sortDirection: Sort.Descending,
        },
        {
          label: 'Active',
          sortKey: 'status',
          sortType: SortTypes.String,
          sortDirection: Sort.Ascending,
        },
        {
          label: 'Inactive',
          sortKey: 'status',
          sortType: SortTypes.String,
          sortDirection: Sort.Descending,
        },
        {
          label: 'Completed (Oldest)',
          sortKey: 'latestCompleted',
          sortType: SortTypes.Date,
          sortDirection: Sort.Ascending,
        },
        {
          label: 'Completed (Newest)',
          sortKey: 'latestCompleted',
          sortType: SortTypes.Date,
          sortDirection: Sort.Descending,
        },
        {
          label: 'Schedule (Most Often)',
          sortKey: 'every',
          sortType: SortTypes.String,
          sortDirection: Sort.Ascending,
        },
        {
          label: 'Schedule (Least Often)',
          sortKey: 'every',
          sortType: SortTypes.String,
          sortDirection: Sort.Descending,
        },
      ]
    case ResourceType.Variables:
      return [
        {
          label: 'Name (A → Z)',
          sortKey: 'name',
          sortType: SortTypes.String,
          sortDirection: Sort.Ascending,
        },
        {
          label: 'Name (Z → A)',
          sortKey: 'name',
          sortType: SortTypes.String,
          sortDirection: Sort.Descending,
        },
        {
          label: 'Type (A → Z)',
          sortKey: 'arguments.type',
          sortType: SortTypes.String,
          sortDirection: Sort.Ascending,
        },
        {
          label: 'Type (Z → A)',
          sortKey: 'arguments.type',
          sortType: SortTypes.String,
          sortDirection: Sort.Descending,
        },
      ]
    case ResourceType.Secrets:
      return [
        {
          label: 'Name (A → Z)',
          sortKey: 'id',
          sortType: SortTypes.String,
          sortDirection: Sort.Ascending,
        },
        {
          label: 'Name (Z → A)',
          sortKey: 'id',
          sortType: SortTypes.String,
          sortDirection: Sort.Descending,
        },
      ]
    case ResourceType.Labels:
      return [
        {
          label: 'Name (A → Z)',
          sortKey: 'name',
          sortType: SortTypes.String,
          sortDirection: Sort.Ascending,
        },
        {
          label: 'Name (Z → A)',
          sortKey: 'name',
          sortType: SortTypes.String,
          sortDirection: Sort.Descending,
        },
        {
          label: 'Description (A → Z)',
          sortKey: 'properties.description',
          sortType: SortTypes.String,
          sortDirection: Sort.Ascending,
        },
        {
          label: 'Description (Z → A)',
          sortKey: 'properties.description',
          sortType: SortTypes.String,
          sortDirection: Sort.Descending,
        },
      ]
    case ResourceType.Templates:
      return [
        {
          label: 'Name (A → Z)',
          sortKey: 'meta.name',
          sortType: SortTypes.String,
          sortDirection: Sort.Ascending,
        },
        {
          label: 'Name (Z → A)',
          sortKey: 'meta.name',
          sortType: SortTypes.String,
          sortDirection: Sort.Descending,
        },
        {
          label: 'Description (A → Z)',
          sortKey: 'meta.description',
          sortType: SortTypes.String,
          sortDirection: Sort.Ascending,
        },
        {
          label: 'Description (Z → A)',
          sortKey: 'meta.description',
          sortType: SortTypes.String,
          sortDirection: Sort.Descending,
        },
      ]
    case ResourceType.Buckets:
      return [
        {
          label: 'Name (A → Z)',
          sortKey: 'name',
          sortType: SortTypes.String,
          sortDirection: Sort.Ascending,
        },
        {
          label: 'Name (Z → A)',
          sortKey: 'name',
          sortType: SortTypes.String,
          sortDirection: Sort.Descending,
        },
        {
          label: 'Retention (Ascending)',
          sortKey: 'retentionRules[0].everySeconds',
          sortType: SortTypes.Float,
          sortDirection: Sort.Ascending,
        },
        {
          label: 'Retention (Descending)',
          sortKey: 'retentionRules[0].everySeconds',
          sortType: SortTypes.Float,
          sortDirection: Sort.Descending,
        },
      ]
    case ResourceType.Telegrafs:
      return [
        {
          label: 'Name (A → Z)',
          sortKey: 'name',
          sortType: SortTypes.String,
          sortDirection: Sort.Ascending,
        },
        {
          label: 'Name (Z → A)',
          sortKey: 'name',
          sortType: SortTypes.String,
          sortDirection: Sort.Descending,
        },
        {
          label: 'Description (Ascending)',
          sortKey: 'description',
          sortType: SortTypes.String,
          sortDirection: Sort.Ascending,
        },
        {
          label: 'Description (Descending)',
          sortKey: 'description',
          sortType: SortTypes.String,
          sortDirection: Sort.Descending,
        },
      ]
    case ResourceType.Scrapers:
      return [
        {
          label: 'Name (A → Z)',
          sortKey: 'name',
          sortType: SortTypes.String,
          sortDirection: Sort.Ascending,
        },
        {
          label: 'Name (Z → A)',
          sortKey: 'name',
          sortType: SortTypes.String,
          sortDirection: Sort.Descending,
        },
        {
          label: 'URL (Ascending)',
          sortKey: 'url',
          sortType: SortTypes.String,
          sortDirection: Sort.Ascending,
        },
        {
          label: 'URL (Descending)',
          sortKey: 'url',
          sortType: SortTypes.String,
          sortDirection: Sort.Descending,
        },
        {
          label: 'Bucket (Ascending)',
          sortKey: 'bucket',
          sortType: SortTypes.String,
          sortDirection: Sort.Ascending,
        },
        {
          label: 'Bucket (Descending)',
          sortKey: 'bucket',
          sortType: SortTypes.String,
          sortDirection: Sort.Descending,
        },
      ]
    case ResourceType.Authorizations:
      return [
        {
          label: 'Description (A → Z)',
          sortKey: 'description',
          sortType: SortTypes.String,
          sortDirection: Sort.Ascending,
        },
        {
          label: 'Description (Z → A)',
          sortKey: 'description',
          sortType: SortTypes.String,
          sortDirection: Sort.Descending,
        },
        {
          label: 'Status (Active)',
          sortKey: 'status',
          sortType: SortTypes.String,
          sortDirection: Sort.Ascending,
        },
        {
          label: 'Status (Inactive)',
          sortKey: 'status',
          sortType: SortTypes.String,
          sortDirection: Sort.Descending,
        },
        {
          label: 'Date Created (Oldest)',
          sortKey: 'createdAt',
          sortType: SortTypes.String,
          sortDirection: Sort.Ascending,
        },
        {
          label: 'Date Created (Newest)',
          sortKey: 'createdAt',
          sortType: SortTypes.String,
          sortDirection: Sort.Descending,
        },
      ]
    case ResourceType.Flows:
      return [
        {
          label: 'Name (A → Z)',
          sortKey: 'name',
          sortType: SortTypes.String,
          sortDirection: Sort.Ascending,
        },
        {
          label: 'Name (Z → A)',
          sortKey: 'name',
          sortType: SortTypes.String,
          sortDirection: Sort.Descending,
        },
        {
          label: 'Created (Oldest)',
          sortKey: 'createdAt',
          sortType: SortTypes.Date,
          sortDirection: Sort.Ascending,
        },
        {
          label: 'Created (Newest)',
          sortKey: 'createdAt',
          sortType: SortTypes.Date,
          sortDirection: Sort.Descending,
        },
      ]
    case ResourceType.Subscriptions:
      return [
        {
          label: 'Name (A → Z)',
          sortKey: 'name',
          sortType: SortTypes.String,
          sortDirection: Sort.Ascending,
        },
        {
          label: 'Name (Z → A)',
          sortKey: 'name',
          sortType: SortTypes.String,
          sortDirection: Sort.Descending,
        },
        {
          label: 'Updated (Oldest)',
          sortKey: 'updatedAt',
          sortType: SortTypes.Date,
          sortDirection: Sort.Ascending,
        },
        {
          label: 'Updated (Newest)',
          sortKey: 'updatedAt',
          sortType: SortTypes.Date,
          sortDirection: Sort.Descending,
        },
      ]
  }
}
