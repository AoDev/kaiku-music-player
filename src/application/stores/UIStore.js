import _ from 'lodash'
import * as mobx from 'mobx'
import cn from 'classnames'

const {observable, computed, action} = mobx

export default class UIStore {
  @observable.ref viewportSize = {
    width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
    height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
  }

  /**
   * CSS classes that should be assigned to the body element
   */
  @computed get bodyClass () {
    return cn({
      'dimensions-locked': this.settingsVisible,
    })
  }

  @action.bound set (prop, value) {
    this[prop] = value
  }

  @action.bound updateViewportSize () {
    this.set('viewportSize', {
      width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
      height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
    })
  }

  destroy () {
    window.removeEventListener('resize', this.throttledUpdateViewportSize)
  }

  setupReactions () {
    // Track viewport dimensions
    this.throttledUpdateViewportSize = _.throttle(this.updateViewportSize, 250, {
      leading: false,
    })
    window.addEventListener('resize', this.throttledUpdateViewportSize, {
      passive: true,
    })

    // Auto Update BodyClass
    this.autoUpdateBodyClass = mobx.autorun(
      () => {
        const bodyElement = window.document.querySelector('body')
        bodyElement.setAttribute('class', this.bodyClass)
      },
      {name: 'autoUpdateBodyClass'}
    )
  }

  constructor (appStore, rootStore) {
    this.appStore = appStore
    this.rootStore = rootStore
    this.setupReactions()
  }
}
