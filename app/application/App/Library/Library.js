import React, {Component} from 'react'
import Artists from './Artists'
import Albums from './Albums'
import Songs from './Songs'

export default class Library extends Component {
  shouldComponentUpdate () {
    return false
  }

  render () {
    return (
      <div className="library">
        <h3>Library</h3>
        <Artists/>
        <Albums/>
        <Songs/>
      </div>
    )
  }
}
