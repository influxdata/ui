import React from 'react'
import {renderWithRedux} from 'src/mockState'
import {DownloadTypes, MiniFileDnd, setGrammar} from './MiniFileDnd'

const setup = (
  allowedExtensions: string,
  allowedTypes: string[],
  handleFileUpload: (
    contents: string,
    fileType: DownloadTypes,
    fileName: string
  ) => void,
  setErrorState: (hasError: boolean, message?: string) => void,
  alreadySetFileName?: string
) => {
  return renderWithRedux(
    <MiniFileDnd
      allowedExtensions={allowedExtensions}
      allowedTypes={allowedTypes}
      handleFileUpload={handleFileUpload}
      setErrorState={setErrorState}
      alreadySetFileName={alreadySetFileName}
    />
  )
}

const mockSetErrorState = jest.fn((hasError, message) => ({hasError, message}))
const mockHandleFileUpload = jest.fn((contents, isCsv, fileName) => ({
  contents,
  isCsv,
  fileName,
}))

const allowedTypesJson = ['application/json']
const allowedExtensionsJson = '.json'

describe('mini file uploader, testing rendering and behavior', () => {
  it('should show label with just the basic dnd className applied', () => {
    const {getByTestId} = setup(
      allowedExtensionsJson,
      allowedTypesJson,
      mockHandleFileUpload,
      mockSetErrorState
    )

    const displayArea = getByTestId('displayArea')
    expect(displayArea).toHaveTextContent('Add schema file')

    // not checking actual styles, since they can change and are hard to test
    // we are, however, checking that the correct classnames are applied.
    // since that is what is really important.
    const dndContainer = getByTestId('dndContainer')

    // make sure it only has the basic classname on it (not the error classname
    // or anything else)
    expect(dndContainer.className).toEqual('dnd')
  })
  it('should have an input field', () => {
    const {getByTestId} = setup(
      allowedExtensionsJson,
      allowedTypesJson,
      mockHandleFileUpload,
      mockSetErrorState
    )

    const inputEl = getByTestId('drag-and-drop--input')
    expect(inputEl).toBeDefined()
    expect(inputEl.className).toEqual('drag-and-drop--input')
  })
  it('should show the file name if it is already set', () => {
    const fileName = 'testFile2.json'
    const {getByTestId} = setup(
      allowedExtensionsJson,
      allowedTypesJson,
      mockHandleFileUpload,
      mockSetErrorState,
      fileName
    )

    const displayArea = getByTestId('displayArea')
    expect(displayArea).toHaveTextContent(fileName)
  })
})
describe('test grammar function for error messages', () => {
  it('should have correct grammar for one element', () => {
    const foo1 = ['ack']
    const actual = setGrammar(foo1)

    expect(actual).toEqual('ack')
  })
  it('should have correct grammar for two elements', () => {
    const foo1 = ['ack', 'bar']
    const actual = setGrammar(foo1)

    expect(actual).toEqual('ack or bar')
  })
  it('should have correct grammar for three elements', () => {
    const foo1 = ['ack', 'bar', 'baz']
    const actual = setGrammar(foo1)

    expect(actual).toEqual('ack, bar, or baz')
  })
  it('should have correct grammar for four elements', () => {
    const foo1 = ['ack', 'bar', 'another', 'baz']
    const actual = setGrammar(foo1)

    expect(actual).toEqual('ack, bar, another, or baz')
  })
})
