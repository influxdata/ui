// Constants
import {FROM, UNION} from 'src/shared/constants/fluxFunctions'

export const functionRequiresNewLine = (funcName: string): boolean => {
  switch (funcName) {
    case FROM.name:
    case UNION.name: {
      return true
    }
    default:
      return false
  }
}

export const generateImport = (
  funcPackage: string,
  script: string
): false | string => {
  const importStatement = `import "${funcPackage}"`

  if (!funcPackage || script.includes(importStatement)) {
    return false
  }

  return importStatement
}

export const getFluxExample = func => {
  const {name, fluxType} = func

  // "fluxType": "(<-tables:stream[A], every:duration, ?groupColumns:[string], ?unit:duration) => stream[B] where A: Record, B: Record"

  // get copy of fluxtype signature before arrow sign
  const arrowSign = fluxType.lastIndexOf('=') // using lastIndexOf because of edge cases like array.filter
  const fluxParam = fluxType.slice(0, arrowSign) // fluxParam = (<-tables:stream[A], every:duration, ?groupColumns:[string], ?unit:duration)

  // pull out all parameters found in between paranethesis
  const openingParenthesis = fluxParam.indexOf('(')
  const closingParenthesis = fluxParam.lastIndexOf(')')
  const parametersAsOneSentence = fluxParam
    .substring(openingParenthesis + 1, closingParenthesis)
    .replace(/\s/g, '')

  // parametersAsOneSentence = <-tables:stream[A],every:duration,?groupColumns:[string],?unit:duration

  // sparate parametersAsOneSentence into individual Parameters
  // some flux parameters cant be sperated by commas because some stand alone params contain commas. ex below
  // (t:A, ?location:{zone:string, offset:duration}) => int where A: Timeable"
  // below code separates them by keeping track of opening and closing brackets

  const individualParams = []
  const stack = []
  const brackets = {
    '(': ')',
    '[': ']',
    '{': '}',
  }
  let param = ''

  for (let i = 0; i < parametersAsOneSentence.length; i++) {
    if (parametersAsOneSentence[i] === ',' && !stack.length) {
      // case: params with no brackets in them
      if (!param.startsWith('?') && !param.startsWith('<')) {
        // checks if param is optional. if not, push to individialParams array
        individualParams.push(param)
        param = ''
        i++
      }
    }
    param += parametersAsOneSentence[i]

    if (brackets.hasOwnProperty(parametersAsOneSentence[i])) {
      // if element is opening bracket
      stack.push(parametersAsOneSentence[i])
    }
    if (Object.values(brackets).includes(parametersAsOneSentence[i])) {
      // if element is closing bracket
      const closingBracket = stack.pop()
      // if element is the correct closing bracket AND stack is empty
      // AND the next element is a comma, we have a complete parameter.
      if (
        parametersAsOneSentence[i] === brackets[closingBracket] &&
        !stack.length &&
        parametersAsOneSentence[i + 1] === ','
      ) {
        if (!param.startsWith('?') && !param.startsWith('<')) {
          // checks if param is optional
          individualParams.push(param)
          param = ''
          i++
        } else {
          // we have an optional param. set param to empty
          param = ''
          i++
        }
      }
    }
    if (i === parametersAsOneSentence.length - 1) {
      // end of iteration
      if (!param.startsWith('?') && !param.startsWith('<')) {
        individualParams.push(param)
      }
    }
  }

  // at this point, individualParams array should have all required parameters to parse a signature

  /* individualParams = [
    'default:A',
    'dict:[B:A]',
    'key:B'
    ]
  */

  individualParams.forEach((element, index) => {
    // remove parameter placeholders
    const emptyPlaceholder = element.split(':')[0] + ': ' // dict:
    individualParams[index] = emptyPlaceholder
  })
  /* individualParams = [
    'default: ',
    'dict: ',
    'key: '
    ]
  */

  // join the individual params to create the signature
  const signature =
    `${func.package}.${name}` + `(` + individualParams.join(', ') + `)`

  // add example property to flux function object
  return {...func, example: signature}
}
