import React, {PureComponent} from 'react'
import {withRouter, RouteComponentProps} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {CommunityTemplateOverlay} from 'src/templates/components/CommunityTemplateOverlay'

// Actions
import {setStagedCommunityTemplate} from 'src/templates/actions/creators'
import {createTemplate, fetchAndSetStacks} from 'src/templates/actions/thunks'
import {notify} from 'src/shared/actions/notifications'

import {getTotalResourceCount} from 'src/templates/selectors'

// Types
import {AppState, Organization, ResourceType} from 'src/types'
import {ComponentStatus} from '@influxdata/clockface'

// Utils
import {getByID} from 'src/resources/selectors'
import {getTemplateNameFromUrl} from 'src/templates/utils'
import {reportError} from 'src/shared/utils/errors'

import {
  installTemplate,
  reviewTemplate,
  updateStackName,
} from 'src/templates/api'

import {
  communityTemplateInstallFailed,
  communityTemplateInstallSucceeded,
  communityTemplateRenameFailed,
} from 'src/shared/copy/notifications'

import {event} from 'src/cloud/utils/reporting'

interface State {
  status: ComponentStatus
}

type ReduxProps = ConnectedProps<typeof connector>
type RouterProps = RouteComponentProps<{
  orgID: string
}>

type Props = ReduxProps & RouterProps

class UnconnectedTemplateImportOverlay extends PureComponent<Props> {
  public state: State = {
    status: ComponentStatus.Default,
  }

  public componentDidMount() {
    if (!this.props.stagedTemplateUrl) {
      this.onDismiss()
      return
    }
    this.reviewTemplateResources(
      this.props.org.id,
      this.props.stagedTemplateUrl
    )
  }

  public render() {
    const templateDetails = getTemplateNameFromUrl(this.props.stagedTemplateUrl)
    const templateName = templateDetails.name
    const templateDirectory = templateDetails.directory

    return (
      <CommunityTemplateOverlay
        onDismissOverlay={this.onDismiss}
        onInstall={this.handleInstallTemplate}
        resourceCount={this.props.resourceCount}
        status={this.state.status}
        templateName={templateName}
        templateDirectory={templateDirectory}
        updateStatus={this.updateOverlayStatus}
      />
    )
  }

  private reviewTemplateResources = async (
    orgID: string,
    templateUrl: string
  ) => {
    try {
      const summary = await reviewTemplate(orgID, templateUrl)

      this.props.setStagedCommunityTemplate(summary)
      return summary
    } catch (err) {
      this.props.notify(communityTemplateInstallFailed(err.message))
      reportError(err, {
        name: 'The community template fetch for preview failed',
      })
    }
  }

  private onDismiss = () => {
    this.props.history.push(`/orgs/${this.props.org.id}/settings/templates`)
  }

  private updateOverlayStatus = (status: ComponentStatus) =>
    this.setState(() => ({status}))

  private handleInstallTemplate = async () => {
    let summary
    try {
      summary = await installTemplate(
        this.props.org.id,
        this.props.stagedTemplateUrl,
        this.props.resourcesToSkip,
        this.props.stagedTemplateEnvReferences
      )
    } catch (err) {
      this.props.notify(communityTemplateInstallFailed(err.message))
      reportError(err, {name: 'Failed to install community template'})
    }

    try {
      const templateDetails = getTemplateNameFromUrl(
        this.props.stagedTemplateUrl
      )
      await updateStackName(summary.stackID, templateDetails.name)

      event('template_install', {templateName: templateDetails.name})

      this.props.notify(communityTemplateInstallSucceeded(templateDetails.name))
    } catch (err) {
      this.props.notify(communityTemplateRenameFailed())
      reportError(err, {name: 'The community template rename failed'})
    } finally {
      this.props.fetchAndSetStacks(this.props.org.id)
      this.onDismiss()
    }
  }
}

const mstp = (state: AppState, props: RouterProps) => {
  const org = getByID<Organization>(
    state,
    ResourceType.Orgs,
    props.match.params.orgID
  )

  // convert the env references into a format pkger is happy with
  const stagedTemplateEnvReferences = {}
  for (const [refKey, refObject] of Object.entries(
    state.resources.templates.stagedTemplateEnvReferences
  )) {
    switch (refObject.valueType) {
      case 'string':
      case 'time':
      case 'duration': {
        stagedTemplateEnvReferences[refKey] = refObject.value
        continue
      }
      case 'number':
      case 'float': {
        stagedTemplateEnvReferences[refKey] = parseFloat(refObject.value as any)
        continue
      }
      case 'integer': {
        stagedTemplateEnvReferences[refKey] = parseInt(
          refObject.value as any,
          10
        )
        continue
      }
    }
  }

  return {
    org,
    stagedTemplateEnvReferences,
    flags: state.flags.original,
    resourceCount: getTotalResourceCount(
      state.resources.templates.stagedCommunityTemplate.summary
    ),
    resourcesToSkip:
      state.resources.templates.stagedCommunityTemplate.resourcesToSkip,
    stagedTemplateUrl: state.resources.templates.stagedTemplateUrl,
  }
}

const mdtp = {
  createTemplate,
  notify,
  setStagedCommunityTemplate,
  fetchAndSetStacks,
}

const connector = connect(mstp, mdtp)

export const CommunityTemplateImportOverlay = connector(
  withRouter(UnconnectedTemplateImportOverlay)
)
