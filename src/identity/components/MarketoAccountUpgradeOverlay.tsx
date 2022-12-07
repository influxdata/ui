// Libraries
import React, {FC, useCallback, useContext, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {
  Button,
  ComponentColor,
  ComponentStatus,
  Input,
  InputType,
  Overlay,
} from '@influxdata/clockface'

// Components
import {OverlayContext} from 'src/overlays/components/OverlayController'

// Selectors
import {selectCurrentAccountId, selectUser} from 'src/identity/selectors'

// Error Reporting
import {reportErrorThroughHoneyBadger} from 'src/shared/utils/errors'

// Notifications
import {
  marketoFormSubmitFailure,
  marketoFormSubmitSuccess,
  marketoLoadFailure,
} from 'src/shared/copy/notifications/categories/accounts-users-orgs'

// Utils
import {notify} from 'src/shared/actions/notifications'

// Styles
import './MarketoAccountUpgradeOverlay.scss'

const popupLinkStyle = {
  color: 'white',
  textDecoration: 'underline',
}

// Types
declare let window: WindowObjectPlusMarketoScript

interface WindowObjectPlusMarketoScript extends Window {
  MktoForms2?: MarketoScript
}

interface MarketoScript {
  loadForm?: Function
  getForm?: Function
  whenReady?: Function
}

// Constants
const BACKUP_CONTACT_SALES_LINK = 'https://www.influxdata.com/contact-sales-b/'
const MARKETO_SERVER_INSTANCE = '//get.influxdata.com'
const MARKETO_SUBSCRIPTION_ID = '972-GDU-533'
const MARKETO_FORM_ID = 2826

// Error Messaging
enum MarketoError {
  FormLoadingError = 'FormLoadingError',
  FormSubmitError = 'FormSubmitError',
  ScriptFetchError = 'ScriptFetchError',
  ScriptRuntimeError = 'ScriptRuntimeError',
}

interface MarketoFormElement extends Element {
  disabled: boolean
  readOnly: boolean
}

// If marketo isn't working, still need the user to have some means of contacting sales.
const SalesFormLink = (): JSX.Element => {
  return (
    <a
      data-testid="use-sales-form--link"
      href={BACKUP_CONTACT_SALES_LINK}
      target="_blank"
      style={popupLinkStyle}
    >
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
  const [formComment, setFormComment] = useState('')

  const handleCloseOverlay = () => {
    // Deleting marketo object guards against inconsistent behavior if user closes then re-opens the overlay.
    delete window.MktoForms2
    onClose()
  }

  const handleComment = (evt: React.ChangeEvent<HTMLInputElement>) => {
    if (window.MktoForms2.getForm) {
      try {
        window.MktoForms2.getForm(MARKETO_FORM_ID).setValues({
          Marketing_Notes__c: evt.target.value,
        })
      } catch (err) {
        // Don't use honeybadger in onChange function - otherwise errors will spam our alerts.
        console.error('Unable to locate marketo form.')
      }
    }
    setFormComment(evt.target.value)
  }

  const handleError = useCallback(
    (message: MarketoError, err: Error = new Error(message)) => {
      if (message === MarketoError.FormSubmitError) {
        dispatch(notify(marketoFormSubmitFailure(SalesFormLink)))
      } else {
        dispatch(notify(marketoLoadFailure(SalesFormLink)))
      }

      reportErrorThroughHoneyBadger(err, {
        context: {
          user,
          accountId,
        },
        name: `Marketo account upgrade form ${message}`,
      })
    },
    [accountId, dispatch, user]
  )

  const handleFormSubmission = () => {
    try {
      window.MktoForms2.getForm(MARKETO_FORM_ID).submit()
      dispatch(notify(marketoFormSubmitSuccess()))
      onClose()
    } catch (err) {
      handleError(MarketoError.FormSubmitError, err)
    }
  }

  const loadMarketoForm = useCallback(() => {
    try {
      if (!formHasLoaded) {
        // API: https://developers.marketo.com/javascript-api/forms/api-reference/
        window.MktoForms2?.loadForm(
          MARKETO_SERVER_INSTANCE,
          MARKETO_SUBSCRIPTION_ID,
          MARKETO_FORM_ID,
          () => {
            // Marketo fields should remain hidden from user (CSS display: none)

            const marketoForm = window.MktoForms2
            if (marketoForm) {
              // Autofill the form with the current user and account id.

              marketoForm.getForm(MARKETO_FORM_ID).setValues({
                Email: user.email,
                Quartz_Account_ID__c: accountId,
              })

              // Return false after form submission to prevent page reload.
              marketoForm.whenReady((form: any) => {
                form.onSuccess(() => false)
              })

              document
                .querySelectorAll('input, textarea, button')
                .forEach((input: MarketoFormElement) => {
                  if (
                    input.className.includes('mktoField') ||
                    input.className.includes('mktoButton')
                  ) {
                    input.readOnly = true
                    input.disabled = true
                  }
                })

              setFormHasLoaded(true)
            }
          }
        )
      }
    } catch (err) {
      handleError(MarketoError.FormLoadingError, err)
    }
  }, [accountId, formHasLoaded, handleError, user])

  useEffect(() => {
    try {
      if (!scriptHasLoaded) {
        const marketoScript = document.createElement('script')
        marketoScript.id = 'marketoScript'
        marketoScript.src = `${MARKETO_SERVER_INSTANCE}/js/forms2/js/forms2.min.js`
        marketoScript.async = true
        marketoScript.onload = loadMarketoForm
        marketoScript.onerror = () => handleError(MarketoError.ScriptFetchError)
        document.body.appendChild(marketoScript)
        setScriptHasLoaded(true)
      }
    } catch (err) {
      handleError(MarketoError.ScriptRuntimeError, err)
    }
  }, [accountId, handleError, loadMarketoForm, scriptHasLoaded, user])

  const contactSalesButtonStatus =
    scriptHasLoaded && formHasLoaded
      ? ComponentStatus.Default
      : ComponentStatus.Disabled

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
        onDismiss={handleCloseOverlay}
      />
      <Overlay.Body className="marketo-upgrade-account-overlay--body">
        <p>
          You've reached the organization quota for your current account type.
        </p>
        <p>
          Click 'Contact Sales', and an InfluxData team member will reach out to
          you.
        </p>
        <form
          id={`mktoForm_${MARKETO_FORM_ID.toString()}`}
          className="marketo-account-upgrade--form"
        />
        Comments
        <Input
          autoFocus={true}
          className="marketo-account-upgrade-form--userinput"
          name="Upgrade Account Comments"
          onChange={handleComment}
          placeholder="Please provide any comments for our sales team"
          type={InputType.Text}
          value={formComment}
        ></Input>
      </Overlay.Body>
      <Overlay.Footer>
        <Button
          text="Cancel"
          testID="marketo-upgrade-account-overlay--cancel-button"
          color={ComponentColor.Default}
          onClick={handleCloseOverlay}
        />
        <Button
          text="Contact Sales"
          testID="create-org-form-submit"
          color={ComponentColor.Primary}
          status={contactSalesButtonStatus}
          onClick={handleFormSubmission}
        />
      </Overlay.Footer>
    </Overlay.Container>
  )
}
