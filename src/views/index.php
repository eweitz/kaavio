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

<script src="../js/gpml2json/gpml2json.js"></script>
<script src="../js/gpml2json/jxon.js"></script>

<script src="../js/rgbcolor.js"></script>

<script src="../js/draw-pathway/draw-pathway.js"></script>
<script src="../js/draw-pathway/clone.js"></script>
<script src="../js/draw-pathway/get-url-parameter.js"></script>
<script src="../js/draw-pathway/get-marker.js"></script>
<script src="../js/draw-pathway/edge-terminus.js"></script>
<script src="../js/draw-pathway/get-path-data.js"></script>
<script src="../js/draw-pathway/get-element-coordinates.js"></script>
<script src="../js/draw-pathway/draw-edges.js"></script>
<script src="../js/draw-pathway/draw-info-box.js"></script>
<script src="../js/draw-pathway/draw-groups.js"></script>
<script src="../js/draw-pathway/draw-labelable-elements.js"></script>


<script src="../lib/jquery/jquery.js"></script>
<script src="../lib/d3/d3.js" charset="utf-8"></script>
</head>
<body>
<!--
<script>
function getUrlParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
};
var repo = getUrlParameter('repo');
</script>
-->

<div id="choose-pathway-creator">
  <button id="javascript-svg-pathway-button" class="pathway" onclick="usePathwayImgCreator('javascript-svg')" style="background-color: yellow">pathvisio.js SVG</button>
  <button id="java-svg-pathway-button" class="pathway" onclick="usePathwayImgCreator('java-svg')" style="background-color: lightgray" title="Batik is currently used by PathVisio (Java) to create visual representations of GPML files in SVG and PDF">PathVisio (Java) SVG</button>
  <button id="java-png-pathway-button" class="pathway" onclick="usePathwayImgCreator('java-png')" style="background-color: lightgray" title="Batik is currently used by PathVisio (Java) to create visual representations of GPML files in SVG and PDF">PathVisio (Java) PNG</button>
</div> 
<p>To see the results of editing the pathway template SVG file (pathway-template.svg), first let Anders or Alex know you want to be added. Then you can edit the file on your github fork of pathvisio.js, commit, and enter URL parameter 'repo' above as "repo=YourGithubId" and load or refresh.</p>

<!--
<div>
Repo from which to pull pathway template svg: <INPUT id="repo" type="text" SIZE="30" MAXLENGTH="30" VALUE="wikipathways">
<button class="link" onclick="insertParam('repo', repo)">Reload pathway template svg</button> 
</div>
-->

<!--<div id="javascript-svg-pathway-container" class="pathway" onload="usePathwayImgCreator('javascript-svg')">-->

<div id="javascript-svg-pathway-container" class="pathway">
  <?php
    //$pathwayDefsSvgUrl = "https://raw.github.com/wikipathways/pathvisio.js/dev/src/views/pathway-template.svg";
    //$pathwayDefsSvg = file_get_contents($pathwayDefsSvgUrl);
    //$imageData = base64_encode($pathwayDefsSvg);
    //echo "<object id='pathway-container' type='image/svg+xml' data='" . $imageData . "' width='100%' height='100%' onload='drawPathway()'>";

    $repo = "wikipathways";
    if (isset($_GET['repo'])) {
      if (($_GET['repo'] == 'AlexanderPico') || ($_GET['repo'] == 'ariutta') || ($_GET['repo'] == 'khanspers')) {
        $repo = $_GET['repo'];
      }
    }

    //Is the code below ok wrt to security?
    //
    //if (isset($_GET['repo'])) {
    //  $repo = $_GET['repo'];
    //}

    $pathwayDefsSvgUrl = "https://raw.github.com/" . $repo . "/pathvisio.js/dev/src/views/pathway-template.svg";
    $pathwayDefsSvg = simplexml_load_file($pathwayDefsSvgUrl);
    echo $pathwayDefsSvg->saveXML();

  ?>
