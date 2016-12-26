import React, {Component, PropTypes} from 'react'
import {observer} from 'mobx-react'
import mobx, {action} from 'mobx'

const clearIcon = <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="-404 282.3 32 32"><circle fill="#FFF" cx="-388" cy="298.3" r="16"/><path d="M-382.3 308.2l-15.6-15.6c-.4-.4-.4-1 0-1.4l2.8-2.8c.4-.4 1-.4 1.4 0l15.6 15.6c.4.4.4 1 0 1.4l-2.8 2.8c-.4.4-1.1.4-1.4 0z"/><path d="M-378.1 292.6l-15.6 15.6c-.4.4-1 .4-1.4 0l-2.8-2.8c-.4-.4-.4-1 0-1.4l15.6-15.6c.4-.4 1-.4 1.4 0l2.8 2.8c.4.4.4 1 0 1.4z"/></svg>

@observer
export default class SearchBar extends Component {
  constructor (props) {
    super(props)
    this.search = mobx.observable({
      filter: '',
      get clearBtnVisible () {
        return this.filter.length > 0
      }
    })
  }

  @action.bound
  onFilterChange (event) {
    const text = event.target.value
    this.props.setSearchFilter(text)
    this.search.filter = text
  }

  @action.bound
  clearSearch () {
    this.props.setSearchFilter('')
    this.search.filter = ''
  }

  render () {
    const clearCssClasses = `clear-search ${this.search.clearBtnVisible ? '' : 'hidden'}`
    return (
      <div className="search-bar">
        <input id="search" type="text" placeholder="Search"
          value={this.search.filter} onChange={this.onFilterChange}
          tabIndex="1"/>
        <div className={clearCssClasses} onClick={this.clearSearch}>
          {clearIcon}
        </div>
      </div>
    )
  }
}

SearchBar.propTypes = {
  setSearchFilter: PropTypes.func.isRequired
}
