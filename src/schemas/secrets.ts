// Libraries
import {schema} from 'normalizr'

// Types
import {ResourceType} from 'src/types'

/* Tasks */

// Defines the schema for the tasks resource
export const secretsSchema = new schema.Entity(ResourceType.Secrets)

export const arrayOfSecrets = [secretsSchema]
