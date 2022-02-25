import React, {PureComponent} from 'react'

import {FlexBox, Page} from '@influxdata/clockface'

import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

import {Overview} from 'src/homepageExperience/components/steps/Overview'

export default class HomepageContainer extends PureComponent {
  state = {
    currentStep: 1
  }

  renderStep = () => {
    switch (this.state.currentStep) {
      case 1: {
        return (<Overview />)
      }
    }
  }

  render() {
    return (
      <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', height: '100%'}}>
        <nav style={{display: 'flex', flexDirection: 'column', width: '30%'}}>
          <div style={{width: '100%'}}>
            <h3 style={{display: 'flex', justifyContent: 'center'}}>Nav</h3>
          </div>
        </nav>
        <div style={{display: "flex", flexDirection: "column", justifyContent: 'center', width: '70%'}}>
          <div style={{display: 'flex', justifyContent: 'center', width: '100%'}}>
            <h3>Content</h3>
          </div>
        </div>
      </div>
    )
    // return (
    //   <Page titleTag={pageTitleSuffixer(['Home'])}>
    //     <Page.Header fullWidth={false}>
    //       <Page.Title title="Hello, Time-Series World" testID="home-page--header" />
    //     </Page.Header>
    //     <Page.ControlBar fullWidth={true}>
    //       <Page.ControlBarLeft>
    //         <h3>Nav</h3>
    //       </Page.ControlBarLeft>
    //       <Page.ControlBarRight>
    //         <h3>Content</h3>
    //       </Page.ControlBarRight>
    //     </Page.ControlBar>
    //   </Page>
    // )
  }
}
