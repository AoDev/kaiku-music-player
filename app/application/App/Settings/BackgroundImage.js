import PropTypes from 'prop-types'
import React from 'react'
const imagePlaceholder = './images/image-placeholder.svg'

export default function BackgroundImage (props) {
  const {backgroundImage} = props
  const image = backgroundImage || imagePlaceholder
  const thumbStyle = {backgroundImage: `url(${image})`}

  return (
    <div>
      <h3>Background image</h3>
      <div className="background-image space-bottom-1" style={thumbStyle}>
        <button onClick={props.selectBackgroundImage} className="pos-abs" style={{top: '85px', left: '88px'}}>
          {backgroundImage ? 'Change image' : 'Choose image'}
        </button>
      </div>
      {backgroundImage
        ? <div className="input-group space-bottom-1">
          <input type="text" placeholder="Image file path" value={decodeURI(backgroundImage)} readOnly/>
          <span className="input-add-on">
            <button onClick={props.removeBackgroundImage}>
              Remove image
            </button>
          </span>
        </div>
        : null
      }
    </div>
  )
}

BackgroundImage.propTypes = {
  backgroundImage: PropTypes.string.isRequired,
  selectBackgroundImage: PropTypes.func.isRequired,
  removeBackgroundImage: PropTypes.func.isRequired
}
