// Libraries
import React, {FC, Component, ComponentClass, useEffect} from 'react'
import {useParams, useHistory} from 'react-router-dom'
import {History} from 'history'
import {useDispatch} from 'react-redux'
import {OverlayID} from 'src/overlays/reducers/overlays'

// Actions
import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'

// NOTE(alex b): I don't know what is wrong with the type definition of react-router
// but it doesn't include params on an injected router upon route resolution

export type OverlayDismissalWithRoute = (
  history: History,
  params: Record<string, string>
) => void

interface OwnProps {
  overlayID: OverlayID
  onClose: OverlayDismissalWithRoute
}

type OverlayHandlerProps = OwnProps

const OverlayHandler: FC<OverlayHandlerProps> = props => {
  const {overlayID, onClose} = props
  const history = useHistory()
  const params = useParams()
  const dispatch = useDispatch()

  useEffect(() => {
    const closer = () => {
      onClose(history, params)
    }

    dispatch(showOverlay(overlayID, params, closer))

    return () => {
      dispatch(dismissOverlay())
    }
  }, [overlayID]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}

const routedComponent = OverlayHandler

export default routedComponent

interface RouteOverlayProps {
  overlayID: OverlayID
}

export function RouteOverlay<P>(
  WrappedComponent: typeof routedComponent,
  overlayID: string,
  onClose?: OverlayDismissalWithRoute
): ComponentClass<P> {
  return class extends Component<P & RouteOverlayProps> {
    public render() {
      return (
        <WrappedComponent
          {...this.props}
          onClose={onClose}
          overlayID={overlayID}
        />
      )
    }
  }
}
