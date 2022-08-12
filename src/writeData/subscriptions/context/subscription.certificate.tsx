// Libraries
import React, {FC, useState, useCallback} from 'react'

// Utils

// Types

// Contexts

export interface Certificate {
  rootCA?: string
  key?: string
  cert?: string
}

export interface SubscriptionCertificateContextType {
  certificate: Certificate | null
  isUpdatedCertificate: boolean
  removeCertificate: () => void
  updateCertificate: (_: Certificate) => void
}

export const DEFAULT_CONTEXT: SubscriptionCertificateContextType = {
  certificate: null,
  isUpdatedCertificate: false,
  removeCertificate: () => null,
  updateCertificate: (_: Certificate) => null,
} as SubscriptionCertificateContextType

export const SubscriptionCertificateContext = React.createContext<
  SubscriptionCertificateContextType
>(DEFAULT_CONTEXT)

export const SubscriptionCertificateProvider: FC = ({children}) => {
  const [isUpdated, setIsUpdated] = useState(false)
  const [certificate, setCertificate] = useState<Certificate>(
    DEFAULT_CONTEXT.certificate
  )

  const removeCertificate = useCallback(() => {
    setCertificate(null)
  }, [setCertificate])

  const updateCertificate = useCallback(
    (cert: Certificate, isUpdatedCertificate = true) => {
      setCertificate(cert)
      setIsUpdated(isUpdatedCertificate)
    },
    [setCertificate]
  )

  return (
    <SubscriptionCertificateContext.Provider
      value={{
        certificate,
        removeCertificate,
        updateCertificate,
        isUpdatedCertificate: isUpdated,
      }}
    >
      {children}
    </SubscriptionCertificateContext.Provider>
  )
}

export default SubscriptionCertificateProvider
