// Libraries
import React, {PureComponent} from 'react'

// Components
import {
  ResourceCard,
  ConfirmationButton,
  IconFont,
  ComponentColor,
  ButtonShape,
  ComponentSize,
} from '@influxdata/clockface'
import {Scraper} from 'src/types'

// Constants
import {DEFAULT_SCRAPER_NAME} from 'src/dashboards/constants'

interface Props {
  scraper: Scraper
  onDeleteScraper: (scraper) => void
  onUpdateScraper: (scraper: Scraper) => void
}

export default class ScraperRow extends PureComponent<Props> {
  public render() {
    const {scraper} = this.props
    return (
      <ResourceCard
        contextMenuInteraction="alwaysVisible"
        contextMenu={this.contextMenu}
      >
        <ResourceCard.EditableName
          onUpdate={this.handleUpdateScraperName}
          name={scraper.name}
          noNameString={DEFAULT_SCRAPER_NAME}
          buttonTestID="editable-name"
          inputTestID="input-field"
        />
        <ResourceCard.Meta>
          {[<>Bucket: {scraper.bucket}</>, <>URL: {scraper.url}</>]}
        </ResourceCard.Meta>
      </ResourceCard>
    )
  }

  private get contextMenu(): JSX.Element {
    const {onDeleteScraper, scraper} = this.props
    return (
      <ConfirmationButton
        testID="delete-scraper"
        icon={IconFont.Trash}
        color={ComponentColor.Danger}
        size={ComponentSize.ExtraSmall}
        shape={ButtonShape.Square}
        onConfirm={onDeleteScraper}
        returnValue={scraper}
        confirmationButtonText="Delete"
        confirmationLabel="Really delete scraper?"
      />
    )
  }

  private handleUpdateScraperName = (name: string) => {
    const {onUpdateScraper, scraper} = this.props
    onUpdateScraper({...scraper, name})
  }
}
