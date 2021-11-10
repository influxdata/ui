import React, {FC} from 'react'
import {Button, Overlay} from '@influxdata/clockface'

interface Props {
    onClose?: () => void
    title?: string
    maxWidth?: number
    body: React.ReactElement
}

export const SimpleOverlay : FC<Props> = ({onClose,
    title='',
    maxWidth= 600,
    body}) => {

    const handleClose = () => {
        console.log('would close it here')
        if (onClose) {
            onClose()
        }
    }

    return    <Overlay.Container maxWidth={maxWidth}>
        <Overlay.Header
            title={title}
            onDismiss={handleClose}
        />
        <Overlay.Body>{body}</Overlay.Body>
        <Overlay.Footer>
            <div>
                <Button
                    text="Close"
                    onClick={handleClose}
                    testID="close-simple-dialog"
                />
            </div>
        </Overlay.Footer>
    </Overlay.Container>
}