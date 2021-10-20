// Libraries
import React, {FC, ChangeEvent, useEffect, useRef, useState} from 'react'

// Components
import {Form, TextArea} from '@influxdata/clockface'

interface Props {
  message: string
  onChange: (newMessage: string) => void
}

const characterLimit = 255

export const AnnotationMessageInput: FC<Props> = (props: Props) => {
  const textArea = useRef(null)
  const validationMessage = props.message ? '' : 'This field is required'
  const [characterCount, setCharacterCount] = useState(
    props.message?.length ?? 0
  )

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setCharacterCount(event.target.value.length)
    props.onChange(event.target.value)
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
    <Form.Element
      label={`Message (${characterCount} / ${characterLimit})`}
      required={true}
      errorMessage={validationMessage}
      testID="annotation-message--form"
    >
      <TextArea
        name="message"
        value={props.message}
        onChange={handleChange}
        style={{height: '80px', minHeight: '80px'}}
        ref={textArea}
        maxLength={characterLimit}
        testID="edit-annotation-message"
      />
    </Form.Element>
  )
}
