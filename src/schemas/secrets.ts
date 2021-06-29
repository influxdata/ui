// Libraries
import {schema} from 'normalizr'

// Types
import {ResourceType} from 'src/types'

// Defines the schema for the secrets resource
export const secretsSchema = new schema.Entity(ResourceType.Secrets)

export const arrayOfSecrets = [secretsSchema]
