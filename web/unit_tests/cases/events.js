var assert = chai.assert;

describe('Event Management', function() {

  before(function(done) {
    this.timeout(20000);
    fixture.setBase('unit_tests/fixtures');
    fixture.load("eventTestConfig.html");

    setupKMW(null, function() {
      // We use this keyboard since we only need minimal input functionality for these tests.
      // Smaller is better when dealing with net latency.
      loadKeyboardFromJSON("/keyboards/test_simple_deadkeys.json", function() {
        // Interestingly, when auto-testing there's a Safari bug that prevents
        // this from being preserved after the first forced blur command below.
        keyman.globalKeyboard = "Keyboard_test_simple_deadkeys";
        done();
      }, 10000);
    }, 10000);

  });
  
  after(function() {
    teardownKMW();
  });

  it('Keystroke-based onChange event generation', function(done) {
    var simple_A = {"type":"key","key":"a","code":"KeyA","keyCode":65,"modifierSet":0,"location":0};
    var event = new KMWRecorder.PhysicalInputEvent(simple_A);

    var ele = document.getElementById("input");
    var aliasing = false;

    ele.onchange = function() {
      ele.onchange = null;
      done();
    }

    if(ele['kmw_ip']) {
      ele = ele['kmw_ip'];
      aliasing = true;
    }

    // A bit of a force-hack to ensure the element is seen as active for the tests.
    window['DOMEventHandlers'].states.lastActiveElement = ele;
    window['DOMEventHandlers'].states.activeElement = ele;

    event.simulateEventOn(ele);

    var focusEvent;

    if(typeof FocusEvent == 'function') {
      focusEvent = new FocusEvent('blur', {relatedTarget: ele});
    } else {
      focusEvent = document.createEvent("FocusEvent");
      focusEvent.initFocusEvent("blur", true, false, ele.ownerDocument.defaultView, 0, ele);
    }

    if(focusEvent)
      ele.dispatchEvent(focusEvent);
  });

  it('OSK-based onChange event generation', function(done) {
    var simple_A = {"type":"osk","keyID":"default-K_A"};
    var event = new KMWRecorder.OSKInputEvent(simple_A);

    var ele = document.getElementById("input");
    var aliasing = false;

    ele.onchange = function() {
      ele.onchange = null;
      done();
    }

    if(ele['kmw_ip']) {
      ele = ele['kmw_ip'];
      aliasing = true;
    }

    // A bit of a force-hack to ensure the element is seen as active for the tests.
    window['DOMEventHandlers'].states.lastActiveElement = ele;
    window['DOMEventHandlers'].states.activeElement = ele;

    event.simulateEventOn(ele);

    var focusEvent;

    if(typeof FocusEvent == 'function') {
      focusEvent = new FocusEvent('blur', {relatedTarget: ele});
    } else {
      focusEvent = document.createEvent("FocusEvent");
      focusEvent.initFocusEvent("blur", true, false, ele.ownerDocument.defaultView, 0, ele);
    }

    if(focusEvent)
      ele.dispatchEvent(focusEvent);
  });

  it('Keystroke-based onInput event generation', function(done) {
    // Not all browsers support InputEvent.  Bypass the test for these.
    if(typeof InputEvent != 'function') {
      console.log("InputEvent not supported.");
      done();
      return;
    }

    var simple_A = {"type":"key","key":"a","code":"KeyA","keyCode":65,"modifierSet":0,"location":0};
    var event = new KMWRecorder.PhysicalInputEvent(simple_A);

    var ele = document.getElementById("input");
    var aliasing = false;

    var counterObj = {i:0};
    var fin = 3;

    ele.addEventListener("input", function() {
      counterObj.i++;
      if(counterObj.i == fin) {
        done();
      }
    });

    if(ele['kmw_ip']) {
      ele = ele['kmw_ip'];
      aliasing = true;
    }

    event.simulateEventOn(ele);
    event.simulateEventOn(ele);
    event.simulateEventOn(ele);
  });

  it('OSK-based onInput event generation', function(done) {
    // Not all browsers support InputEvent.  Bypass the test for these.
    if(typeof InputEvent != 'function') {
      console.log("InputEvent not supported.");
      done();
      return;
    }

    var simple_A = {"type":"osk","keyID":"default-K_A"};
    var event = new KMWRecorder.OSKInputEvent(simple_A);

    var ele = document.getElementById("input");
    var aliasing = false;

    var counterObj = {i:0};
    var fin = 3;

    ele.addEventListener("input", function() {
      counterObj.i++;
      if(counterObj.i == fin) {
        done();
      }
    });

    if(ele['kmw_ip']) {
      ele = ele['kmw_ip'];
      aliasing = true;
    }

    event.simulateEventOn(ele);
    event.simulateEventOn(ele);
    event.simulateEventOn(ele);
  });
});