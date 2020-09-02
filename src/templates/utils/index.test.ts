import {
  getTemplateNameFromUrl,
  findIncludedsFromRelationships,
  findIncludedFromRelationship,
  findIncludedVariables,
  getTemplateDetails,
  getGithubUrlFromTemplateDetails,
} from 'src/templates/utils/'
import {TemplateType} from 'src/types'

const includeds = [
  {type: TemplateType.Cell, id: '1', attributes: {id: 'a'}},
  {type: TemplateType.View, id: '3'},
  {type: TemplateType.Variable, id: '3'},
  {type: TemplateType.Variable, id: '1'},
]
const relationships = [{type: TemplateType.Cell, id: '1'}]

describe('Templates utils', () => {
  describe('findIncludedsFromRelationships', () => {
    it('finds item in included that matches relationship', () => {
      const actual = findIncludedsFromRelationships(includeds, relationships)
      const expected = [
        {type: TemplateType.Cell, id: '1', attributes: {id: 'a'}},
      ]

      expect(actual).toEqual(expected)
    })
  })

  describe('findIncludedFromRelationship', () => {
    it('finds included that matches relationship', () => {
      const actual = findIncludedFromRelationship(includeds, relationships[0])
      const expected = {type: TemplateType.Cell, id: '1', attributes: {id: 'a'}}

      expect(actual).toEqual(expected)
    })
  })

  describe('findIncludedVariables', () => {
    it('finds included that matches relationship', () => {
      const actual = findIncludedVariables(includeds)
      const expected = [
        {type: TemplateType.Variable, id: '3'},
        {type: TemplateType.Variable, id: '1'},
      ]

      expect(actual).toEqual(expected)
    })
  })

  describe('getting the template details from an influx community template', () => {
    it('returns the proper template details for a given github url', () => {
      const actual = getTemplateDetails(
        'https://github.com/influxdata/community-templates/blob/master/modbus/modbus.yml'
      )
      const expected = {
        directory: 'modbus',
        templateExtension: 'yml',
        templateName: 'modbus',
      }

      expect(actual).toEqual(expected)
    })
  })

  describe('getting template details from a local file template', () => {
    it('returns empty strings for all details as file templates are not implemented yet', () => {
      const actual = getTemplateDetails('file://')
      const expected = {
        directory: '',
        templateExtension: '',
        templateName: '',
      }

      expect(actual).toEqual(expected)
    })
  })

  describe('handling errors when getting template details', () => {
    it('throws an error when it cannot parse the template provided', () => {
      expect(() => {
        getTemplateDetails('octopus')
      }).toThrowError()
    })
  })

  describe("getting the influx community template url from the template's details", () => {
    it('returns the proper url for the template', () => {
      const actual = getGithubUrlFromTemplateDetails('modbus', 'modbus', 'yml')
      const expected =
        'https://github.com/influxdata/community-templates/blob/master/modbus/modbus.yml'

      expect(actual).toEqual(expected)
    })
  })

  it('Get back the proper url', () => {
    const actual = getGithubUrlFromTemplateDetails('docker', 'docker', 'yml')
    const expected =
      'https://github.com/influxdata/community-templates/blob/master/docker/docker.yml'

    expect(actual).toEqual(expected)
  })

  it('Get back the proper url', () => {
    const actual = getGithubUrlFromTemplateDetails(
      'kafka',
      'kafka-template',
      'yml'
    )
    const expected =
      'https://github.com/influxdata/community-templates/blob/master/kafka/kafka-template.yml'

    expect(actual).toEqual(expected)
  })
})

describe('the Community Template url utilities', () => {
  it('returns the template name, directory, and extension from an arbitrary url', () => {
    const {name, extension, directory} = getTemplateNameFromUrl(
      'https://github.com/influxdata/influxdb/blob/master/pkger/testdata/dashboard_params.yml'
    )

    expect(name).toBe('dashboard_params')
    expect(extension).toBe('yml')
    expect(directory).toBe('testdata')
  })

  it('returns the template name and extension from the official community templates github repo', () => {
    const {name, extension, directory} = getTemplateNameFromUrl(
      'https://github.com/influxdata/community-templates/blob/master/hooray/csgo.yml'
    )
    expect(name).toBe('csgo')
    expect(extension).toBe('yml')
    expect(directory).toBe('hooray')
  })

  it('returns the template name and extension from the official community templates github repo when the extension is not yml', () => {
    const {name, extension, directory} = getTemplateNameFromUrl(
      'https://github.com/influxdata/community-templates/blob/master/csgo/csgo.json'
    )
    expect(name).toBe('csgo')
    expect(extension).toBe('json')
    expect(directory).toBe('csgo')
  })

  it('returns the template name and extension from arbitrary urls', () => {
    const {name, extension, directory} = getTemplateNameFromUrl(
      'https://www.example.com/csgo/csgo.json'
    )
    expect(name).toBe('csgo')
    expect(extension).toBe('json')
    expect(directory).toBe('csgo')
  })

  it('handles non secure arbitrary urls', () => {
    const {name, extension, directory} = getTemplateNameFromUrl(
      'http://www.example.com/blog/cats/catstuff/memes/-------/downsampling.yml'
    )
    expect(name).toBe('downsampling')
    expect(extension).toBe('yml')
    expect(directory).toBe('-------')
  })
})
