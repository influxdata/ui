// Libraries
import React, {
  FC,
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react'

// Components
import {Columns, Form, Grid, TextArea} from '@influxdata/clockface'

interface Props {
  message: string
  onChange: (newMessage: string) => void
  onSubmit: () => void
}

const characterLimit = 255

export const AnnotationMessageInput: FC<Props> = (props: Props) => {
  const textArea = useRef(null)
  const validationMessage = props.message ? '' : 'This field is required'
  const [characterCount, setCharacterCount] = useState(
    props.message.length ?? 0
  )

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setCharacterCount(event.target.value.length)
    props.onChange(event.target.value)
  }

  const handleKeyPress = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter') {
      props.onSubmit()
      return
    }
  }

  useEffect(() => {
    textArea.current.focus()
    // place the cursor at the end of the text when editing
    if (textArea.current.textLength) {
      textArea.current.selectionStart = textArea.current.textLength
      textArea.current.selectionEnd = textArea.current.textLength
    }
  }, [])

  return (
    <Grid.Column widthXS={Columns.Twelve}>
      <Form.Element
        label={`Message (${characterCount} / ${characterLimit})`}
        required={true}
        errorMessage={validationMessage}
      >
        <TextArea
          name="message"
          value={props.message}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          style={{height: '80px', minHeight: '80px'}}
          ref={textArea}
          maxLength={characterLimit}
        />
      </Form.Element>
    </Grid.Column>
  )
}
