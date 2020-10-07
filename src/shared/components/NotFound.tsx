import React, {FC} from 'react'

const NotFound: FC = () => (
  <div className="container-fluid" data-testid="not-found">
    <div className="panel">
      <div className="panel-heading text-center">
        <h2 className="deluxe">404</h2>
        <h4>Bummer! We couldn't find the page you were looking for</h4>
      </div>
    </div>
  </div>
)
export default NotFound
