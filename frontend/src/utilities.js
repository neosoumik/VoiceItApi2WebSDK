import ProgressBar from 'progressbar.js';
const vi$ = {
  post: function(modal, endPoint, requestType, token, props, callback) {
      var http = new XMLHttpRequest();
      var formData = new FormData();
      formData.append('viRequestType', requestType);
      formData.append('viSecureToken', token);
      for (var key in props) {
        if (props.hasOwnProperty(key)) {
            formData.append(key, props[key]);
        }
      }
      http.open("POST", endPoint, true);
      http.send(formData);
      http.onreadystatechange = function() {
        if (http.readyState === 4) {
          // console.log(`${requestType} response: ${http.responseText}`);
          const parsedJson = JSON.parse(http.responseText.trim());
          if(parsedJson.responseCode === 'INVT'){
            // TODO: Show Error Message and Dismiss Modal
            modal.showTokenErrorAndDestroy();
            return;
          }
          callback(parsedJson);
        }
      }
  },
  isWebAssemblySupported:function() {
    function testSafariWebAssemblyBug() {
      var bin   = new Uint8Array([0,97,115,109,1,0,0,0,1,6,1,96,1,127,1,127,3,2,1,0,5,3,1,0,1,7,8,1,4,116,101,115,116,0,0,10,16,1,14,0,32,0,65,1,54,2,0,32,0,40,2,0,11]);
      var mod   = new WebAssembly.Module(bin);
      var inst  = new WebAssembly.Instance(mod, {});
      // Test storing to and loading from a non-zero location via a parameter.
      // Safari on iOS 11.2.5 returns 0 unexpectedly at non-zero locations
      return (inst.exports.test(4) !== 0);
    }
    var isWebAssemblySupported = (typeof WebAssembly === 'object');
    if(isWebAssemblySupported && !testSafariWebAssemblyBug()) {
      isWebAssemblySupported = false;
    }
    return isWebAssemblySupported;
  },
  detectBrowser: function() {
    var nVer = navigator.appVersion;
    var nAgt = navigator.userAgent;
    var browserName = navigator.appName;
    var fullVersion = '' + parseFloat(navigator.appVersion);
    var majorVersion = parseInt(navigator.appVersion, 10);
    var nameOffset, verOffset, ix;
    if ((verOffset = nAgt.indexOf("Opera")) != -1) {
      browserName = "Opera";
      fullVersion = nAgt.substring(verOffset + 6);
      if ((verOffset = nAgt.indexOf("Version")) != -1)
        fullVersion = nAgt.substring(verOffset + 8);
      }
    else if ((verOffset = nAgt.indexOf("MSIE")) != -1) {
      browserName = "Microsoft Internet Explorer";
      fullVersion = nAgt.substring(verOffset + 5);
    } else if ((verOffset = nAgt.indexOf("Chrome")) != -1) {
      browserName = "Chrome";
      fullVersion = nAgt.substring(verOffset + 7);
    } else if ((verOffset = nAgt.indexOf("Safari")) != -1) {
      browserName = "Safari";
      fullVersion = nAgt.substring(verOffset + 7);
      if ((verOffset = nAgt.indexOf("Version")) != -1)
        fullVersion = nAgt.substring(verOffset + 8);
      }
    else if ((verOffset = nAgt.indexOf("Firefox")) != -1) {
      browserName = "Firefox";
      fullVersion = nAgt.substring(verOffset + 8);
    } else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
      browserName = nAgt.substring(nameOffset, verOffset);
      fullVersion = nAgt.substring(verOffset + 1);
      if (browserName.toLowerCase() == browserName.toUpperCase()) {
        browserName = navigator.appName;
      }
    }

    // trim the fullVersion string at semicolon/space if present
    if ((ix = fullVersion.indexOf(";")) != -1)
      fullVersion = fullVersion.substring(0, ix);
    if ((ix = fullVersion.indexOf(" ")) != -1)
      fullVersion = fullVersion.substring(0, ix);

    majorVersion = parseInt('' + fullVersion, 10);
    if (isNaN(majorVersion)) {
      fullVersion = '' + parseFloat(navigator.appVersion);
      majorVersion = parseInt(navigator.appVersion, 10);
    }
    return browserName;
  },
  // Helper to get the net audio volume
  getRMS: function(spectrum) {
    var rms = 0;
    spectrum.forEach(function(spec) {
      rms += spec * spec;
    });
    rms /= spectrum.length;
    rms = Math.sqrt(rms);
    if (rms > 120) {
      rms = 120;
    }
    return rms;
  },
  contains: function(arr, element){
    return arr.indexOf(element) > -1;
  },
  qs: function(selector, child){
    try {
      var chosenSelector = (selector instanceof HTMLElement || selector instanceof SVGElement) ? selector : document.querySelector(selector);
      if(child){
        return chosenSelector.querySelectorAll(child)[0];
      } else{
        return chosenSelector;
      }
    } catch(err){
      return null;
    }
  },
  create: function(elType){
    return document.createElement(elType);
  },
  exists: function(selector){
    var element = vi$.qs(selector);
    if (typeof(element) != 'undefined' && element != null)
    {
      return true;
    }
    return false;
  },
  remove: function(selector){
    if(!selector){ return; }
    var elem = vi$.qs(selector);
    if(elem){
      if(elem.parentNode){
        elem.parentNode.removeChild(elem);
      }
    }
  },
  createProgressCircle: function(progressCircle, progressDuration, value, anim, color){
    var bar = new ProgressBar.Circle(progressCircle, {
      strokeWidth: 3,
      easing: 'easeInOut',
      duration: progressDuration,
      color: color || '#FBC132',
      trailColor: 'rgba(0,0,0,0.0)',
      trailWidth: 0,
      svgStyle: null
    });

    bar.animate(1.0);
    return bar;
  },
  fadeOut: function(selector, duration, after){
    var elem = vi$.qs(selector);
    if(!elem){ console.error('Invalid Selector Passed to Fade Out'); return ; }
    elem.style.opacity = 1.0;
	  elem.style.transition = 'opacity ' + duration + 'ms';
	  elem.style.opacity = 0.0;
    setTimeout(function(){
      elem.style.transition = null;
      if(after){ after(); }
    }, duration + 200);
  },
  fadeIn: function(selector, duration, after, optionalOpacity){
    var elem = vi$.qs(selector);
    if(!elem){ console.error('Invalid Selector ', selector ,' Passed to Fade In'); return ; }
    elem.style.opacity = 0.0;
    elem.style.transition = 'opacity ' + duration + 'ms';
    elem.style.opacity = optionalOpacity || 1.0;
    setTimeout(function(){
      elem.style.transition = null;
      if(after){ after(); }
    }, duration + 200);
  },
  clickOn: function(selector, listener){
    var elem = vi$.qs(selector);
    if(!elem){ console.error('Invalid Selector Passed to Click On'); return ; }
    // TODO: Figure out how to unbind click, maybe unnecessary
    elem.addEventListener('click', listener);
  },
  delay: function(duration, done){
    setTimeout(done, duration);
  },
  readWASMBinary: function(url, onload) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "arraybuffer";
    xhr.onload = function xhr_onload() {
      if (xhr.status === 200 || xhr.status === 0 && xhr.response) {
        onload(xhr.response);
        return;
      }
    };
    xhr.send(null);
  },
  /**
  * Shuffles array in place.
  * @param {Array} arr items An array containing the items.
  */
  shuffle: (arr) => {
    var j,
      x,
      i;
    for (i = arr.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = arr[i];
      arr[i] = arr[j];
      arr[j] = x;
    }
    return arr;
  },
  dataURItoBlob: (dataURI) => {
    if(typeof dataURI !== 'string'){
        throw new Error('Invalid argument: dataURI must be a string');
    }
    dataURI = dataURI.split(',');
    var type = dataURI[0].split(':')[1].split(';')[0],
        byteString = atob(dataURI[1]),
        byteStringLength = byteString.length,
        arrayBuffer = new ArrayBuffer(byteStringLength),
        intArray = new Uint8Array(arrayBuffer);
    for (var i = 0; i < byteStringLength; i++) {
        intArray[i] = byteString.charCodeAt(i);
    }
    return new Blob([intArray], {
        type: type
    });
},
getValue: (key) => {
  return localStorage.getItem(key);
},
getToken:() => {
  return localStorage.getItem('viSecureToken');
},
setValue: (key, value) => {
  return localStorage.setItem(key, value);
}
};

export default vi$;
