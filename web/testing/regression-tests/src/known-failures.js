/**
 * This file lists the keyboard layouts that are known to fail to run, e.g. because
 * of bugs in the compiler or the Chrome if/else ladder bug (#183). Listing 
 * keyboards in this file does not stop them being tested but it does stop the 
 * test framework from failing.
 * 
 * When the issue is resolved, add a `knownGood*Version` property to the 
 * keyboard with the first *stable* release version number. If the version 
 * being tested is >= the `knownGood*Version`, then the test suite will fail if 
 * the keyboard fails to load (where `*` is either `Compiler` or `Engine`).
 * 
 * Hint: searching for "FAILED TO LOAD" in logs finds the first reference to the
 * failure for any given keyboard.
 */

const knownFailures = {
  'fv_gwichin': { /*, knownGoodCompilerVersion: '12.0.333.0', knownGoodEngineVersion: '12.0.444'*/ reason: 'Chrome ladder bug #183' },
  'fv_han': { reason: 'Chrome ladder bug #183' }, 
  'fv_northern_tutchone': { reason: 'Chrome ladder bug #183' },
  'fv_southern_tutchone': { reason: 'Chrome ladder bug #183' }, 
  'fv_tagizi_dene': { reason: 'Chrome ladder bug #183' }, 
  'hieroglyphic': { reason: 'Chrome ladder bug #183' }, 
  'nailangs': { reason: 'kmanalyze is corrupting the .tests file' },
  'sil_ipa': { reason: 'kmanalyze is corrupting the .tests file' }
};

// Node compatibility
if(typeof module === 'object') {
  module.exports = knownFailures;
} 