</div>

<?php
  if (isset($_GET['pwId'])) {
    echo "<script>var local = false</script>";
    $pwId = $_GET['pwId'];

    $svgUrl = "http://www.wikipathways.org//wpi/wpi.php?action=downloadFile&type=svg&pwTitle=Pathway:" . $pwId . "&revision=0";
    $pngUrl = "http://www.wikipathways.org//wpi/wpi.php?action=downloadFile&type=png&pwTitle=Pathway:" . $pwId . "&revision=0";

    $gpmlUrl = "http://www.wikipathways.org//wpi/wpi.php?action=downloadFile&type=gpml&pwTitle=Pathway:" . $pwId;
  }
  elseif (isset($_GET['pathwayUrl'])) {
    echo "<script>var local = true</script>";
    $gpmlUrl = $_GET['pathwayUrl'];
    $svgUrl = str_replace(".gpml", ".svg", $_GET['pathwayUrl']);
    $pngUrl = str_replace(".gpml", ".png", $_GET['pathwayUrl']);
  }

  $svg = simplexml_load_file($svgUrl);

  echo "<div id='java-svg-pathway-container' class='pathway' style='display: none;'>";
    echo $svg->saveXML();
  echo "</div>";

  //$im = imagecreatefrompng($pngUrl);
  //header('Content-Type: image/png');
  

  echo "<div id='java-png-pathway-container' class='pathway' style='display: none;'>";
    echo '<img id="img" src="' . $pngUrl . '"/>';
    //$server_response = base64_encode(file_get_contents($pngUrl));
    //echo '<img id="img" src="data:image/png;base64,' . $server_response . '"/>';
  echo "</div>";

  $gpmlStr = file_get_contents($gpmlUrl);
  $doc = new DOMDocument();
  $doc->loadXML($gpmlStr);

  echo "<div id='gpml' style='display:none'>";

  // need to do this, because it appears Chrome will incorrectly close the self-closing tags in gpml.

  echo $doc->saveXML(null, LIBXML_NOEMPTYTAG);
  echo "</div>";

  //$gpml = simplexml_load_file($gpmlUrl);
  // output the result
  //echo $gpml->asXML();

?>

<object id="pathway-container" data="pathway-template.svg" type="image/svg+xml" width="100%" height="100%" onload="drawPathway()"></object>

<script>
  function insertParam(key, value)
  {
      key = encodeURI(key); value = encodeURI(value);

      var kvp = document.location.search.substr(1).split('&');

      var i=kvp.length; var x; while(i--) 
      {
          x = kvp[i].split('=');

          if (x[0]==key)
          {
              x[1] = value;
              kvp[i] = x.join('=');
              break;
          }
      }

      if(i<0) {kvp[kvp.length] = [key,value].join('=');}

      //this will reload the page, it's likely better to store this until finished
      document.location.search = kvp.join('&'); 
      //document.location.search = kvp.join('&'); 
  }

  window.onload = drawPathway();

  var width = $('#javascript-svg-pathway-container svg')[0].getAttribute('width');
  var height = $('#javascript-svg-pathway-container svg')[0].getAttribute('height');
  $('#java-png-pathway-container img')[0].setAttribute('width', parseFloat(width) + "px");
  $('#java-png-pathway-container img')[0].setAttribute('height', parseFloat(height) + "px");
  /*
  $('#java-png-pathway-container img')[0].setAttribute('width', 0.985*width + "px");
  $('#java-png-pathway-container img')[0].setAttribute('height', 0.985*height + "px");
   */

  function usePathwayImgCreator(creator) {
    $('button.pathway').each(function(i) {
      this.style.backgroundColor = 'lightgray';
    });
    $('#' + creator + '-pathway-button')[0].style.backgroundColor = 'yellow';

    $('div.pathway').each(function(i) {
      this.style.display = 'none';
    });
    $('#' + creator + "-pathway-container")[0].style.display = 'block';
  };
</script>
</body>
