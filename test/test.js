import services from '../src/services/services'
import { expect } from 'chai'

describe('services', function() {
  const data = {}

  describe('functionDemo', function() {
    it('functionDemo', function() {
      expect(services.functionDemo()).to.eql()
    })
  })
})
