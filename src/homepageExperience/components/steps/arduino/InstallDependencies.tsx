import {
  ComponentColor,
  Button,
  ButtonGroup,
  Orientation,
} from '@influxdata/clockface'

import React, {FC, useEffect, useState} from 'react'
import {useDispatch} from 'react-redux'
import {getBuckets} from 'src/buckets/actions/thunks'
import {event} from 'src/cloud/utils/reporting'
import {keyboardCopyTriggered, userSelection} from 'src/utils/crossPlatform'

export const InstallDependencies: FC = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getBuckets())
  }, [])

  const headingWithMargin = {marginTop: '48px', marginBottom: '0px'}

  const logCopyCodeSnippetMac = () => {
    event('firstMile.arduinoWizard.installDependenciesMac.code.copied')
  }
  const logCopyCodeSnippetWindows = () => {
    event('firstMile.arduinoWizard.installDependenciesWindows.code.copied')
  }
  const logCopyCodeSnippetLinux = () => {
    event('firstMile.arduinoWizard.installDependenciesLinux.code.copied')
  }

  type CurrentOSSelection = 'Linux' | 'Mac' | 'Windows'
  const [currentSelection, setCurrentSelection] = useState<CurrentOSSelection>(
    'Mac'
  )

  useEffect(() => {
    const fireKeyboardCopyEvent = event => {
      if (
        keyboardCopyTriggered(event) &&
        userSelection().includes('brew install')
      ) {
        logCopyCodeSnippetMac()
      }
      if (
        keyboardCopyTriggered(event) &&
        (userSelection().includes('Expand-Archive') ||
          userSelection().includes('mv'))
      ) {
        logCopyCodeSnippetWindows()
      }
      if (
        keyboardCopyTriggered(event) &&
        (userSelection().includes('wget') ||
          userSelection().includes('tar') ||
          userSelection().includes('sudo'))
      ) {
        logCopyCodeSnippetLinux()
      }
    }
    document.addEventListener('keydown', fireKeyboardCopyEvent)
    return () => document.removeEventListener('keydown', fireKeyboardCopyEvent)
  }, [])

  return (
    <>
      <h1>Install Dependencies</h1>
      <ButtonGroup orientation={Orientation.Horizontal}>
        <Button
          text="mac OS"
          color={
            currentSelection === 'Mac'
              ? ComponentColor.Primary
              : ComponentColor.Default
          }
          onClick={() => {
            setCurrentSelection('Mac')
          }}
        />
        <Button
          text="windows"
          color={
            currentSelection === 'Windows'
              ? ComponentColor.Primary
              : ComponentColor.Default
          }
          onClick={() => {
            setCurrentSelection('Windows')
          }}
        />
        <Button
          text="linux"
          color={
            currentSelection === 'Linux'
              ? ComponentColor.Primary
              : ComponentColor.Default
          }
          onClick={() => {
            setCurrentSelection('Linux')
          }}
        />
      </ButtonGroup>
      {currentSelection === 'Mac' && (
        <>
          <h2 style={headingWithMargin}>Use Homebrew</h2>
        </>
      )}
      {currentSelection === 'Windows' && (
        <>
          <h2 style={headingWithMargin}>Download the CLI package</h2>
        </>
      )}
      {currentSelection === 'Linux' && (
        <>
          <h2 style={headingWithMargin}>Download from the command line</h2>
        </>
      )}
    </>
  )
}
