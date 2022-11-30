// Libraries
import React, {FC, useCallback, useContext, useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import {
  Button,
  ComponentColor,
  ComponentStatus,
  Overlay,
} from '@influxdata/clockface'

// Components
import {OverlayContext} from 'src/overlays/components/OverlayController'

// Selectors
import {selectCurrentAccountId, selectUser} from 'src/identity/selectors'

// Error Reporting
import {reportErrorThroughHoneyBadger} from 'src/shared/utils/errors'

// Styles
import './MarketoAccountUpgradeOverlay.scss'

// Types
declare let window: WindowWithMarketo

interface WindowWithMarketo extends Window {
  MktoForms2?: MarketoScript
}

interface MarketoScript {
  loadForm?: Function
  getForm?: Function
}

export const MarketoAccountUpgradeOverlay: FC = () => {
  const {onClose} = useContext(OverlayContext)
  const accountId = useSelector(selectCurrentAccountId)
  const user = useSelector(selectUser)

  const [scriptHasLoaded, setScriptHasLoaded] = useState(false)
  const [formHasLoaded, setFormHasLoaded] = useState(false)

  const handleSubmit = () => {
    window.MktoForms2.getForm(2826).submit()
    onClose()
  }

  const unloadForm = () => {
    delete window.MktoForms2
    onClose()
  }

  const loadMarketoForm = useCallback(() => {
    if (!formHasLoaded) {
      return () => {
        try {
          window.MktoForms2?.loadForm(
            '//get.influxdata.com',
            '972-GDU-533',
            2826,
            () => {
              const marketoForm = window.MktoForms2?.getForm(2826)

              const marketoElementsToRemove = [
                '.mktoAsterix',
                '.mktoOffset',
                '.mktoGutter',
                '.mktoButton',
              ]
              marketoElementsToRemove.forEach(marketoItem => {
                document.querySelectorAll(marketoItem).forEach(domNode => {
                  domNode.remove()
                })
              })

              marketoForm.setValues({
                Quartz_User_ID__c: parseInt(user.id),
                Quartz_Account_ID__c: accountId,
              })

              document.querySelectorAll('input').forEach(input => {
                input.readOnly = true
                input.disabled = true
              })

              setFormHasLoaded(true)
            }
          )
        } catch (err) {
          reportErrorThroughHoneyBadger(err, {
            context: {user, accountId},
            name: 'failed to load marketo form',
          })
        }
      }
    }
    return () => null
  }, [formHasLoaded, user, accountId])

  useEffect(() => {
    if (!scriptHasLoaded) {
      try {
        const marketoScript = document.createElement('script')
        marketoScript.id = 'marketoScript'
        marketoScript.src = '//get.influxdata.com/js/forms2/js/forms2.min.js'
        marketoScript.onload = () => loadMarketoForm()
        document.body.appendChild(marketoScript)

        setScriptHasLoaded(true)
      } catch (err) {
        reportErrorThroughHoneyBadger(err, {
          context: {user},
          name: 'failed to load marketo script',
        })
      }
    }
  }, [accountId, loadMarketoForm, scriptHasLoaded, user])

  return (
    <Overlay.Container
      maxWidth={600}
      className="upgrade-to-contract-overlay--container"
      testID="upgrade-to-contract-overlay--container"
    >
      <Overlay.Header
        className="upgrade-to-contract-overlay--header"
        testID="upgrade-to-contract-overlay--header"
        title="Upgrade Your Account"
        onDismiss={unloadForm}
      />
      <Overlay.Body className="upgrade-to-contract-overlay--body">
        <p>
          You've reached the organization quota for your current account type.
        </p>
        <p>
          Click 'Contact Sales', and an InfluxData team member will reach out to
          you.
        </p>
        <br />
        <form id="mktoForm_2826" />
      </Overlay.Body>
      <Overlay.Footer>
        <Button
          text="Cancel"
          testID="upgrade-to-contract-overlay--cancel-button"
          color={ComponentColor.Default}
          onClick={unloadForm}
        />
        <Button
          text="Contact Sales"
          testID="create-org-form-submit"
          color={ComponentColor.Primary}
          status={ComponentStatus.Default}
          onClick={handleSubmit}
        />
      </Overlay.Footer>
    </Overlay.Container>
  )
}
