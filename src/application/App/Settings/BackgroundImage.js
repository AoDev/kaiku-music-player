import PropTypes from 'prop-types'
import React from 'react'
import {bgPlaceholder} from 'app-images'

const btnStyles = {top: '85px', left: '88px'}

export default function BackgroundImage (props) {
  const {backgroundImage} = props
  const image = backgroundImage || bgPlaceholder
  const thumbStyle = {backgroundImage: `url(file://${image})`}

  return (
    <div>
      <h3>Background image</h3>
      <div className="background-image space-bottom-1" style={thumbStyle}>
        <button onClick={props.selectBackgroundImage} className="pos-abs" style={btnStyles}>
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
