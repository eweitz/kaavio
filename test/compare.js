var module = {};
var srcDirectoryUri;
var pvjsSources;
var pathvisioNS = [];

var developmentLoader = function() {


  var oSerializer = new XMLSerializer();

  /* *******************
  /* Get the desired GPML file URL or WikiPathways ID from the URL parameters.
  /* *******************/

  // If you want to the GPML file URL or WikiPathways ID you want to display, you can
  // hard code it as the data parameter in the pathvisiojs.load() function below

  function getUriParam(name) {

    // Thanks to http://stackoverflow.com/questions/11582512/how-to-get-uri-parameters-with-javascript
    // This will be replaced once we get the backend php to get the GPML

    var parameter = decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
    if (!!parameter) {
      return parameter;
    }
    else {
      return null;
    }
  }

  function getUriParamList() {
    uriParamList = {
      'svg-disabled': false,
      'gpml': null,
      'gpmlRev': 0,
      'creator': 'pathvisiojs-dev',
      'account': '',
      'branch': ''
    };
    Object.keys(uriParamList).forEach(function(element) {
      if (!!getUriParam(element)) {
        uriParamList[element] = getUriParam(element);
      }
      window.setTimeout(function() {
        $('#' + element).val(uriParamList[element]);
      }, 50)
    });
    return uriParamList;
  }

  function updateParams(updatedParam) {
    var targetUri = currentUri + '?' + updatedParam.key + '=' + updatedParam.value;

    Object.keys(uriParamList).forEach(function(element) {
      if (element === updatedParam.key) {
        uriParamList[element] = updatedParam.value;
      }
      else {
        targetUri += '&' + element + '=' + uriParamList[element];
      }
    });

    location.href = targetUri;
  }

  function parseUriParams(callback) {
    // uriParams can be a WikiPathways ID (WP1), a uri for a GPML file (http://www.wikipathways.org/gpmlfile.gpml)
    // or a uri for another type of file.
    var uriParams = getUriParamList();
    console.log(uriParams);
    if (!uriParams) {
      throw new Error('No URI params to parse.');
    }

    // object we will return
    var parsedInputData = {};
    parsedInputData.sourceData = [];

    var svgDisabled = parsedInputData.svgDisabled = uriParams['svg-disabled'] || false;
    var gpmlParam = uriParams.gpml; // this might be equal to the value of uriParams.gpml, but it might not.

    var wpId, wpRevision, gpmlUri, pngUri;

    if (pathvisiojs.utilities.isUri(gpmlParam)) {
      if (uri.indexOf('.gpml') > -1) {
        parsedInputData.sourceData.push({
          uri:gpmlParam,
          fileType:'gpml'
        });

        pngUri = pathvisiojs.config.diagramNotAvailableImageUri();
        parsedInputData.sourceData.push({
          uri:pngUri,
          fileType:'png'
        });

        callback(parsedInputData);
      }
      else {
        throw new Error('Pathvisiojs cannot handle the data source type entered.');
      }
    }
    else {
      if (pathvisiojs.utilities.isWikiPathwaysId(gpmlParam)) {
        wpRevision = uriParams.rev || 0;
        // TODO this is messy if we later want to use a data format that is not GPML
        gpmlUri = getGpmlUri(gpmlParam, wpRevision); //get uri
        parsedInputData.sourceData.push({
          uri:gpmlUri,
          fileType:'gpml'
        });

        pngUri = encodeURI(pathvisiojs.config.imgDiagramUriStub() + gpmlParam + '&revision=' + wpRevision);
        parsedInputData.sourceData.push({
          uri:pngUri,
          fileType:'png'
        });

        parsedInputData.wpId = gpmlParam;
        parsedInputData.revision = wpRevision;
        callback(parsedInputData);
      }
      else {
        throw new Error('Pathvisiojs cannot handle the data source type entered.');
      }
    }
  }

  // TODO getGpmlUri() and getJson() should move under pathvisiojs.data...
  // if the input is a WP ID, we can get the uri for GPML.
  function getGpmlUri(wpId, revision) {
    var gpmlUri;

    // test whether the server serving this file is on a wikipathways.org domain (wikipathways.org, test3.wikipathways.org, etc.)
    var re = /wikipathways\.org/; 
    var isOnWikiPathwaysDomain = re.test(document.location.origin);

    // I don't know what this is doing. It might be a start at handling display of multiple pathways on a page.
    var PathwayViewer_viewers = PathwayViewer_viewers || [];

    if (pathvisiojs.utilities.isWikiPathwaysId(wpId)) { // if the input is a WP ID
      if (PathwayViewer_viewers.length > 0 && isOnWikiPathwaysDomain) { // if we are also on a *.wikipathways.org domain
        gpmlUri = PathwayViewer_viewers[0].gpml.gpmlUri; // TODO we are not handling multiple pathways on one page here
      }
      else {
        gpmlUri = pathvisiojs.config.gpmlSourceUriStub() + wpId + '&rev=' + revision;
      }
    }
    else {
      throw new Error('Pathvisiojs cannot handle the data source type entered.');
    }

    // be sure server has set gpml mime type to application/xml or application/gpml+xml

    return gpmlUri;
  }


  function getUriParam(name) {

    // Thanks to http://stackoverflow.com/questions/11582512/how-to-get-uri-parameters-with-javascript
    // This will be replaced once we get the backend php to get the json

    var parameter = decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
    if (!!parameter) {
      return parameter;
    }
    else {
      return null;
    }
  }

  function loadScripts(array, callback){  
    var loader = function(src,handler){  
      var script = document.createElement('script');  
      script.src = src;  
      script.onload = script.onreadystatechange = function(){  
        script.onreadystatechange = script.onload = null;  
        if(/MSIE ([6-9]+\.\d+);/.test(navigator.userAgent))window.setTimeout(function(){handler();},8,this);  
        else handler();  
      }  
      var head = document.getElementsByTagName('head')[0];  
      (head || document.body).appendChild( script );  
    };  
    (function(){  
      if(array.length!=0){  
        loader(array.shift(),arguments.callee);  
      }else{  
        callback && callback();  
      }  
    })();  
  }

  function updateParams(updatedParam) {
    var targetUri = currentUri + '?' + updatedParam.key + '=' + updatedParam.value;

    Object.keys(uriParamList).forEach(function(element) {
      if (element === updatedParam.key) {
        uriParamList[element] = updatedParam.value;
      }
      else {
        targetUri += '&' + element + '=' + uriParamList[element];
      }
    });

    location.href = targetUri;
  }

  function generateSvgTemplate(callback) {
    var docFragment = document.createDocumentFragment();
    var svg = d3.select(docFragment).append('svg').
    attr('id', 'pathvisiojs-diagram').
    attr('version', '1.1').
    attr('baseProfile', 'full').
    attr('xmlns', 'http://www.w3.org/2000/svg').
    attr('xmlns:xmlns:xlink', 'http://www.w3.org/1999/xlink').
    attr('xmlns:xmlns:ev', 'http://www.w3.org/2001/xml-events').
    attr('width', '100%').
    attr('height', '100%').
    attr('style', 'display: none; ');

    var g = svg.append('g')

    var title = svg.append('title').
    text('pathvisiojs diagram');

    var desc = g.append('desc').
    text('This SVG file contains all the graphical elements (markers and symbols in defs as well as\nstyle data) used by the program pathvisiojs, which has two components:\n1) a viewer for transforming GPML biological pathway data into an SVG visual representation and\n2) an editor for creating both views and models for biological pathways.');

    var defs = svg.append('defs');

    var filter = svg.append('filter').
    attr('id', 'highlight').
    attr('width', '150%').
    attr('height', '150%');

    filter.append('feOffset').
    attr('result', 'offOut').
    attr('in', 'SourceGraphic').
    attr('dx', '30').
    attr('dy', '30');

    filter.append('feGaussianBlur').
    attr('result', 'blurOut').
    attr('in', 'offOut').
    attr('stdDeviation', '10');

    filter.append('feBlend').
    attr('in', 'SourceGraphic').
    attr('in2', 'blurOut').
    attr('mode', 'normal');

    var viewport = svg.append('g').
    attr('id', 'viewport');

    var oSerializer = new XMLSerializer();
    pathvisioNS['tmp/pathvisiojs.svg'] = oSerializer.serializeToString(svg[0][0]);
    callback();
  }

  function generateHtmlTemplate(callback) {
    d3.html(srcDirectoryUri + 'pathvisiojs.html', function(html) {
      pathvisioNS['tmp/pathvisiojs.html'] = oSerializer.serializeToString(html);
      callback();
    });
  }

  function preload(outsideCallback) {
    var hostname = decodeURI(window.location.hostname);

    var currentUri = document.location;
    var pathname = document.location.pathname;
    var pathvisiojsRootDirectoryUri = pathname.split('test/compare.html')[0];
    srcDirectoryUri = (pathvisiojsRootDirectoryUri + 'src/');

    async.waterfall([
      function(callback) {
        var gruntFileUri = '../Gruntfile.js'; // just for testing/development purposes
        loadScripts([gruntFileUri], function() {
          callback(null);
        });
      },
      function(callback) {
        if (pathname.indexOf('compare.html') > -1) { //if this is the development version
          var pvjsSourcesDev = pvjsSources.slice(1); //this file is only used in the build process

          // In dev mode, different servers will use different configs.
          // The code below sets this config file.
          // For production, we will use default.js for our default config settings and
          // optionally build other versions as needed if we need a built version that
          // doesn't use the config settings in default.js.
          var serverSpecificJsConfigFileName;
          var regDomainPattern = /^(?!:\/\/)([a-zA-Z0-9]+\.)?[a-zA-Z0-9][a-zA-Z0-9-]+\.[a-zA-Z]{2,6}?$/i
          var regexResult = regDomainPattern.exec(hostname);
          if (!!regexResult) {
            // www is the same as a bare domain for our purposes, e.g., www.example.org === example.org
            if (!!regexResult[1]) {
              serverSpecificJsConfigFileName = regexResult[0];
            }
            else {
              serverSpecificJsConfigFileName = 'www.' + regexResult[0];
            }
          }
          else { //if it's an IP address, just use localhost
            serverSpecificJsConfigFileName = 'localhost';
          }

          serverSpecificJsConfigFileName = strcase.paramCase(serverSpecificJsConfigFileName);
          pvjsSourcesDev[1] = 'config/' + serverSpecificJsConfigFileName + '.js';

          pvjsSourcesDev = pvjsSourcesDev.map(function(source) {
            return '../' + source;
          });

          loadScripts(pvjsSourcesDev, function() {
            callback(null);
          });
        }
        else { //if this is the production version
          callback(null);
        }
      },
      function(callback) {
        parseUriParams(function(parsedInputData) {
          callback(null, parsedInputData);
        });
      },
      function(parsedInputData, callback) {
        if (pathname.indexOf('compare.html') > -1) { //if this is the development version
          generateHtmlTemplate(function() {
            generateSvgTemplate(function() {
              console.log(pathvisioNS);
              callback(null, parsedInputData);
            });
          });
        }
        else { //if this is the production version
          callback(null, parsedInputData);
        }
      },
      function(parsedInputData, callback) {
        console.log(parsedInputData);
        // test for whether uriParamList.gpml is a WikiPathways ID
        // If it is not a WikiPathways ID, the WikiPathways widget will not be able to load the pathway.
        if (!!parsedInputData.wpId) {
          window.setTimeout(function() {
            $('#current-wikipathways-viewer').prepend('<iframe id="current-wiki-pathways-widget" src="http://www.wikipathways.org/wpi/PathwayWidget.php?id=' + parsedInputData.wpId + '" width="500px" height="500px" />')
            }, 50);
        }
        else {
          console.warn('GPML data source specified is not a WP ID. WP widget cannot display this GPML data as a pathway image.');
        }


        if (parsedInputData.svgDisabled) {
          Modernizr.svg = Modernizr.inlinesvg = false;
          $('#svg-disabled').prop('checked', true);
        }

        outsideCallback(parsedInputData);
      }
    ]);
  }

  return{
    preload:preload,
    parseUriParams:parseUriParams
  };
}();

/* *******************
/* Until we finish automating the Grunt build process, we are manually getting the html template with this function.
/* *******************/

var getPathvisiojsHtmlTemplate = function() {
  var svg = d3.select('#pathvisiojs-diagram');
  svg.select('#viewport').selectAll('*').remove();
  var marker, oldMarkerId, newMarkerId;
  var markers = svg.selectAll('marker');
  markers.each(function() {
    marker = d3.select(this);
    oldMarkerId = marker.attr('id');
    newMarkerId = 'shape-library' + oldMarkerId.split('-shape-library')[1];
    marker.attr('id', newMarkerId);
  });

  var symbol, oldSymbolId, newSymbolId;
  var symbols = svg.selectAll('symbol');
  symbols.each(function() {
    symbol = d3.select(this);
    oldSymbolId = symbol.attr('id');
    newSymbolId = 'shape-library' + oldSymbolId.split('-shape-library')[1];
    symbol.attr('id', newSymbolId);
  });
  return d3.select('#pathvisiojs-container')[0][0];
}
