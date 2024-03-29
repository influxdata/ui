import {
  TemplateType,
  LabelIncluded,
  VariableIncluded,
  Relationships,
  LabelRelationship,
  Label,
  Variable,
} from 'src/types'

export function findIncludedsFromRelationships<
  T extends {id: string; type: TemplateType}
>(
  includeds: {id: string; type: TemplateType}[],
  relationships: {id: string; type: TemplateType}[]
): T[] {
  let intersection = []
  relationships.forEach(r => {
    const included = findIncludedFromRelationship<T>(includeds, r)
    if (included) {
      intersection = [...intersection, included]
    }
  })
  return intersection
}

export function findIncludedFromRelationship<
  T extends {id: string; type: TemplateType}
>(
  included: {id: string; type: TemplateType}[],
  r: {id: string; type: TemplateType}
): T {
  return included.find((i): i is T => i.id === r.id && i.type === r.type)
}

export const findLabelsToCreate = (
  currentLabels: Label[],
  labels: LabelIncluded[]
): LabelIncluded[] => {
  return labels.filter(
    l => !currentLabels.find(el => el.name === l.attributes.name)
  )
}

export const findIncludedVariables = (included: {type: TemplateType}[]) => {
  return included.filter((r): r is VariableIncluded => r.type === 'variable')
}

export const findVariablesToCreate = (
  existingVariables: Variable[],
  incomingVariables: VariableIncluded[]
): VariableIncluded[] => {
  return incomingVariables.filter(
    v => !existingVariables.find(ev => ev.name === v.attributes.name)
  )
}

export const hasLabelsRelationships = (resource: {
  relationships?: Relationships
}) => !!resource.relationships && !!resource.relationships['label']

export const getLabelRelationships = (resource: {
  relationships?: Relationships
}): LabelRelationship[] => {
  if (!hasLabelsRelationships(resource)) {
    return []
  }

  return [].concat(resource.relationships['label'].data)
}

export const getIncludedLabels = (included: {type: TemplateType}[]) =>
  included.filter((i): i is LabelIncluded => i.type === 'label')

export interface TemplateDetails {
  directory: string
  templateExtension: string
  templateName: string
}

// See https://github.com/influxdata/community-templates/
const getTemplateDetailsFromGithubSource = (url: string): TemplateDetails => {
  const [, templatePath] = url.split('/master/')
  const [directory, name] = templatePath.split('/')
  const [templateName, templateExtension] = name.split('.')
  return {
    directory,
    templateExtension,
    templateName,
  }
}

// todo: implement when we load files
const getTemplateDetailsFromFileSource = (_source: string): TemplateDetails => {
  return {
    directory: '',
    templateExtension: '',
    templateName: '',
  }
}

export const getTemplateNameFromUrl = (
  url: string
): {name: string; extension: string; directory: string} => {
  const urlSplit = url.split('/')
  const fullName = urlSplit.pop()
  const directory = urlSplit.pop()
  const [name, extension] = fullName.split('.')
  return {name, extension, directory}
}

export const getTemplateDetails = (source: string): TemplateDetails => {
  if (source.includes('https')) {
    return getTemplateDetailsFromGithubSource(source)
  }

  if (source.includes('file://')) {
    return getTemplateDetailsFromFileSource(source)
  }

  throw new Error('unsupported format')
}

export const getGithubUrlFromTemplateDetails = (
  directory: string,
  templateName: string,
  templateExtension: string
): string => {
  return `https://github.com/influxdata/community-templates/blob/master/${directory}/${templateName}.${templateExtension}`
}

export const TEMPLATE_URL_VALID = "You're good to go!"
export const TEMPLATE_URL_WARN =
  'This URL does not point to our Community Templates repository. It may work but we cannot guarantee quality results.'

export const validateTemplateURL = (url): string => {
  if (url === '') {
    return ''
  }

  /*
     url may or may not have a query at the end. Either case is a valid url.
     We need to make sure the url is pointing to a valid template.
  */
  const cleanUrl = url.trim().split('?')[0]

  if (cleanUrl.includes(' ')) {
    return "Your URL can't contain spaces"
  }

  const isCommunityTemplates =
    cleanUrl.startsWith('https://github.com/influxdata/community-templates') ||
    cleanUrl.startsWith(
      'https://raw.githubusercontent.com/influxdata/community-templates'
    )

  const isCorrectFileType =
    cleanUrl.endsWith('.yml') ||
    cleanUrl.endsWith('.json') ||
    cleanUrl.endsWith('.jsonnet')

  if (isCommunityTemplates && !isCorrectFileType) {
    return "This URL correctly points to the Community Templates repository but isn't pointing to a YAML or JSON file"
  }

  if (!isCommunityTemplates && isCorrectFileType) {
    return TEMPLATE_URL_WARN
  }

  if (!isCommunityTemplates && !isCorrectFileType) {
    return "We can't use that URL"
  }

  return TEMPLATE_URL_VALID
}

export const readMeFormatter = (text: string) => {
  const setupInstuctions =
    '## Setup Instructions' + text.split('## Setup Instructions')[1]
  const fixLink = setupInstuctions.replace(
    '../docs/use_a_template.md',
    'https://github.com/influxdata/community-templates/blob/master/docs/use_a_template.md'
  )

  return fixLink
}
