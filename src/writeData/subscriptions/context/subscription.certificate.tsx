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
  removeCertificate: () => void
  updateCertificate: (_: Certificate) => void
}

export const DEFAULT_CONTEXT: SubscriptionCertificateContextType = {
  certificate: null,
  removeCertificate: () => null,
  updateCertificate: (_: Certificate) => null,
} as SubscriptionCertificateContextType

export const SubscriptionCertificateContext = React.createContext<
  SubscriptionCertificateContextType
>(DEFAULT_CONTEXT)

export const SubscriptionCertificateProvider: FC = ({children}) => {
  const [certificate, setCertificate] = useState<Certificate>(
    DEFAULT_CONTEXT.certificate
  )

  const removeCertificate = useCallback(() => {
    setCertificate(null)
  }, [setCertificate])

  const updateCertificate = useCallback(
    (cert: Certificate) => {
      setCertificate(cert)
    },
    [setCertificate]
  )

  return (
    <SubscriptionCertificateContext.Provider
      value={{
        certificate,
        removeCertificate,
        updateCertificate,
      }}
    >
      {children}
    </SubscriptionCertificateContext.Provider>
  )
}

export default SubscriptionCertificateProvider
