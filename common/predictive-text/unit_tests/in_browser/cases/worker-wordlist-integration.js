var assert = chai.assert;
var LMLayer = com.keyman.text.prediction.LMLayer;

/*
 * How to run the worlist
 */
describe('LMLayer using the word list model', function () {
  describe('Prediction', function () {
    var EXPECTED_SUGGESTIONS = 3;
    it('will predict an empty buffer', function () {
      var lmLayer = new LMLayer();
      // var capabilities = {
      //   maxLeftContextCodeUnits: 32 + ~~Math.random() * 32
      // };

      // We're testing many as asynchronous messages in a row.
      // this would be cleaner using async/await syntax, but
      // alas some of our browsers don't support it.
      return lmLayer.initialize(
        // We need to provide an absolute path since the worker is based within a blob.
        document.location.protocol + '//' + document.location.host + "/resources/models/simple-wordlist.js"
      ).then(function (_actualConfiguration) {
        return Promise.resolve();
      }).then(function () {
        return lmLayer.predict(zeroTransform(), atEndOfBuffer(''));
      }).then(function (suggestions) {
        // TODO: not super sure what to assert here!
        assert.isAtLeast(suggestions.length, EXPECTED_SUGGESTIONS);
        return lmLayer.predict(type('t'), atEndOfBuffer(''));
      }).then(function (suggestions) {
        assert.isAtLeast(suggestions.length, EXPECTED_SUGGESTIONS);
        return lmLayer.predict(type('h'), atEndOfBuffer('t'));
      }).then(function (suggestions) {
        assert.isAtLeast(suggestions.length, EXPECTED_SUGGESTIONS);
        return lmLayer.predict(type('q'), atEndOfBuffer('the '));
      }).then(function (suggestions) {
        assert.isAtLeast(suggestions.length, EXPECTED_SUGGESTIONS);
        lmLayer.shutdown();
        return Promise.resolve();
      });
    });
  });

  /**
   * Type some text (as a transform).
   * @param  {string} text to type
   * @return {Transform}
   */
  function type(text)  {
    return { insert: text, deleteLeft: 0 };
  }

  /**
   * Create a context at the end of the buffer with the given text.
   * @param {string} buffer 
   * @return {Context}
   */
  function atEndOfBuffer(buffer) {
    return { left: buffer, startOfBuffer: buffer.length === 0, endOfBuffer: true }
  }

  function zeroTransform() {
    return { insert: '', deleteLeft: 0 };
  }
});
