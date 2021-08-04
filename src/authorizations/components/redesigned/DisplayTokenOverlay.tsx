import React, {FC} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {
  Overlay,
  FlexBox,
  Alert,
  IconFont,
  ComponentColor,
  AlignItems,
  FlexDirection,
  ComponentSize,
} from '@influxdata/clockface'
import CodeSnippet from 'src/shared/components/CodeSnippet'

// Types
import {Authorization, AppState} from 'src/types'

type ReduxProps = ConnectedProps<typeof connector>

type Props = ReduxProps & OwnProps 

interface OwnProps {
  
  onClose: () => void
}

export const DisplayTokenOverlay: FC<Props> = props => {
  const handleDismiss = () => {
    props.onClose()
  }
  
  console.log(props.authorizations) // undefined 

  return (
    <Overlay.Container maxWidth={750}>
      <Overlay.Header
        title="You've Successfully cloned an API Token"
        onDismiss={handleDismiss}
      />
      <Overlay.Body>
        
          <FlexBox
            alignItems={AlignItems.Center}
            direction={FlexDirection.Column}
            margin={ComponentSize.Large}
          >
        <Alert 
            icon={IconFont.AlertTriangle}
            color={ComponentColor.Primary}>
            Make sure to copy your new personal access token now. You won't be able to see it again!
        </Alert>
        {/* <CodeSnippet
            text={auth}
            label={description}
            type="Token"
        /> */}
        {/* <Panel>
        <Panel.Header />
            <Panel.Body>
            <CopyToClipboard text="copy to clipboard" >
                <Button
                text="Copy to Clipboard"
                testID="copy-to-clipboard"
                color={ComponentColor.Secondary}
                size={ComponentSize.ExtraSmall}
                />
                
                    
                </CopyToClipboard>
                
            </Panel.Body>
        </Panel> */}
          
          
        
            
          </FlexBox>
        
      </Overlay.Body>
    </Overlay.Container>
  )
}

const mstp = (state: AppState) => {
    const authorizations = state.resources.tokens.byID
    return {authorizations}
  }
  
  
const connector = connect(mstp, null)