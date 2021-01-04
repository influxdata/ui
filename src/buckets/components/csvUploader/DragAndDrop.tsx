import React, {PureComponent, ChangeEvent, RefObject} from 'react'
import classnames from 'classnames'

// Components
import DragAndDropHeader from 'src/buckets/components/csvUploader/DragAndDropHeader'
import DragInfo from 'src/buckets/components/csvUploader/DragInfo'

interface Props {
  className: string
  onSetBody: (body: string) => void
}

interface State {
  fileSize: number
  inputContent: string
  uploadContent: string
  fileName: string
  dragClass: string
}

let dragCounter = 0
class DragAndDrop extends PureComponent<Props, State> {
  private fileInput: RefObject<HTMLInputElement>

  constructor(props: Props) {
    super(props)

    this.fileInput = React.createRef()

    this.state = {
      fileSize: -Infinity,
      inputContent: null,
      uploadContent: '',
      fileName: '',
      dragClass: 'drag-none',
    }
  }

  public componentDidMount() {
    window.addEventListener('dragover', this.handleWindowDragOver)
    window.addEventListener('drop', this.handleFileDrop)
    window.addEventListener('dragenter', this.handleDragEnter)
    window.addEventListener('dragleave', this.handleDragLeave)
  }

  public componentWillUnmount() {
    window.removeEventListener('dragover', this.handleWindowDragOver)
    window.removeEventListener('drop', this.handleFileDrop)
    window.removeEventListener('dragenter', this.handleDragEnter)
    window.removeEventListener('dragleave', this.handleDragLeave)
  }

  public render() {
    const {uploadContent, fileName} = this.state

    return (
      <div className={this.containerClass}>
        <div className={this.dragAreaClass} onClick={this.handleFileOpen}>
          <DragAndDropHeader
            uploadContent={uploadContent}
            fileName={fileName}
          />
          <DragInfo uploadContent={uploadContent} />
          <input
            type="file"
            data-testid="drag-and-drop--input"
            ref={this.fileInput}
            className="drag-and-drop--input"
            accept="*"
            onChange={this.handleFileClick}
          />
        </div>
      </div>
    )
  }

  private handleWindowDragOver = (event: DragEvent) => {
    event.preventDefault()
  }

  private get containerClass(): string {
    const {dragClass} = this.state
    const {className} = this.props

    return classnames('drag-and-drop', {
      [dragClass]: true,
      [className]: className,
    })
  }

  private get dragAreaClass(): string {
    const {uploadContent} = this.state

    return classnames('drag-and-drop--form', {active: !uploadContent})
  }

  private handleFileClick = (e: ChangeEvent<HTMLInputElement>): void => {
    const file: File = e.currentTarget.files[0]
    const fileSize = file.size

    this.setState({
      fileName: file.name,
      fileSize,
    })

    e.preventDefault()
    e.stopPropagation()

    this.uploadFile(file)
  }

  private handleFileDrop = (e: DragEvent): void => {
    const file: File = e.dataTransfer.files[0]

    this.setState({
      fileName: file.name,
      fileSize: file.size,
      dragClass: 'drag-none',
    })

    e.preventDefault()
    e.stopPropagation()

    this.uploadFile(file)
  }

  private uploadFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      this.setState(
        {
          uploadContent: reader.result as string,
          fileName: file.name,
        },
        () => {
          this.props.onSetBody(this.state.uploadContent)
        }
      )
    }
    reader.readAsText(file)
  }

  private handleFileOpen = (): void => {
    const {uploadContent} = this.state
    if (uploadContent === '') {
      this.fileInput.current.click()
    }
  }

  private handleDragEnter = (e: DragEvent): void => {
    dragCounter += 1
    e.preventDefault()
    this.setState({dragClass: 'drag-over'})
  }

  private handleDragLeave = (e: DragEvent): void => {
    dragCounter -= 1
    e.preventDefault()
    if (dragCounter === 0) {
      this.setState({dragClass: 'drag-none'})
    }
  }
}

export default DragAndDrop
