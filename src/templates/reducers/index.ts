import {produce} from 'immer'
import {
  Action,
  ADD_TEMPLATE_SUMMARY,
  SET_STACKS,
  SET_STAGED_TEMPLATE,
  SET_STAGED_TEMPLATE_URL,
  TOGGLE_TEMPLATE_RESOURCE_INSTALL,
  UPDATE_TEMPLATE_ENV_REF,
  SET_TEMPLATE_README,
} from 'src/templates/actions/creators'
import {
  CommunityTemplate,
  ResourceType,
  RemoteDataState,
  TemplateSummary,
  TemplatesState,
} from 'src/types'
import {addResource} from 'src/resources/reducers/helpers'

const defaultCommunityTemplate = (): CommunityTemplate => {
  return {
    sources: [],
    stackID: '',
    summary: {},
    diff: {},
    resourcesToSkip: {},
  }
}

export const defaultState = (): TemplatesState => ({
  stagedCommunityTemplate: defaultCommunityTemplate(),
  stagedTemplateEnvReferences: {},
  stagedTemplateUrl: '',
  communityTemplateReadmeCollection: {},
  status: RemoteDataState.NotStarted,
  byID: {},
  allIDs: [],
  exportTemplate: {
    status: RemoteDataState.NotStarted,
    item: null,
  },
  stacks: [],
})

