var assert = chai.assert;
var LMLayer = com.keyman.text.prediction.LMLayer;

/*
 * Shows off the LMLayer API, using the full prediction interface.
 * The dummy model (or mock model) is a language model which has 
 * **injectable** suggestions: that is, you, as the tester, have
 * to provide the predictions. The dummy model does not create any
 * suggestions on its own. The dummy model can take in a series
 * of suggestions when initialized and return them sequentially.
 */
describe('LMLayer using dummy model', function () {
  describe('Prediction', function () {
    it('will predict future suggestions', function () {
      var lmLayer = new LMLayer();
      var capabilities = {
        maxLeftContextCodeUnits: 32 + ~~Math.random() * 32
      };

      // We're testing many as asynchronous messages in a row.
      // this would be cleaner using async/await syntax, but
      // alas some of our browsers don't support it.
      return lmLayer.initialize(
        capabilities,
        {
            type: 'dummy',
            futureSuggestions: iGotDistractedByHazel()
        }
      ).then(function (actualConfiguration) {
        return Promise.resolve();
      }).then(function () {
        return lmLayer.predict(zeroTransform(), emptyContext());
      }).then(function (suggestions) {
        assert.deepEqual(suggestions, iGotDistractedByHazel()[0]);
        return lmLayer.predict(zeroTransform(), emptyContext());
      }).then(function (suggestions) {
        assert.deepEqual(suggestions, iGotDistractedByHazel()[1]);
        return lmLayer.predict(zeroTransform(), emptyContext());
      }).then(function (suggestions) {
        assert.deepEqual(suggestions, iGotDistractedByHazel()[2]);
        return lmLayer.predict(zeroTransform(), emptyContext());
      }).then(function (suggestions) {
        assert.deepEqual(suggestions, iGotDistractedByHazel()[3]);
        return Promise.resolve();
      });
    });
  });

  function emptyContext() {
    return { left: '', startOfBuffer: true, endOfBuffer: true };
  }

  function zeroTransform() {
    return { insert: '', deleteLeft: 0 };
  }

  function iGotDistractedByHazel() {
    return __json__['future_suggestions/i_got_distracted_by_hazel'];
  }
});
