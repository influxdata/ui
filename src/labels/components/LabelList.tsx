// Libraries
import React, {FC, useState, useMemo} from 'react'

// Components
import {Overlay, ResourceList} from '@influxdata/clockface'
import UpdateLabelOverlay from 'src/labels/components/UpdateLabelOverlay'
import LabelCard from 'src/labels/components/LabelCard'

// Utils
import {validateLabelUniqueness} from 'src/labels/utils/'

// Types
import {OverlayState, Label} from 'src/types'
import {Sort} from '@influxdata/clockface'
import {SortTypes} from 'src/shared/utils/sort'

// Selectors
import {getSortedResources} from 'src/shared/utils/sort'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'

interface Props {
  labels: Label[]
  emptyState: JSX.Element
  onUpdateLabel: (label: Label) => void
  onDeleteLabel: (labelID: string) => void
  sortKey: string
  sortDirection: Sort
  sortType: SortTypes
}

const LabelList: FC<Props> = ({
  labels,
  emptyState,
  onUpdateLabel,
  onDeleteLabel,
  sortKey,
  sortDirection,
  sortType,
}) => {
  const [labelID, setLabelID] = useState<string>(null)
  const [overlayState, setOverlayState] = useState<OverlayState>(
    OverlayState.Closed
  )
  const sortedLabels = useMemo(
    () => getSortedResources(labels, sortKey, sortDirection, sortType),
    [labels, sortKey, sortDirection, sortType]
  )

  const rows = (): JSX.Element[] => {
    return sortedLabels.map((label: Label, index: number) => (
      <LabelCard
        key={label.id || `label-${index}`}
        onDelete={onDeleteLabel}
        onClick={handleStartEdit}
        label={label}
      />
    ))
  }

  const getLabel = (): Label | null => {
    if (labelID) {
      return labels.find(l => l.id === labelID)
    }
  }

  const handleCloseModal = () => {
    setOverlayState(OverlayState.Closed)
  }

  const handleStartEdit = (labelID: string): void => {
    setLabelID(labelID)
    setOverlayState(OverlayState.Open)
  }

  const isOverlayVisible = !!labelID && overlayState === OverlayState.Open

  const handleUpdateLabel = (updatedLabel: Label) => {
    onUpdateLabel(updatedLabel)
    setOverlayState(OverlayState.Closed)
  }

  const handleNameValidation = (name: string): string | null => {
    const names = labels.map(label => label.name).filter(l => l !== name)
    return validateLabelUniqueness(names, name)
  }

  return (
    <ErrorBoundary>
      <ResourceList>
        <ResourceList.Body emptyState={emptyState}>{rows()}</ResourceList.Body>
      </ResourceList>
      <Overlay visible={isOverlayVisible}>
        <UpdateLabelOverlay
          label={getLabel()}
          onDismiss={handleCloseModal}
          onUpdateLabel={handleUpdateLabel}
          onNameValidation={handleNameValidation}
        />
      </Overlay>
    </ErrorBoundary>
  )
}

export default React.memo(LabelList)
