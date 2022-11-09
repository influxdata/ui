import {File} from 'src/types/ast'
import {
  parse as flux_parse,
  format_from_js_file as flux_format_from_js_file,
} from '@influxdata/flux-lsp-browser'
import {spawn, Thread, Worker} from 'threads'

/* Parse a flux file and return the AST object.
 *
 * The parsing of flux is a cpu-bound task, so this work
 * requires a web worker so as not to block the main thread
 * while the work is done.
 */
export const async_parse = async (source: string): Promise<File> => {
  const flux = await spawn(new Worker('./worker'))
  const ast = await flux.parse(source)
  await Thread.terminate(flux)
  return ast
}

/* Format an AST object into a flux source string.
 *
 * The formatting is a cpu-bound task, so this work requires
 * a web worker so as not to block the main thread while the
 * work is done.
 */
export const async_format = async (ast: File): Promise<string> => {
  const flux = await spawn(new Worker('./worker'))
  const source = await flux.format(ast)
  await Thread.terminate(flux)
  return source
}

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
