// Libraries
import React, {PureComponent} from 'react'

// Components
// Types
import {
  AlignItems,
  Alignment,
  ComponentSize,
  ComponentStatus,
  FlexBox,
  FlexDirection,
  Orientation,
  Overlay,
  Tabs,
} from '@influxdata/clockface'
import {CommunityTemplateInstallInstructions} from 'src/templates/components/CommunityTemplateInstallInstructions'
import {CommunityTemplateReadme} from 'src/templates/components/CommunityTemplateReadme'
import {CommunityTemplateResourceContent} from 'src/templates/components/CommunityTemplateResourceContent'

interface Props {
  isVisible?: boolean
  onDismissOverlay: () => void
  onInstall: () => void
  resourceCount: number
  status?: ComponentStatus
  templateName: string
  url: string
  updateStatus?: (status: ComponentStatus) => void
}

interface State {
  activeTab: ActiveTab
}

enum Tab {
  IncludedResources,
  Readme,
}

type ActiveTab = Tab.IncludedResources | Tab.Readme

class CommunityTemplateOverlayUnconnected extends PureComponent<Props, State> {
  state: State = {
    activeTab: Tab.IncludedResources,
  }

  public static defaultProps: {isVisible: boolean} = {
    isVisible: true,
  }

  public render() {
    const {isVisible, onInstall, resourceCount, templateName, url} = this.props

    return (
      <Overlay visible={isVisible}>
        <Overlay.Container
          maxWidth={800}
          testID="template-install-overlay"
          style={{minHeight: '600px'}}
        >
          <Overlay.Header
            title="Template Installer"
            onDismiss={this.onDismiss}
          />
          <Overlay.Body>
            <FlexBox
              direction={FlexDirection.Column}
              margin={ComponentSize.Large}
              alignItems={AlignItems.Stretch}
            >
              <CommunityTemplateInstallInstructions
                templateName={templateName}
                resourceCount={resourceCount}
                onClickInstall={onInstall}
              />
              <Tabs.Container orientation={Orientation.Horizontal}>
                <Tabs.Tabs alignment={Alignment.Center}>
                  <Tabs.Tab
                    active={this.state.activeTab === Tab.IncludedResources}
                    id="included-resources"
                    text="Included Resources"
                    onClick={this.setTabToIncludedResources}
                  />
                  <Tabs.Tab
                    active={this.state.activeTab === Tab.Readme}
                    id="readme"
                    text="Readme"
                    testID="community-templates-readme-tab"
                    onClick={this.setTabToReadme}
                  />
                </Tabs.Tabs>
                {this.state.activeTab === Tab.IncludedResources ? (
                  <CommunityTemplateResourceContent />
                ) : (
                  <CommunityTemplateReadme url={url} />
                )}
              </Tabs.Container>
            </FlexBox>
          </Overlay.Body>
        </Overlay.Container>
      </Overlay>
    )
  }

  private setTabToIncludedResources = () => {
    this.setState({activeTab: Tab.IncludedResources})
  }

  private setTabToReadme = () => {
    this.setState({activeTab: Tab.Readme})
  }

  private onDismiss = () => {
    this.props.onDismissOverlay()
  }
}

export const CommunityTemplateOverlay = CommunityTemplateOverlayUnconnected
