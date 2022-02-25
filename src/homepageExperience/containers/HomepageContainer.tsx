import React, {PureComponent} from 'react'

import {FlexBox, Page} from '@influxdata/clockface'

import {Overview} from 'src/homepageExperience/components/steps/Overview'
import {Navigation} from 'src/homepageExperience/components/Navigation'

import '../components/homepageExperience.scss'

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
      <div className="homepage-container">
        <aside className="homepage-container--subway">
          <div style={{width: '100%'}}>
            <Navigation />
          </div>
        </aside>
        <main className="homepage-container--main">
          <div className="homepage-container--main-wrapper">
            <h3>Content</h3>
          </div>
        </main>
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
