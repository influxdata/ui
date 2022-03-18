// Libraries
import {schema} from 'normalizr'

// Types
import {ResourceType} from 'src/types'

/* FluxDocs */

// Defines the schema for the fluxDocs resource
export const fluxDocSchema = new schema.Entity(ResourceType.FluxDocs)

export const arrayOfFluxDocs = [fluxDocSchema]