export const templatesReducer = (
  state: TemplatesState = defaultState(),
  action: Action
): TemplatesState =>
  produce(state, draftState => {
    switch (action.type) {
      case SET_STAGED_TEMPLATE_URL: {
        const {templateUrl} = action

        draftState.stagedTemplateUrl = templateUrl
        return
      }

      case SET_STAGED_TEMPLATE: {
        const {template} = action

        const envReferences = {}

        const stagedCommunityTemplate = {
          ...defaultCommunityTemplate(),
          ...template,
        }

        stagedCommunityTemplate.summary.dashboards = (
          template.summary.dashboards || []
        ).map(dashboard => {
          if (!dashboard.hasOwnProperty('shouldInstall')) {
            dashboard.shouldInstall = true
          }
          if (dashboard.envReferences.length) {
            dashboard.envReferences.forEach(ref => {
              envReferences[ref.envRefKey] = {
                envRefKey: ref.envRefKey,
                resourceField: ref.resourceField,
                value: ref.defaultValue,
                valueType: ref.valueType,
              }
            })
          }
          return dashboard
        })

        stagedCommunityTemplate.summary.telegrafConfigs = (
          template.summary.telegrafConfigs || []
        ).map(telegrafConfig => {
          if (!telegrafConfig.hasOwnProperty('shouldInstall')) {
            telegrafConfig.shouldInstall = true
          }
          if (telegrafConfig.envReferences.length) {
            telegrafConfig.envReferences.forEach(ref => {
              envReferences[ref.envRefKey] = {
                envRefKey: ref.envRefKey,
                resourceField: ref.resourceField,
                value: ref.defaultValue,
                valueType: ref.valueType,
              }
            })
          }
          return telegrafConfig
        })

        stagedCommunityTemplate.summary.buckets = (
          template.summary.buckets || []
        ).map(bucket => {
          if (!bucket.hasOwnProperty('shouldInstall')) {
            bucket.shouldInstall = true
          }
          if (bucket.envReferences.length) {
            bucket.envReferences.forEach(ref => {
              envReferences[ref.envRefKey] = {
                envRefKey: ref.envRefKey,
                resourceField: ref.resourceField,
                value: ref.defaultValue,
                valueType: ref.valueType,
              }
            })
          }
          return bucket
        })

        stagedCommunityTemplate.summary.checks = (
          template.summary.checks || []
        ).map(check => {
          if (!check.hasOwnProperty('shouldInstall')) {
            check.shouldInstall = true
          }
          if (check.envReferences.length) {
            check.envReferences.forEach(ref => {
              envReferences[ref.envRefKey] = {
                envRefKey: ref.envRefKey,
                resourceField: ref.resourceField,
                value: ref.defaultValue,
                valueType: ref.valueType,
              }
            })
          }
          return check
        })

        stagedCommunityTemplate.summary.variables = (
          template.summary.variables || []
        ).map(variable => {
          if (!variable.hasOwnProperty('shouldInstall')) {
            variable.shouldInstall = true
          }
          if (variable.envReferences.length) {
            variable.envReferences.forEach(ref => {
              envReferences[ref.envRefKey] = {
                envRefKey: ref.envRefKey,
                resourceField: ref.resourceField,
                value: ref.defaultValue,
                valueType: ref.valueType,
              }
            })
          }
          return variable
        })

        stagedCommunityTemplate.summary.notificationRules = (
          template.summary.notificationRules || []
        ).map(notificationRule => {
          if (!notificationRule.hasOwnProperty('shouldInstall')) {
            notificationRule.shouldInstall = true
          }
          if (notificationRule.envReferences.length) {
            notificationRule.envReferences.forEach(ref => {
              envReferences[ref.envRefKey] = {
                envRefKey: ref.envRefKey,
                resourceField: ref.resourceField,
                value: ref.defaultValue,
                valueType: ref.valueType,
              }
            })
          }
          return notificationRule
        })

        stagedCommunityTemplate.summary.notificationEndpoints = (
          template.summary.notificationEndpoints || []
        ).map(notificationEndpoint => {
          if (!notificationEndpoint.hasOwnProperty('shouldInstall')) {
            notificationEndpoint.shouldInstall = true
          }
          if (notificationEndpoint.envReferences.length) {
            notificationEndpoint.envReferences.forEach(ref => {
              envReferences[ref.envRefKey] = {
                envRefKey: ref.envRefKey,
                resourceField: ref.resourceField,
                value: ref.defaultValue,
                valueType: ref.valueType,
              }
            })
          }
          return notificationEndpoint
        })

        stagedCommunityTemplate.summary.labels = (
          template.summary.labels || []
        ).map(label => {
          if (!label.hasOwnProperty('shouldInstall')) {
            label.shouldInstall = true
          }
          if (label.envReferences.length) {
            label.envReferences.forEach(ref => {
              envReferences[ref.envRefKey] = {
                envRefKey: ref.envRefKey,
                resourceField: ref.resourceField,
                value: ref.defaultValue,
                valueType: ref.valueType,
              }
            })
          }
          return label
        })

        stagedCommunityTemplate.summary.summaryTask = (
          template.summary.summaryTask || []
        ).map(summaryTask => {
          if (!summaryTask.hasOwnProperty('shouldInstall')) {
            summaryTask.shouldInstall = true
          }
          if (summaryTask.envReferences.length) {
            summaryTask.envReferences.forEach(ref => {
              envReferences[ref.envRefKey] = {
                envRefKey: ref.envRefKey,
                resourceField: ref.resourceField,
                value: ref.defaultValue,
                valueType: ref.valueType,
              }
            })
          }
          return summaryTask
        })

        draftState.stagedTemplateEnvReferences = envReferences
        draftState.stagedCommunityTemplate = stagedCommunityTemplate
        return
      }

      case ADD_TEMPLATE_SUMMARY: {
        addResource<TemplateSummary>(draftState, action, ResourceType.Templates)

        return
      }

      case TOGGLE_TEMPLATE_RESOURCE_INSTALL: {
        const {resourceType, shouldInstall, templateMetaName} = action

        const templateToInstall = {...draftState.stagedCommunityTemplate}

        templateToInstall.summary[resourceType].forEach(resource => {
          if (resource.templateMetaName === templateMetaName) {
            resource.shouldInstall = shouldInstall
            if (!shouldInstall) {
              templateToInstall.resourcesToSkip[resource.templateMetaName] =
                resource.kind
            } else if (
              templateToInstall.resourcesToSkip[resource.templateMetaName]
            ) {
              // if we re-check a resource that we un-checked, remove it from the skipped resources hash
              delete templateToInstall.resourcesToSkip[
                resource.templateMetaName
              ]
            }
          }
        })

        draftState.stagedCommunityTemplate = templateToInstall
        return
      }

      case SET_STACKS: {
        const {stacks} = action

        draftState.stacks = stacks
        return
      }

      case UPDATE_TEMPLATE_ENV_REF: {
        const {envRefKey, newValue, resourceField, valueType} = action
        draftState.stagedTemplateEnvReferences[envRefKey] = {
          envRefKey,
          resourceField,
          value: newValue,
          valueType,
        }
        return
      }

      case SET_TEMPLATE_README: {
        const {templateName, readmeText} = action
        const readme = {...draftState.communityTemplateReadmeCollection}

        readme[templateName] = readmeText
        draftState.communityTemplateReadmeCollection = readme
        return
      }
    }
  })

export default templatesReducer
