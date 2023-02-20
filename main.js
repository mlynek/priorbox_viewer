  var imageSrc = 'example-assets/target.png'
    , canvasId = 'viewerCanvas'
    , myImageViewer = null
    , solution = []
    , annotations = []
    , answer = null;

  window.onload = function(){
    toDefault();
    onPriorboxesUpdate();
    toShowBoth();
//    WebFont.load({
//      custom: {
//        families: ['FontAwesome'],
//        urls: ['css/fonts.css'],
//        testStrings: {
//          // Fontawesome does not contain 'normal' characters,
//          // therefore we need to test 'special ones'
//          'FontAwesome': '\uf010\uf00e\uf1f8\uf024\uf040\uf047\uf00d\uf1f8'
//        }
//      },
//      fontactive: function() {
//        // initialize image viewer
//        myImageViewer = new ImageViewer(canvasId, imageSrc);
//      }
//    });
  };

  // methods to interact with viewer
  function saveState(){
    answer = myImageViewer.answer;
    solution = myImageViewer.exportSolution();
    annotations = myImageViewer.exportAnnotations();
  }

  function toDefault(force=false){
    if(myImageViewer !== null){
      myImageViewer.dispose();
    }
    myImageViewer = new ImageViewer(canvasId, imageSrc);
    solution = [];
    answer = null;

    toDefaultElementValue("priorbox_number", force);
    toDefaultElementValue("det_x", force);
    toDefaultElementValue("det_y", force);
    toDefaultElementValue("det_w", force);
    toDefaultElementValue("det_h", force);
  }

function toDefaultElementValue(elementName, force=false) {
  var element = document.getElementById(elementName);
  if (force || element.value.length == 0) {
    element.value = "0";
  }
}

  function toEditAnswer(){
    reloadImageViewer('editAnswer');
  }

  function toEditSolution(){
    reloadImageViewer('editSolution');
  }

  function toShowSolution(){
    reloadImageViewer('showSolution');
  }

  function toEditAnnotations(){
    reloadImageViewer('editAnnotations');
  }

  function toShowAnnotations(){
    reloadImageViewer('showAnnotations');
  }

function toShowPriorbox(){
  var priorboxPolygon = getPriorboxPolygon();
  var annotations = [{
    polygon: priorboxPolygon,
    color: '#00FF00',
  }];
    myImageViewer.importAnnotations(annotations);
    toShowAnnotations();
  }

var CenterVariance = 0.1;
var SizeVariance = 0.2;

function toShowBBox(){
  var bboxPolygon = getBboxPolygon();
  var annotations = [{
    polygon: bboxPolygon,
    color: '#FF0000',
  }];
    myImageViewer.importAnnotations(annotations);
    toShowAnnotations();
}

function toShowBoth() {
  var priorboxPolygon = getPriorboxPolygon();
  var bboxPolygon = getBboxPolygon();

  var annotations = [{
    polygon: priorboxPolygon,
    color: '#00FF00',
    }, {
      polygon: bboxPolygon,
      color: '#FF0000',
    }];
    myImageViewer.annotations = [];
    myImageViewer.importAnnotations(annotations);
    toShowAnnotations();
}

function getPriorboxPolygon() {
  var priorbox = priorboxes[document.getElementById("priorbox_number").valueAsNumber]
  var xmin = priorbox[1] * myImageViewer.image.width;
  var ymin = priorbox[0] * myImageViewer.image.height;
  var xmax = priorbox[3] * myImageViewer.image.width;
  var ymax = priorbox[2] * myImageViewer.image.height;
  return [{x: xmin, y: ymin}, {x: xmax, y: ymin}, {x: xmax, y: ymax}, {x: xmin, y: ymax}, {x: xmin, y: ymin}];
}

function getBboxPolygon() {
  var priorbox = priorboxes[document.getElementById("priorbox_number").valueAsNumber]
  var xmin = priorbox[1];
  var ymin = priorbox[0];
  var xmax = priorbox[3];
  var ymax = priorbox[2];
  var det_x = document.getElementById("det_x").valueAsNumber;
  var det_y = document.getElementById("det_y").valueAsNumber;
  var det_w = document.getElementById("det_w").valueAsNumber;
  var det_h = document.getElementById("det_h").valueAsNumber;
  var prior_center_x = (xmax + xmin) / 2;
  var prior_center_y = (ymax + ymin) / 2;
  var prior_width = xmax - xmin;
  var prior_height = ymax - ymin;
  var calc_center_x = det_x * CenterVariance * prior_width + prior_center_x;
  var calc_center_y = det_y * CenterVariance * prior_height + prior_center_y;
  var calc_width = Math.exp(det_w * SizeVariance) * prior_width;
  var calc_height = Math.exp(det_h * SizeVariance) * prior_height;
  var scaled_xmin = calc_center_x - calc_width / 2;
  var scaled_ymin = calc_center_y - calc_height / 2;
  var scaled_xmax = calc_center_x + calc_width / 2;
  var scaled_ymax = calc_center_y + calc_height / 2;
  xmin = scaled_xmin * myImageViewer.image.width;
  ymin = scaled_ymin * myImageViewer.image.height;
  xmax = scaled_xmax * myImageViewer.image.width;
  ymax = scaled_ymax * myImageViewer.image.height;
  return [{x: xmin, y: ymin}, {x: xmax, y: ymin}, {x: xmax, y: ymax}, {x: xmin, y: ymax}, {x: xmin, y: ymin}]
}

  function reloadImageViewer(mode){
    if(myImageViewer !== null){
      saveState();
      myImageViewer.dispose();
    }
    var options = { mode: mode,
                    solution: solution,
                    answer: answer,
                    annotations: annotations
                  };
    myImageViewer = new ImageViewer(canvasId, imageSrc, options);
  }

  // change the image
  function setImage(newSrc){
    imageSrc = newSrc;
    myImageViewer.image.src = newSrc;
  }

function onPriorboxesUpdate() {
    document.getElementById("priorbox_number").max = priorboxes.length - 1;
}

