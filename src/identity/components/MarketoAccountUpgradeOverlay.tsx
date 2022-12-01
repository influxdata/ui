// Libraries
import React, {FC, useCallback, useContext, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
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
import {marketoFormSubmitFailure} from 'src/shared/copy/notifications/categories/accounts-users-orgs'
import {notify} from 'src/shared/actions/notifications'

// Types
declare let window: WindowWithMarketo

interface WindowWithMarketo extends Window {
  MktoForms2?: MarketoScript
}

interface MarketoScript {
  loadForm?: Function
  getForm?: Function
}

// Constants
const MARKETO_SERVER_INSTANCE = '//get.influxdata.com'
const MARKETO_SUBSCRIPTION_ID = '972-GDU-533'
const MARKETO_FORM_ID = 2826
const BACKUP_CONTACT_SALES_LINK = 'https://www.influxdata.com/contact-sales-b/'

const SalesFormLink = (): JSX.Element => {
  return (
    <a href={BACKUP_CONTACT_SALES_LINK} data-testid="use-sales-form--link">
      Click here to contact sales.
    </a>
  )
}

export const MarketoAccountUpgradeOverlay: FC = () => {
  const {onClose} = useContext(OverlayContext)
  const dispatch = useDispatch()

  const user = useSelector(selectUser)
  const accountId = useSelector(selectCurrentAccountId)

  const [scriptHasLoaded, setScriptHasLoaded] = useState(false)
  const [formHasLoaded, setFormHasLoaded] = useState(false)

  const handleError = useCallback(
    (err: Error, message: string) => {
      dispatch(notify(marketoFormSubmitFailure(SalesFormLink)))
      reportErrorThroughHoneyBadger(err, {
        context: {
          user,
          accountId,
        },
        name: message,
      })
    },
    [accountId, dispatch, user]
  )

  const handleFormSubmission = () => {
    try {
      window.MktoForms2.getForm(MARKETO_FORM_ID).submit()
      onClose()
    } catch (err) {
      handleError(err, 'failed to submit marketo account upgrade form')
    }
  }

  const unloadForm = () => {
    // Deleting marketo object guards against inconsistent behavior if user closes then re-opens the overlay.
    delete window.MktoForms2
    onClose()
  }

  const loadMarketoForm = useCallback(() => {
    if (!formHasLoaded) {
      return () => {
        try {
          // API reference: https://developers.marketo.com/javascript-api/forms/api-reference/
          window.MktoForms2?.loadForm(
            MARKETO_SERVER_INSTANCE,
            MARKETO_SUBSCRIPTION_ID,
            MARKETO_FORM_ID,
            () => {
              const marketoForm = window.MktoForms2
              if (marketoForm) {
                marketoForm.getForm(MARKETO_FORM_ID).setValues({
                  Quartz_User_ID__c: parseInt(user.id),
                  Quartz_Account_ID__c: accountId,
                })
                setFormHasLoaded(true)
              }
            }
          )
        } catch (err) {
          handleError(err, 'failed to load marketo account upgrade form')
        }
      }
    }
    return () => null
  }, [user, accountId, formHasLoaded, handleError])

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
        handleError(err, 'failed to load marketo account upgrade script')
      }
    }
  }, [accountId, handleError, loadMarketoForm, scriptHasLoaded, user])

  return (
    <Overlay.Container
      maxWidth={600}
      className="marketo-upgrade-account-overlay--container"
      testID="marketo-upgrade-account-overlay--container"
    >
      <Overlay.Header
        className="marketo-upgrade-account-overlay--header"
        testID="marketo-upgrade-account-overlay--header"
        title="Upgrade Your Account"
        onDismiss={unloadForm}
      />
      <Overlay.Body className="marketo-upgrade-account-overlay--body">
        <p>
          You've reached the organization quota for your current account type.
        </p>
        <p>
          Click 'Contact Sales', and an InfluxData team member will reach out to
          you.
        </p>
        <br />
        <form id={`mktoForm_${MARKETO_FORM_ID.toString()}`} />
      </Overlay.Body>
      <Overlay.Footer>
        <Button
          text="Cancel"
          testID="marketo-upgrade-account-overlay--cancel-button"
          color={ComponentColor.Default}
          onClick={unloadForm}
        />
        <Button
          text="Contact Sales"
          testID="create-org-form-submit"
          color={ComponentColor.Primary}
          status={ComponentStatus.Default}
          onClick={handleFormSubmission}
        />
      </Overlay.Footer>
    </Overlay.Container>
  )
}
