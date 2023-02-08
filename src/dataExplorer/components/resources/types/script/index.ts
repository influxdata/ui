import {ResourceType} from 'src/types/resources'
import editor from './editor'
import {CLOUD} from 'src/shared/constants'
import {
  DEFAULT_FLUX_EDITOR_TEXT,
  DEFAULT_SQL_EDITOR_TEXT,
} from 'src/dataExplorer/context/persistance'
import {LanguageType} from 'src/dataExplorer/components/resources'
import {getLanguage} from 'src/dataExplorer/shared/utils'

const {getScript, patchScript, postScript} = CLOUD
  ? require('src/client/scriptsRoutes')
  : {
      getScript: false,
      patchScript: false,
      postScript: false,
    }

export const scriptResourceRegistration = () => {
  return {
    type: ResourceType.Scripts,
    editor,
    init: id => {
      if (!id || !CLOUD) {
        const language = getLanguage()
        let flux = DEFAULT_FLUX_EDITOR_TEXT

        if (language === LanguageType.SQL) {
          flux = DEFAULT_SQL_EDITOR_TEXT
        }

        return Promise.resolve({
          type: ResourceType.Scripts,
          flux,
          data: {},
          language,
        })
      }

      return getScript({
        scriptID: id,
      }).then(resp => {
        if (resp.status === 200) {
          return {
            type: ResourceType.Scripts,
            flux: resp.data.script,
            data: resp.data,
            language: resp.data.language,
          }
        }

        return {
          type: ResourceType.Scripts,
          flux: DEFAULT_FLUX_EDITOR_TEXT,
          data: {},
          language: LanguageType.FLUX,
        }
      })
    },
    persist: resource => {
      const language = resource?.language
      const data = JSON.parse(JSON.stringify(resource.data))
      data.script = resource.flux

      if (!CLOUD) {
        return resource
      }

      if (data.id) {
        return patchScript({
          scriptID: data.id,
          data: {
            name: data.name,
            description: data?.description || ' ',
            script: data.script,
          },
        }).then(resp => {
          if (resp.status !== 200) {
            throw new Error(resp.data.message)
          }

          return resource
        })
      }

      return postScript({
        data: {
          name: data.name,
          description: data?.description || ' ',
          script: data.script,
          language: language ?? LanguageType.FLUX,
        },
      }).then(resp => {
        if (resp.status !== 201) {
          throw new Error(resp.data.message)
        }

        return {
          ...resource,
          data: {
            ...data,
            id: resp.data.id,
          },
        }
      })
    },
  }
}
