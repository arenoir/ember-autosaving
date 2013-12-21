(function() {
  var FakeModel, should;

  should = chai.should();

  FakeModel = Ember.Object.extend(Ember.Evented, {
    save: sinon.spy()
  });

  describe.modelNotInFlight = function(tests) {
    return describe("when the model isn't inFlight", function() {
      beforeEach(function() {
        return this.controller.set('content', this.model);
      });
      return tests();
    });
  };

  describe.modelInFlight = function(tests) {
    return describe("when the model is inFlight", function() {
      beforeEach(function() {
        this.model.set('isSaving', true);
        return this.controller.set('content', this.model);
      });
      return tests();
    });
  };

  it.behavesLikeABufferedField = function(field) {
    describe.modelNotInFlight(function() {
      it("writes attributes directly to the model", function() {
        this.controller.set(field, 'value');
        return this.model.get(field).should.equal('value');
      });
      it("reads attributes directly to the model", function() {
        this.model.set(field, 'value');
        return this.controller.get(field).should.equal('value');
      });
      it("waits to save the model on a bufferedField", function() {
        this.controller.set(field, 'value');
        this.model.save.called.should.be["false"];
        this.clock.tick(1000);
        return this.model.save.called.should.be["true"];
      });
      return it("immediately saves the model when it is swapped", function() {
        this.controller.set(field, 'value');
        this.controller.set('content', {});
        this.model.save.called.should.be["true"];
        return this.model.get(field).should.equal('value');
      });
    });
    return describe.modelInFlight(function() {
      it("writes and reads attributes with a buffer", function() {
        this.controller.set(field, 'value');
        should.not.exist(this.model.get(field));
        return this.controller.get(field).should.equal('value');
      });
      return it("writes attributes to the model when saving is complete", function() {
        this.controller.set(field, 'value');
        this.model.set('isSaving', false);
        return this.model.get(field).should.equal('value');
      });
    });
  };

  it.behavesLikeANormalAttribute = function(field) {
    describe.modelNotInFlight(function() {
      return it("dosen't save the model on a bufferedField", function() {
        this.controller.set(field, 'value');
        this.clock.tick(1000);
        return this.model.save.called.should.be["false"];
      });
    });
    return describe.modelInFlight(function() {
      return it("writes and reads attributes directly to the model", function() {
        this.controller.set(field, 'value');
        return this.model.get(field).should.equal('value');
      });
    });
  };

  it.behavesLikeAnInstaSaveField = function(field) {
    return describe.modelNotInFlight(function() {
      return it("immediately saves the model on an instaSaveField", function() {
        this.controller.set(field, 'value');
        return this.model.save.called.should.be["true"];
      });
    });
  };

  describe("A controller using the autoSaving mixin", function() {
    var AutoSavingController;

    AutoSavingController = Ember.ObjectController.extend(Ember.AutoSaving);
    beforeEach(function() {
      this.clock = sinon.useFakeTimers();
      return this.model = FakeModel.create({
        save: sinon.spy()
      });
    });
    afterEach(function() {
      return this.clock.restore();
    });
    describe("only specifying an instaSaveField", function() {
      beforeEach(function() {
        return this.controller = AutoSavingController.create({
          instaSaveFields: ['instaSaveKey']
        });
      });
      describe("all attributes", function() {
        return it.behavesLikeABufferedField('key');
      });
      return describe("instaSaveKeys", function() {
        return it.behavesLikeAnInstaSaveField('instaSaveKey');
      });
    });
    return describe("specifying bufferedFields", function() {
      beforeEach(function() {
        return this.controller = AutoSavingController.create({
          bufferedFields: ['bufferedKey']
        });
      });
      describe("bufferedKey", function() {
        return it.behavesLikeABufferedField('bufferedKey');
      });
      return describe("normal attributes", function() {
        return it.behavesLikeANormalAttribute('key');
      });
    });
  });

}).call(this);
