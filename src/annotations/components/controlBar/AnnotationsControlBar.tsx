// Libraries
import React, {FC} from 'react'
import {useSelector} from 'react-redux'
import {useHistory, useRouteMatch} from 'react-router-dom'

// Components
import {
  Button,
  SquareButton,
  IconFont,
  JustifyContent,
  Input,
  FlexBox,
  FlexBoxChild,
  ComponentSize,
  ComponentColor,
} from '@influxdata/clockface'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import Toolbar from 'src/shared/components/toolbar/Toolbar'

// Selectors
import {getAnnotationControlsVisibility} from 'src/annotations/selectors'

// Constants
import {ORGS, SETTINGS, DASHBOARDS} from 'src/shared/constants/routes'

interface DashboardRouteMatch {
  params: {
    orgID: string
    dashboardID: string
  }
}

const AnnotationsControlBar: FC = () => {
  const history = useHistory()
  const isVisible = useSelector(getAnnotationControlsVisibility)
  const match: DashboardRouteMatch = useRouteMatch({
    path: '/orgs/:orgID/dashboards/:dashboardID',
    strict: true,
  })

  if (!isVisible) {
    return null
  }

  const handleSettingsClick = (): void => {
    if (match?.params?.orgID) {
      history.push(`/${ORGS}/${match.params.orgID}/${SETTINGS}/annotations`)
    }
  }

  const handleAnnotateClick = (): void => {
    if (match?.params?.orgID && match?.params?.dashboardID) {
      history.push(
        `/${ORGS}/${match.params.orgID}/${DASHBOARDS}/${match.params.dashboardID}/add-annotation`
      )
    }
  }

  return (
    <ErrorBoundary>
      <Toolbar
        justifyContent={JustifyContent.SpaceBetween}
        margin={ComponentSize.Large}
      >
        <FlexBoxChild basis={300} grow={0}>
          <Input
            placeholder="Add annotation streams..."
            icon={IconFont.Search}
          />
        </FlexBoxChild>
        <FlexBoxChild grow={1}>
          <span>Labels</span>
        </FlexBoxChild>
        <FlexBox margin={ComponentSize.Small}>
          <Button
            text="Annotate"
            icon={IconFont.AnnotatePlus}
            color={ComponentColor.Primary}
            onClick={handleAnnotateClick}
          />
          <SquareButton
            icon={IconFont.CogThick}
            onClick={handleSettingsClick}
          />
        </FlexBox>
      </Toolbar>
    </ErrorBoundary>
  )
}

// class AnnotationsControlBar extends PureComponent<Props, State> {
//   public state: State = {initialLoading: RemoteDataState.Loading}

//   static getDerivedStateFromProps(props: Props, state: State) {
//     if (
//       props.variablesStatus === RemoteDataState.Done &&
//       state.initialLoading !== RemoteDataState.Done
//     ) {
//       return {initialLoading: RemoteDataState.Done}
//     }

//     return {}
//   }

//   render() {
//     const {show, inPresentationMode} = this.props
//     if (!show) {
//       return false
//     }
//     return (
//       <div
//         className={classnames('variables-control-bar', {
//           'presentation-mode': inPresentationMode,
//         })}
//       >
//         <SpinnerContainer
//           loading={this.state.initialLoading}
//           spinnerComponent={<TechnoSpinner diameterPixels={50} />}
//           className="variables-spinner-container"
//         >
//           {this.bar}
//         </SpinnerContainer>
//       </div>
//     )
//   }

//   private get emptyBar(): JSX.Element {
//     return (
//       <EmptyState
//         size={ComponentSize.ExtraSmall}
//         className="variables-control-bar--empty"
//       >
//         <EmptyState.Text>
//           This dashboard doesn't have any cells with defined variables.{' '}
//           <a
//             href="https://v2.docs.influxdata.com/v2.0/visualize-data/variables/"
//             target="_blank"
//           >
//             Learn How
//           </a>
//         </EmptyState.Text>
//       </EmptyState>
//     )
//   }

//   private get barContents(): JSX.Element {
//     const {variables, variablesStatus} = this.props
//     return (
//       <div className="variables-control-bar--full">
//         {variables.map((v, i) => (
//           <ErrorBoundary key={v.id}>
//             <DraggableDropdown
//               name={v.name}
//               id={v.id}
//               index={i}
//               moveDropdown={this.handleMoveDropdown}
//             />
//           </ErrorBoundary>
//         ))}
//         {variablesStatus === RemoteDataState.Loading && (
//           <TechnoSpinner diameterPixels={18} />
//         )}
//       </div>
//     )
//   }

//   private get bar(): JSX.Element {
//     const {variables} = this.props

//     if (isEmpty(variables)) {
//       return this.emptyBar
//     }

//     return this.barContents
//   }

//   private handleMoveDropdown = (
//     originalIndex: number,
//     newIndex: number
//   ): void => {
//     const {moveVariable} = this.props
//     moveVariable(originalIndex, newIndex)
//   }
// }

// const mdtp = {
//   moveVariable,
// }

// const mstp = (state: AppState) => {
//   const dashboardID = state.currentDashboard.id
//   const variables = getVariables(state)
//   const variablesStatus = getDashboardVariablesStatus(state)
//   const show = state.userSettings.showVariablesControls

//   const {
//     app: {
//       ephemeral: {inPresentationMode},
//     },
//   } = state

//   const varsInUse = filterUnusedVars(
//     variables,
//     Object.values(state.resources.views.byID).filter(
//       variable => variable.dashboardID === dashboardID
//     )
//   )

//   return {
//     variables: varsInUse,
//     variablesStatus,
//     inPresentationMode,
//     show,
//   }
// }

// const connector = connect(mstp, mdtp)

export default AnnotationsControlBar
