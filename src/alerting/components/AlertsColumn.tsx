// Libraries
import React, {FC, ReactChild, useState} from 'react'
import {connect} from 'react-redux'

// Types
import {AppState, ResourceType, ColumnTypes} from 'src/types'
import {MonitoringLimits} from 'src/cloud/actions/limits'

// Components
import {
  Panel,
  InfluxColors,
  DapperScrollbars,
  FlexBox,
  FlexDirection,
  ComponentSize,
  QuestionMarkTooltip,
  ComponentColor,
  JustifyContent,
} from '@influxdata/clockface'
import AssetLimitAlert from 'src/cloud/components/AssetLimitAlert'
import AssetLimitButton from 'src/cloud/components/AssetLimitButton'
import SearchWidget from 'src/shared/components/search_widget/SearchWidget'

// Utils
import {
  extractChecksLimits,
  extractRulesLimits,
  extractEndpointsLimits,
} from 'src/cloud/utils/limits'

// Constants
import {CLOUD} from 'src/shared/constants'

interface OwnProps {
  type: ColumnTypes
  title: string
  createButton: JSX.Element
  questionMarkTooltipContents: JSX.Element | string
  children: (searchTerm: string) => ReactChild
  tabIndex: number
}

interface StateProps {
  limitStatus: MonitoringLimits
}

const AlertsColumnHeader: FC<OwnProps & StateProps> = ({
  type,
  children,
  title,
  limitStatus,
  createButton,
  questionMarkTooltipContents,
  tabIndex,
}) => {
  const [searchTerm, onChangeSearchTerm] = useState('')

  const formattedTitle = title.toLowerCase().replace(' ', '-')
  const panelClassName = `alerting-index--column alerting-index--${formattedTitle}`
  const resourceName = title.substr(0, title.length - 1)

  const isLimitExceeded =
    CLOUD && limitStatus[type] === 'exceeded' && type !== ResourceType.Checks

  const assetLimitButton = (
    <AssetLimitButton
      color={ComponentColor.Secondary}
      buttonText="Create"
      resourceName={resourceName}
    />
  )

  return (
    <Panel
      backgroundColor={InfluxColors.Grey5}
      className={panelClassName}
      testID={`${type}--column`}
    >
      <FlexBox
        direction={FlexDirection.Row}
        margin={ComponentSize.Small}
        justifyContent={JustifyContent.SpaceBetween}
      >
        <FlexBox direction={FlexDirection.Row} margin={ComponentSize.Small}>
          <h4 style={{width: 'auto', marginRight: '6px'}}>{title}</h4>
          <QuestionMarkTooltip
            diameter={18}
            color={ComponentColor.Primary}
            testID={`${title}--question-mark`}
            tooltipContents={questionMarkTooltipContents}
          />
        </FlexBox>
        {isLimitExceeded ? assetLimitButton : createButton}
      </FlexBox>
      <div className="alerting-index--search">
        <SearchWidget
          placeholderText={`Filter ${title}...`}
          searchTerm={searchTerm}
          onSearch={onChangeSearchTerm}
          testID={`filter--input ${type}`}
          tabIndex={tabIndex}
        />
      </div>
      <div className="alerting-index--column-body">
        <DapperScrollbars
          autoHide={true}
          style={{width: '100%', height: '100%'}}
        >
          <div className="alerting-index--list">
            {children(searchTerm)}
            <AssetLimitAlert
              resourceName={title}
              limitStatus={limitStatus[type]}
            />
          </div>
        </DapperScrollbars>
      </div>
    </Panel>
  )
}

const mstp = (state: AppState) => {
  return {
    limitStatus: {
      [ResourceType.Checks]: extractChecksLimits(state),
      [ResourceType.NotificationRules]: extractRulesLimits(state),
      [ResourceType.NotificationEndpoints]: extractEndpointsLimits(state),
    },
  }
}

export default connect(mstp)(AlertsColumnHeader)
