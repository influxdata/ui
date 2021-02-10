interface AlternateSubdivisions {
  intlSubdivision?: string
  usSubdivision?: string
}

interface ContactBase {
  street1: string
  street2: string
  city: string
  country: string
  postalCode: string
}

export type Contact = ContactBase & AlternateSubdivisions
