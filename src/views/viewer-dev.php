<!DOCTYPE html>
<head>
<meta charset="utf-8">
<title>pathvisio.js renderer</title>

<!-- 
Style guides can be arbitrary, but for sake of consistency within this project, let's use these:
http://google-styleguide.googlecode.com/svn/trunk/htmlcssguide.xml
http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
http://google-styleguide.googlecode.com/svn/trunk/jsoncstyleguide.xml#General_Guidelines
-->

<link href="http://netdna.bootstrapcdn.com/font-awesome/3.0.2/css/font-awesome.css" rel="stylesheet" media="screen">
<link rel="stylesheet" href="../css/details-frame.css">
<link rel="stylesheet" href="http://bumbu.github.io/cytoscape.js/src/plugins/jquery.cytoscape-panzoom.css">
<link rel="stylesheet" href="http://netdna.bootstrapcdn.com/font-awesome/3.2.1/css/font-awesome.min.css">

<style type="text/css">
body {
  background-color: white;
}
.navigator .highlight{
    opacity:    0.4;
    filter:     alpha(opacity=40);
    border:     2px solid #900;
    outline:    none;
    background-color: #900;
}
.highlight{
    opacity:    0.1;
    filter:     alpha(opacity=40);
    background-color: white;
}
.highlight:hover, .highlight:focus{
    filter:     alpha(opacity=70);
    opacity:    0.7;
    border:     2px solid gold;
    outline:    10px auto gold;
    background-color: transparent;
}
</style>

<!--[if lt IE 9]>
<script src="http://ie7-js.googlecode.com/svn/version/2.1(beta4)/IE9.js"></script>
<script src="//html5shim.googlecode.com/svn/trunk/html5.js"></script>
<script src="../lib/es5-shim/es5-shim.js"></script>
<script src="../lib/Xccessors/xccessors-standard.js"></script>

<script>

// IE8 only allows console.log when Developer Tools is open. This will prevent errors
// from showing up if I use console.log without DevTools being open.
// from http://stackoverflow.com/questions/3326650/console-is-undefined-error-for-internet-explorer

/**
 * Protect window.console method calls, e.g. console is not defined on IE
 * unless dev tools are open, and IE doesn't define console.debug
 */
(function() {
  if (!window.console) {
    window.console = {};
      }
      // union of Chrome, FF, IE, and Safari console methods
      var m = [
        "log", "info", "warn", "error", "debug", "trace", "dir", "group",
        "groupCollapsed", "groupEnd", "time", "timeEnd", "profile", "profileEnd",
        "dirxml", "assert", "count", "markTimeline", "timeStamp", "clear"
        ];
      // define undefined methods as noops to prevent errors
      for (var i = 0; i < m.length; i++) {
        if (!window.console[m[i]]) {
          window.console[m[i]] = function() {};
        }    
      } 
    })();
  </script>
<![endif]-->

<script src="../lib/rgb-color/rgb-color.js"></script>
<script src="../lib/case-converter/case-converter.js"></script>
<script src="../lib/xml2json/xml2json.js"></script>
<script src="../js/pathvisio/pathvisio.js"></script>
<script src="../js/pathvisio/helpers.js"></script>
<script src="../js/pathvisio/pathway/pathway.js"></script>
<script src="../js/pathvisio/pathway/group.js"></script>
<script src="../js/pathvisio/pathway/info-box.js"></script>
<script src="../js/pathvisio/pathway/node.js"></script>
<script src="../js/pathvisio/pathway/edge/edge.js"></script>
<script src="../js/pathvisio/pathway/edge/marker.js"></script>
<script src="../js/pathvisio/pathway/edge/point.js"></script>
<script src="../js/pathvisio/pathway/edge/path-data.js"></script>
<script src="../js/pathvisio/pathway/data-sources.js"></script>
<script src="../js/pathvisio/pathway/x-ref.js"></script>
<script src="../lib/d3/d3.js" charset="utf-8"></script>
<script>
var currentUrlWithoutQueryString = window.location.href.split("?")[0].split("#")[0];

if (!pathvisio.helpers.getUrlParam('svgView')) {
  var svgView = 1;
}
else {
  var svgView = pathvisio.helpers.getUrlParam('svgView');
};

var svgUrl = null;
var repo = 'wikipathways';
console.log(pathvisio.helpers.getUrlParam('svg'));
if (!!pathvisio.helpers.getUrlParam('repo')) {
  repo = pathvisio.helpers.getUrlParam('repo');
  var branch = 'master';
  if (!!pathvisio.helpers.getUrlParam('repo')) {
    branch = pathvisio.helpers.getUrlParam('branch');
  }
  svgUrl = '../../remote-data-sources/php/github.php?data=svg&repo=' + repo + '&branch=' + branch;
}
else {
  if (!!pathvisio.helpers.getUrlParam('svg')) {
    var svgSource = pathvisio.helpers.getUrlParam('svg');
    console.log('SVG Source');
    console.log(svgSource);
    svgUrl = svgSource;
  }
  else {
    svgUrl = "./pathway-template.svg";
    console.log('Error: No URL or repo specified as SVG template source.');
    console.log('Using local pathway-template.svg as last resort.');
  }
}

