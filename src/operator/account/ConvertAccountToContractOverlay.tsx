import React, {
  ChangeEvent,
  createRef,
  FC,
  RefObject,
  useContext,
  useState,
} from 'react'
import {
  Overlay,
  Gradients,
  Alert,
  ComponentColor,
  IconFont,
  ButtonBase,
  ButtonShape,
  Appearance,
  Button,
  ClickOutside,
  ComponentSize,
  Form,
  Popover,
  PopoverInteraction,
  PopoverPosition,
  ButtonRef,
  Columns,
  Grid,
  Input,
  InfluxColors,
} from '@influxdata/clockface'
import DatePicker from 'src/shared/components/dateRangePicker/DatePicker'
import {AccountContext} from 'src/operator/context/account'
import {createDateTimeFormatter} from 'src/utils/datetime/formatters'
import {isValidStrictly} from 'src/utils/datetime/validator'

const noOp = () => {}

const ConvertAccountToContractOverlay: FC = () => {
  const {
    account,
    handleConvertAccountToContract,
    organizations,
    setConvertToContractOverlayVisible,
    convertToContractOverlayVisible,
  } = useContext(AccountContext)

  const convertAccountToContract = () => {
    if (!handleStartDateValidation()) {
      try {
        handleConvertAccountToContract(startDateInput)
        setConvertToContractOverlayVisible(false)
      } catch {
        setConvertToContractOverlayVisible(false)
      }
    }
  }

  const dateFormat = 'YYYY-MM-DD'
  const formatDate = (date: Date | string) => {
    const formatter = createDateTimeFormatter(dateFormat)
    return formatter.format(new Date(date))
  }
  const isValidDate = (date: string) => isValidStrictly(date, dateFormat)

  const [startDateInput, setStartDateInput] = useState<string>(
    formatDate(new Date())
  )

  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false)

  const [isOnClickOutsideHandlerActive, setIsOnClickOutsideHandlerActive] =
    useState<boolean>(true)

  const triggerRef: RefObject<ButtonRef> = createRef()

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    setStartDateInput(event.target.value)
  }

  const handleStartDateValidation = () => {
    if (!isValidDate(startDateInput)) {
      return `Date format must be ${dateFormat}`
    }
    return null
  }

  const getDatePickerDateTime = () => {
    let date = new Date(startDateInput)
    // Adjust date to ignore timezone since the time isn't needed
    const timezoneOffset = date.getTimezoneOffset() * 60000
    date = new Date(date.getTime() + timezoneOffset)
    return !Number.isNaN(date.valueOf())
      ? date.toISOString()
      : new Date().toISOString()
  }

  const handleSelectDate = (date: string) => setStartDateInput(formatDate(date))

  const showDatePicker = () => setIsDatePickerOpen(true)
  const hideDatePicker = () => setIsDatePickerOpen(false)

  const toggleDatePicker = () => {
    if (isDatePickerOpen) {
      hideDatePicker()
    } else {
      showDatePicker()
    }
  }

  const onClickOutside = () => {
    if (isOnClickOutsideHandlerActive) {
      hideDatePicker()
    }
  }

  const allowOnClickOutside = () => setIsOnClickOutsideHandlerActive(true)
  const suppressOnClickOutside = () => setIsOnClickOutsideHandlerActive(false)

  return (
    <Overlay
      visible={convertToContractOverlayVisible}
      renderMaskElement={() => (
        <Overlay.Mask gradient={Gradients.DangerDark} style={{opacity: 0.5}} />
      )}
      testID="delete-overlay"
      transitionDuration={0}
    >
      <Overlay.Container maxWidth={600}>
        <Overlay.Header
          title="Convert Account to Contract"
          style={{color: InfluxColors.White}}
          onDismiss={() =>
            setConvertToContractOverlayVisible(!convertToContractOverlayVisible)
          }
        />
        <Overlay.Body>
          <Alert color={ComponentColor.Danger} icon={IconFont.AlertTriangle}>
            This action cannot be undone
          </Alert>
          <h4 style={{color: InfluxColors.White}}>
            <strong>Warning</strong>
          </h4>
          <p>
            This action will convert the account to an annual contract account.
            This will affect the billing for all orgs in the account.
          </p>
          <p>Account ID: {account?.id ?? 'N/A'}</p>
          <p>Organization Name: {organizations?.[0]?.name ?? 'N/A'}</p>
          <p>Billing Contact: {account?.billingContact?.email ?? 'N/A'}</p>
          <Grid.Column widthXS={Columns.Twelve}>
            <Form.ValidationElement
              value={startDateInput}
              validationFunc={handleStartDateValidation}
              label="Contract Start Date (YYYY-MM-DD)"
            >
              {status => (
                <Input
                  placeholder="YYYY-MM-DD"
                  onChange={handleInput}
                  value={startDateInput}
                  status={status}
                />
              )}
            </Form.ValidationElement>
          </Grid.Column>
          <Grid.Column widthXS={Columns.Twelve}>
            <Form.Element label="Date Picker">
              <Popover
                appearance={Appearance.Outline}
                position={PopoverPosition.ToTheRight}
                triggerRef={triggerRef}
                visible={isDatePickerOpen}
                showEvent={PopoverInteraction.None}
                hideEvent={PopoverInteraction.None}
                distanceFromTrigger={8}
                testID="timerange-popover"
                enableDefaultStyles={false}
                contents={() => (
                  <ClickOutside onClickOutside={onClickOutside}>
                    <div className="range-picker react-datepicker-ignore-onclickoutside contract-start-date-picker">
                      <button
                        className="range-picker--dismiss"
                        onClick={hideDatePicker}
                      />
                      <div className="range-picker--date-pickers">
                        <DatePicker
                          dateTime={getDatePickerDateTime()}
                          onSelectDate={handleSelectDate}
                          label="Contract Start Date"
                          onInvalidInput={noOp}
                        />
                      </div>
                    </div>
                  </ClickOutside>
                )}
              />
              <Button
                ref={triggerRef}
                color={ComponentColor.Primary}
                onClick={toggleDatePicker}
                onMouseEnter={suppressOnClickOutside}
                onMouseLeave={allowOnClickOutside}
                size={ComponentSize.Small}
                icon={IconFont.Calendar}
              />
            </Form.Element>
          </Grid.Column>
        </Overlay.Body>
        <Overlay.Footer>
          <ButtonBase
            color={ComponentColor.Primary}
            shape={ButtonShape.Default}
            onClick={convertAccountToContract}
            testID="convert-account-to-contract--confirmation-button"
          >
            Convert account
          </ButtonBase>
        </Overlay.Footer>
      </Overlay.Container>
    </Overlay>
  )
}

export default ConvertAccountToContractOverlay
