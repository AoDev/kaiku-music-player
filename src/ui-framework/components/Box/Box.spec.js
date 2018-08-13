import React from 'react'
import {shallow} from 'enzyme'
import Box from './Box'

describe('<Box />', () => {
  const boxContent = <div>something</div>

  it('should contain the passed content', () => {
    const wrapper = shallow(<Box>{boxContent}</Box>)
    expect(wrapper.contains(boxContent)).toEqual(true)
  })

  describe.skip('the Box "hidden" prop', () => {
    it('should add the "hidden" css class when true', () => {
      const wrapper = shallow(<Box className="test" hidden>{boxContent}</Box>)
      expect(wrapper.prop('className')).toContain('test hidden')
    })

    it('should NOT add the "hidden" css class when false or undefined', () => {
      const wrapper = shallow(<Box className="test" hidden={false}>{boxContent}</Box>)
      expect(wrapper.prop('className')).not.toContain('hidden')
    })
  })

  describe.skip('the Box "visible" prop', () => {
    it('should add the "hidden" css class when false', () => {
      const wrapper = shallow(<Box className="test" visible={false}>{boxContent}</Box>)
      expect(wrapper.prop('className')).not.toContain('test hidden')
    })
  })
})