if (!!pathvisio.helpers.getUrlParam('gpml')) {
  var rev = 0;
  if (!!pathvisio.helpers.getUrlParam('rev')) {
    rev = pathvisio.helpers.getUrlParam('rev');
  }

  var gpmlSource = pathvisio.helpers.getUrlParam('gpml');
  ///*
  // gpmlSource is a WikiPathways ID
  if (gpmlSource.indexOf('.gpml') === -1 && gpmlSource.indexOf('.xml') === -1) { // if gpmlSource is a WikiPathways ID
    var gpmlUrl = currentUrlWithoutQueryString + '/../../../remote-data-sources/php/wikipathways.php?data=gpml&id=' + gpmlSource + '&rev=' + rev;
  }
  
  else { // if gpmlSource is a url to a gpml file
    var gpmlUrl = gpmlSource;
  };
  //*/

  /*
  if (pathvisio.helpers.isUrl(gpmlSource)) {
    var gpmlUrl = gpmlSource;
  }
  else {
    var gpmlUrl = currentUrlWithoutQueryString + '/../../../remote-data-sources/php/wikipathways.php?data=gpml&id=' + gpmlSource;
  };
  //*/
}
else {
  console.warn('Error: No GPML data source specified.');
};

var pngUrl = encodeURIComponent('http://test3.wikipathways.org//wpi/wpi.php?action=downloadFile&type=png&pwTitle=Pathway:' + gpmlSource);

d3.select('#fallback-image').attr('src', pngUrl);
</script>

</head>
<body>
<div style="position:relative; width:70%; height:auto; float:left;">
  <div style="width:100%; height:100%; float:right; clear:both;" id="pathway-viewer">
    <div style="width:80%; height:500px" id="pathway-container">
    </div>
    <div id="viewertoolbar" style="position:absolute; right: 0px; top: 20px;">
      <div class="ui-widget ui-corner-all" style="position: absolute; right: 5px; top: 5px; z-index: 1001; background-color: rgb(221, 221, 221); border: 1px solid rgb(170, 170, 170); width:130px">
        <span class="icon icon-eye-open"></span>
        <input id="highlight-by-label" placeholder="Find in pathway" class="ui-autocomplete-input ui-corner-all" autocomplete="off" role="textbox" aria-autocomplete="list" aria-haspopup="true" style="float:right; width: 100px;">
        <div class="ui-corner-all" style="position: absolute; font-size: 75%; background-color: white; display: none;">
        </div>
      </div>
      <!-- see http://bumbu.github.io/cytoscape.js/debug/ for example of cytoscape.js -->
      <div class="ui-cytoscape-panzoom">
          <div class="ui-cytoscape-panzoom-zoom-in ui-cytoscape-panzoom-zoom-button">
            <span class="icon icon-plus"></span>
          </div>
          <div class="ui-cytoscape-panzoom-zoom-out ui-cytoscape-panzoom-zoom-button">
            <span class="icon icon-minus"></span>
          </div>
          <div class="ui-cytoscape-panzoom-reset ui-cytoscape-panzoom-zoom-button">
            <span class="icon icon-resize-full"></span>
          </div>
          <div class="ui-cytoscape-panzoom-slider">
              <div class="ui-cytoscape-panzoom-slider-background">
              </div>
              <div class="ui-cytoscape-panzoom-slider-handle" style="top: 42.80000001192093px;">
                <span class="icon icon-minus"></span>
              </div>
              <div class="ui-cytoscape-panzoom-no-zoom-tick" style="top: 42.80000001192093px;">
              </div>
          </div>
          <div class="ui-cytoscape-panzoom-panner">
              <div class="ui-cytoscape-panzoom-panner-handle">
              </div>
              <div class="ui-cytoscape-panzoom-pan-up ui-cytoscape-panzoom-pan-button">
              </div>
              <div class="ui-cytoscape-panzoom-pan-down ui-cytoscape-panzoom-pan-button">
              </div>
              <div class="ui-cytoscape-panzoom-pan-left ui-cytoscape-panzoom-pan-button">
              </div>
              <div class="ui-cytoscape-panzoom-pan-right ui-cytoscape-panzoom-pan-button">
              </div>
              <div class="ui-cytoscape-panzoom-pan-indicator" style="display: none; left: 22.424611085682006px; top: 0.12287108520014556px; background-color: rgb(127, 127, 127); background-position: initial initial; background-repeat: initial initial;">
              </div>
          </div>
      </div>
    </div>
    <div id="details-frame" style="visibility: hidden; position:absolute; right: 75px; top: 100px;" class="data-node ui-draggable">
    </div>
  </div>
</div>

<script src="../lib/jquery/jquery.js"></script>
<script src="../lib/jquery-ui/ui/jquery-ui.js"></script>
<script src="../lib/typeahead.js/dist/typeahead.js"></script>

