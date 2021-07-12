# DateTime Formatter

Our UI's Canonical DateTime formatter. It comes with a component which is aware of the user's preference for timezone being local or UTC. Use this component to format dates for display in the UI.

## Usage

```ts
import {FormattedDateTime} from 'src/utils/datetime/FormattedDateTime'
import {DEFAULT_TIME_FORMAT} from 'src/shared/constants/index'

const FunctionFella: ({timestamp: string}) => {
  return <FormattedDateTime format={DEFAULT_TIME_FORMAT} date={new Date(timestamp)} /> 
}
```
