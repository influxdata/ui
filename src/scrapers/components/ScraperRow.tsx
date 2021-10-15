// Libraries
import React, {PureComponent} from 'react'

// Components
import {
  ButtonShape,
  ComponentSize,
  ConfirmationButton,
  ResourceCard,
} from '@influxdata/clockface'
import {Scraper} from 'src/types'

// Constants
import {DEFAULT_SCRAPER_NAME} from 'src/dashboards/constants'
import {IconFont, ComponentColor} from '@influxdata/clockface'

interface Props {
  scraper: Scraper
  onDeleteScraper: (scraper) => void
  onUpdateScraper: (scraper: Scraper) => void
}

export default class ScraperRow extends PureComponent<Props> {
  public render() {
    const {scraper} = this.props
    return (
      <ResourceCard contextMenu={this.contextMenu}>
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
    return (
      <ConfirmationButton
        color={ComponentColor.Colorless}
        icon={IconFont.Trash_New}
        shape={ButtonShape.Square}
        size={ComponentSize.ExtraSmall}
        confirmationLabel="Yes, delete this scraper"
        onConfirm={this.handleDeleteScraper}
        confirmationButtonText="Confirm"
        testID="context-delete-menu"
      />
    )
  }

  private handleDeleteScraper = () => {
    const {onDeleteScraper, scraper} = this.props
    onDeleteScraper(scraper)
  }

  private handleUpdateScraperName = (name: string) => {
    const {onUpdateScraper, scraper} = this.props
    onUpdateScraper({...scraper, name})
  }
}
