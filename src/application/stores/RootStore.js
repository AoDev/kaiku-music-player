// import * as mobx from 'mobx'
import AppStore from './AppStore'
import UIStore from './UIStore'

// const {action} = mobx

export default class RootStore {
  init () {
  }

  /**
   * @param {Object} options
   * @param {Object} options.routes - routes hooks for the router
   */
  constructor (options = {}) {
    this.appStore = new AppStore(this)
    this.uiStore = new UIStore(this.appStore, this)
    this.init()
  }
}
