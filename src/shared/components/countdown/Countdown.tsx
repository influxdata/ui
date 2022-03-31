import React, {PureComponent} from 'react'

type Props = {
  from: number
}

type State = {
  secondsLeft: number
}

export class Countdown extends PureComponent<Props, State> {
  private countdownTimer: ReturnType<typeof setInterval>
  constructor(props) {
    super(props)
    this.state = {
      secondsLeft: this.props.from,
    }
  }

  componentDidMount() {
    this.startTimer()
  }

  private startTimer() {
    this.setState({secondsLeft: this.props.from})

    // tick every 1000ms
    this.countdownTimer = setInterval(this.countDown, 1000)
  }

  componentWillUnmount() {
    clearInterval(this.countdownTimer)
    this.setState({secondsLeft: this.props.from})
  }

  private countDown = () => {
    const {secondsLeft} = this.state
    const secs = secondsLeft - 1
    this.setState({
      secondsLeft: secs,
    })

    if (secs === 0) {
      clearInterval(this.countdownTimer)
    }
  }

  render() {
    return <>{this.state.secondsLeft}</>
  }
}
