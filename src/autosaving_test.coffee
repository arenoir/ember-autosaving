should = chai.should()

FakeModel = Ember.Object.extend(Ember.Evented,
  save: sinon.spy()
)

describe.modelNotInFlight = (tests) ->
  describe "when the model isn't inFlight", ->
    beforeEach ->
      @controller.set 'content', @model

    tests()

describe.modelInFlight = (tests) ->
  describe "when the model is inFlight", ->
    beforeEach ->
      @model.set('isSaving', true)
      @controller.set 'content', @model

    tests()

it.behavesLikeABufferedField = (field) ->
  describe.modelNotInFlight ->
    it "writes attributes directly to the model", ->
      @controller.set(field, 'value')
      @model.get(field).should.equal 'value'

    it "reads attributes directly to the model", ->
      @model.set(field, 'value')
      @controller.get(field).should.equal 'value'

    it "waits to save the model on a bufferedField", ->
      @controller.set(field, 'value')
      @model.save.called.should.be.false
      @clock.tick(1000)
      @model.save.called.should.be.true

    it "immediately saves the model when it is swapped", ->
      @controller.set(field, 'value')
      @controller.set('content', {})
      @model.save.called.should.be.true
      @model.get(field).should.equal 'value'

  describe.modelInFlight ->
    it "writes and reads attributes with a buffer", ->
      @controller.set(field, 'value')
      should.not.exist @model.get(field)
      @controller.get(field).should.equal 'value'

    it "writes attributes to the model when saving is complete", ->
      @controller.set(field, 'value')
      @model.set('isSaving', false)
      @model.get(field).should.equal 'value'

it.behavesLikeANormalAttribute = (field) ->
  describe.modelNotInFlight ->
    it "dosen't save the model on a bufferedField", ->
      @controller.set(field, 'value')
      @clock.tick(1000)
      @model.save.called.should.be.false

  describe.modelInFlight ->
    it "writes and reads attributes directly to the model", ->
      @controller.set(field, 'value')
      @model.get(field).should.equal 'value'

it.behavesLikeAnInstaSaveField = (field) ->
  describe.modelNotInFlight ->
    it "immediately saves the model on an instaSaveField", ->
      @controller.set(field, 'value')
      @model.save.called.should.be.true


describe "A controller using the autoSaving mixin", ->
  AutoSavingController = Ember.ObjectController.extend(Ember.AutoSaving)

  beforeEach ->
    @clock = sinon.useFakeTimers()
    @model = FakeModel.create(save: sinon.spy())

  afterEach -> @clock.restore()

  describe "only specifying an instaSaveField", ->
    beforeEach ->
      @controller = AutoSavingController.create(instaSaveFields: ['instaSaveKey'])

    describe "all attributes", ->
      it.behavesLikeABufferedField('key')

    describe "instaSaveKeys", ->
      it.behavesLikeAnInstaSaveField('instaSaveKey')

  describe "specifying bufferedFields", ->
    beforeEach ->
      @controller = AutoSavingController.create(bufferedFields: ['bufferedKey'])

    describe "bufferedKey", ->
      it.behavesLikeABufferedField('bufferedKey')

    describe "normal attributes", ->
      it.behavesLikeANormalAttribute('key')

