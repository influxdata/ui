// Constants
import {CLOUD} from 'src/shared/constants'

// Libraries
import React, {FC, useEffect} from 'react'
import {useSelector, useDispatch} from 'react-redux'

// Components
import BillingFree from 'src/billing/components/Free/Free'
import BillingPayAsYouGo from 'src/billing/components/PayAsYouGo/PayAsYouGo'
import MarketplaceBilling from 'src/billing/components/marketplace/MarketplaceBilling'

// Utils
import {getQuartzMe} from 'src/me/selectors'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Thunks
import {getBillingProviderThunk} from 'src/identity/actions/thunks'

const BillingPageContents: FC = () => {
  const dispatch = useDispatch()
  const quartzMe = useSelector(getQuartzMe)

  useEffect(() => {
    // After isFlagEnabled is removed, keep other condition. billingProvider isn't delivered by /quartz/identity.
    if (
      CLOUD &&
      isFlagEnabled('uiUnificationFlag') && // Need this check to avoid having quartz endpoints hit in tools.
      isFlagEnabled('quartzIdentity') &&
      quartzMe.billingProvider === null
    ) {
      // billingProviderThunk populates billingProvider into 'identity' and (for now) 'me' state.
      dispatch(getBillingProviderThunk())
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (
    (quartzMe?.accountType === 'pay_as_you_go' ||
      quartzMe?.accountType === 'contract') &&
    quartzMe?.billingProvider !== 'zuora'
  ) {
    return <MarketplaceBilling />
  }

  if (quartzMe?.accountType === 'pay_as_you_go') {
    return <BillingPayAsYouGo />
  }

  return <BillingFree />
}

export default BillingPageContents
