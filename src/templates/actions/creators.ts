// Types
import {
  CommunityTemplate,
  RemoteDataState,
  TemplateSummaryEntities,
} from 'src/types'
import {DocumentCreate} from '@influxdata/influx'
import {NormalizedSchema} from 'normalizr'

import {InstalledStack} from 'src/types'

export const ADD_TEMPLATE_SUMMARY = 'ADD_TEMPLATE_SUMMARY'
export const GET_TEMPLATE_SUMMARIES_FOR_ORG = 'GET_TEMPLATE_SUMMARIES_FOR_ORG'
export const SET_STAGED_TEMPLATE = 'SET_STAGED_TEMPLATE'
export const SET_STAGED_TEMPLATE_URL = 'SET_STAGED_TEMPLATE_URL'
export const SET_EXPORT_TEMPLATE = 'SET_EXPORT_TEMPLATE'
export const TOGGLE_TEMPLATE_RESOURCE_INSTALL =
  'TOGGLE_TEMPLATE_RESOURCE_INSTALL'
export const UPDATE_TEMPLATE_ENV_REF = 'UPDATE_TEMPLATE_ENV_REF'

export const SET_STACKS = 'SET_STACKS'
export const DELETE_STACKS = 'DELETE_STACKS'
export const SET_TEMPLATE_README = 'SET_TEMPLATE_README'

export type EnvRefValue = string | number | boolean

export type Action =
  | ReturnType<typeof addTemplateSummary>
  | ReturnType<typeof setExportTemplate>
  | ReturnType<typeof setStagedCommunityTemplate>
  | ReturnType<typeof setStagedTemplateUrl>
  | ReturnType<typeof toggleTemplateResourceInstall>
  | ReturnType<typeof updateTemplateEnvReferences>
  | ReturnType<typeof setStacks>
  | ReturnType<typeof removeStack>
  | ReturnType<typeof setTemplateReadMe>

type TemplateSummarySchema<R extends string | string[]> = NormalizedSchema<
  TemplateSummaryEntities,
  R
>

// Action Creators
export const addTemplateSummary = (schema: TemplateSummarySchema<string>) =>
  ({
    type: ADD_TEMPLATE_SUMMARY,
    schema,
  } as const)

export const setExportTemplate = (
  status: RemoteDataState,
  item?: DocumentCreate
) =>
  ({
    type: SET_EXPORT_TEMPLATE,
    status,
    item,
  } as const)

export const setStagedCommunityTemplate = (template: CommunityTemplate) =>
  ({
    type: SET_STAGED_TEMPLATE,
    template,
  } as const)

export const setStagedTemplateUrl = (templateUrl: string) =>
  ({
    type: SET_STAGED_TEMPLATE_URL,
    templateUrl,
  } as const)

export const updateTemplateEnvReferences = (
  envRefKey: string,
  resourceField: string,
  newValue: EnvRefValue,
  valueType: string
) =>
  ({
    type: UPDATE_TEMPLATE_ENV_REF,
    envRefKey,
    resourceField,
    newValue,
    valueType,
  } as const)

export const toggleTemplateResourceInstall = (
  resourceType: string,
  templateMetaName: string,
  shouldInstall: boolean
) =>
  ({
    type: TOGGLE_TEMPLATE_RESOURCE_INSTALL,
    resourceType,
    templateMetaName,
    shouldInstall,
  } as const)

export const setStacks = (stacks: InstalledStack[]) =>
  ({
    type: SET_STACKS,
    stacks,
  } as const)

export const removeStack = (stackID: string) =>
  ({
    type: DELETE_STACKS,
    stackID,
  } as const)

export const setTemplateReadMe = (templateName: string, readmeText: string) =>
  ({
    type: SET_TEMPLATE_README,
    templateName,
    readmeText,
  } as const)