<script src="../lib/case-converter/case-converter.js"></script>
<script src="../lib/xml2json/xml2json.js"></script>
<script src="../lib/bootstrap/dist/js/bootstrap.js"></script>
<script src="../lib/openseadragon/openseadragon.js"></script>
<script src="../lib/modernizr/modernizr.js"></script>
<script src="../lib/screenfull/dist/screenfull.js"></script>
<script src="../lib/mr-data-converter/CSVParser.js"></script>
<script src="../lib/mr-data-converter/DataGridRenderer.js"></script>
<script src="../lib/svg-pan/svg-pan1.js"></script>
<!--
<script src="../lib/async/lib/async.js"></script>
-->


<script>
function getPng(pathway, attemptCount) {
  if (!attemptCount) {
    attemptCount = 1;
  }
  else {
    attemptCount += 1;
  }
  
  $.ajax({
    url: 'http://api.zoom.it/v1/content/?url=' + pngUrl,
      dataType: "jsonp",
      success: function(resp) { onZoomitResponse(resp, pathway, attemptCount); }
  });
};

if (Modernizr.svg && svgView != 0) {

  // browser supports SVG.

  console.log('Your browser supports SVG.');

  d3.select('#pathway-object')
  //.attr('style', 'width: 100%; height:500px')
  //.attr('src', svgUrl);

  pathvisio.pathway.load('#pathway-container', svgUrl, gpmlUrl, '#highlight-by-label');

  $( ".icon-resize-full" )[0].click(function() {
    if (screenfull.enabled) {
      screenfull.request(pathwayContainer[0][0]);
    }
  });
}
else {

  // browser does not support SVG. Fall back to PNG.

  console.log('Your browser does not support SVG. Falling back to PNG.');

  var windowDimensions = pathvisio.helpers.getWindowDimensions();
  var pathwayContainer = d3.select('#pathway-container');
  //pathwayContainer.select('#pathway-image').remove();
  //pathwayContainer.attr('style', function() {return 'width: 100%; height:' + windowDimensions.height + 'px'});
  pathwayContainer.attr('style', 'width: 100%; height:1000px');
  var svgToolbar = d3.select('#viewertoolbar')[0][0].style.visibility="hidden";
  var loadingImg = $("#pathway-container").append("<img id='loadingImg' src='../img/loading.gif' width='100' height='100' />");

  function onZoomitResponse(resp, pathway, attemptCount) {
    self.resp = resp;
    if (resp.error) {
      // e.g. the URL is malformed or the service is down
      alert(resp.error);
      return;
    };

    if (resp.content.progress < 1) {
      return window.setTimeout(function() {
        if (attemptCount < 5) {
          console.log('Pathway image is ' + (100*resp.content.progress) + '% complete. Status check #' + (attemptCount + 1) + ' in ' + 3*(attemptCount + 0) + ' seconds.');
          getPng(pathway, attemptCount);
        }
        else {
          console.warn('Error: Pathway image server appears to be unavailable.');
        }
      }, 3000 * attemptCount);
    }

    var content = resp.content;

    var overlays = self.overlays = [];
    var overlayItem = null;

    pathway.nodes.forEach(function(element) {
      var scalingFactor =  content.dzi.width / pathway.boardWidth;
      overlayItem = {
        'id':element.graphId,
          'px':element.x * scalingFactor,
          'py':element.y * scalingFactor,
          'width':element.width * scalingFactor,
          'height':element.height * scalingFactor,
          'className': 'highlight',
      };
      if (element.elementType === 'data-node') {
        overlays.push(overlayItem);
      };
    });

    loadingImg.empty();

    if (content.ready) {
      var viewer = self.viewer = OpenSeadragon({
        //debugMode: true,
        id: "pathway-container",
          prefixUrl: "../lib/openseadragon/images/",
          showNavigator:true,
          //minPixelRatio: 1.5,
          minZoomImageRatio: 0.8,
          maxZoomPixelRatio: 2,
          showNavigator:  false,
          //toolbar: 'viewertoolbar',
          tileSources:   [{ 
            Image:  {
              xmlns: "http://schemas.microsoft.com/deepzoom/2009",
                Url: 'http://cache.zoom.it/content/' + content.id + '_files/',
                TileSize: "254", 
                Overlap: "1", 
                Format: "png", 
                ServerFormat: "Default",
                Size: { 
                  Width: content.dzi.width,
                    Height: content.dzi.height
                }
            },
              overlays:overlays 
          }],
          visibilityRatio: 1.0,
          constrainDuringPan: true
      });

      window.setTimeout(function() {
        $(".highlight").click(function() {
          var id = this.getAttribute('id');
          var node = pathway.nodes.filter(function(element) {return element.graphId == id })[0];
          pathvisio.pathway.xRef.displayData(pathway.organism, node);
        });
      }, 1000);
    }
    else {
      if (content.failed) {
        alert(content.url + " failed to convert.");
      }
      else {
        alert(content.url + " is " +
          Math.round(100 * content.progress) + "% done.");
      };
    };
  };

  pathvisio.pathway.getJson(gpmlUrl, function(pathway) {
    getPng(pathway);
  });
};
</script>
</body>
