import {File} from 'src/types/ast'
import {
  initLog,
  parse as flux_parse,
  format_from_js_file as flux_format_from_js_file,
  is_valid_flux as flux_is_valid_flux,
} from '@influxdata/flux-lsp-browser'

initLog()

/*
  NOTE: This is a work around for flux being generated (from rust) for the browser and jest tests running in
        a node environment (this is only for handling tests). If a test requires a specific AST result
        then you will need to mock that out in the test.
*/
export const parse = (script: string): File => {
  if (window) {
    return flux_parse(script)
  } else {
    return {
      type: 'File',
      package: {
        name: {
          name: 'fake',
          type: 'Identifier',
        },
        type: 'PackageClause',
      },
      imports: [],
      body: [],
    }
  }
}

export const format_from_js_file = (script: File): string => {
  if (window) {
    return flux_format_from_js_file(script)
  } else {
    return ''
  }
}

export const is_valid_flux = (script: string): boolean => {
  if (window) {
    return flux_is_valid_flux(script)
  } else {
    return false
  }
}
