import React, {
  ChangeEvent,
  createRef,
  CSSProperties,
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
  ComponentStatus,
  Columns,
  Grid,
  Input,
} from '@influxdata/clockface'
import DatePicker from 'src/shared/components/dateRangePicker/DatePicker'
import {AccountContext} from 'src/operator/context/account'
import moment from 'moment'

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
    if (startDateInputStatus !== ComponentStatus.Error) {
      try {
        handleConvertAccountToContract(startDateInput)
        setConvertToContractOverlayVisible(false)
      } catch (e) {
        setConvertToContractOverlayVisible(false)
      }
    }
  }

  const dateFormat = 'YYYY-MM-DD'
  const convertToMomentDate = (date: Date | string) => moment(date, true)
  const isValidDate = (date: Date | string) =>
    convertToMomentDate(date).isValid()
  const formatDate = (date: Date | string) =>
    convertToMomentDate(date).format(dateFormat)

  const [startDateInput, setStartDateInput] = useState<string>(
    formatDate(new Date())
  )

  const [startDateInputStatus, setStartDateInputStatus] = useState<
    ComponentStatus
  >(ComponentStatus.Default)

  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false)

  const [
    isOnClickOutsideHandlerActive,
    setIsOnClickOutsideHandlerActive,
  ] = useState<boolean>(true)

  const triggerRef: RefObject<ButtonRef> = createRef()

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    setStartDateInput(event.target.value)
  }

  const handleBlur = () => {
    if (isValidDate(startDateInput)) {
      setStartDateInputStatus(ComponentStatus.Default)
    } else {
      setStartDateInputStatus(ComponentStatus.Error)
    }
  }

  const getDatePickerDateTime = () => {
    const date = convertToMomentDate(startDateInput)
    return !Number.isNaN(date.valueOf())
      ? date.toISOString()
      : new Date().toISOString()
  }

  const handleReset = () => {
    setStartDateInput('')
    setStartDateInputStatus(ComponentStatus.Default)
  }

  const showDatePicker = () => setIsDatePickerOpen(true)
  const hideDatePicker = () => setIsDatePickerOpen(false)

  const toggleDatePicker = () => {
    if (isDatePickerOpen) {
      hideDatePicker()
    } else {
      showDatePicker()
    }
  }

  const handleSelectDate = (date: string) => {
    if (isValidDate(date)) {
      const formattedDate = formatDate(date)
      setStartDateInput(formattedDate)
      setStartDateInputStatus(ComponentStatus.Default)
    } else {
      setStartDateInput('')
      setStartDateInputStatus(ComponentStatus.Error)
    }
  }

  const onClickOutside = () => {
    if (isOnClickOutsideHandlerActive) {
      hideDatePicker()
    }
  }

  const allowOnClickOutside = () => setIsOnClickOutsideHandlerActive(true)
  const suppressOnClickOutside = () => setIsOnClickOutsideHandlerActive(false)

  const styles: CSSProperties = isDatePickerOpen
    ? {position: 'relative'}
    : {
        top: `${window.innerHeight / 2}px`,
        left: `${window.innerWidth / 2}px`,
        transform: `translate(-50%, -50%)`,
      }

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
          style={{color: '#FFFFFF'}}
          onDismiss={() =>
            setConvertToContractOverlayVisible(!convertToContractOverlayVisible)
          }
        />
        <Overlay.Body>
          <Alert color={ComponentColor.Danger} icon={IconFont.AlertTriangle}>
            This action cannot be undone
          </Alert>
          <h4 style={{color: '#FFFFFF'}}>
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
            <Form.Element label="Contract Start Date (YYYY-MM-DD)">
              <Input
                placeholder="YYYY-MM-DD"
                onChange={handleInput}
                onBlur={handleBlur}
                value={startDateInput}
                status={startDateInputStatus}
              />
            </Form.Element>
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
                    <div
                      className="range-picker react-datepicker-ignore-onclickoutside"
                      style={{...styles}}
                    >
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
                      <Button
                        color={ComponentColor.Danger}
                        onClick={handleReset}
                        size={ComponentSize.Small}
                        text="Reset"
                      />
                    </div>
                  </ClickOutside>
                )}
              />
              {isDatePickerOpen ? (
                <Button
                  ref={triggerRef}
                  color={ComponentColor.Danger}
                  onClick={hideDatePicker}
                  onMouseEnter={suppressOnClickOutside}
                  onMouseLeave={allowOnClickOutside}
                  size={ComponentSize.Small}
                  icon={IconFont.Calendar}
                />
              ) : (
                <Button
                  ref={triggerRef}
                  color={ComponentColor.Primary}
                  onClick={toggleDatePicker}
                  onMouseEnter={suppressOnClickOutside}
                  onMouseLeave={allowOnClickOutside}
                  size={ComponentSize.Small}
                  icon={IconFont.Calendar}
                />
              )}
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
