// disable friendly errors -> performance boost
p5.disableFriendlyErrors = true;

// global vars
let picture_mode = true;
let img, cutImg;
let minSize;
let spots = [];
let prevFrame = -15;
let xoffset;
let yoffset = 35;
let inputUrlInput, convertButton, outputUrlInput, copyButton, openButton;
let corsAnywhereURL = "?replace_label_cors_anywhere_url?";

function preload() {
  imageURL = getURLParams()['img'];
  example_mode = getURLParams()['example'];
  if (imageURL) img = loadImage(corsAnywhereURL + atob(imageURL));
  else if (example_mode == '1') img = loadImage('example.jpg');
  else picture_mode = false;
}

function setup() {
  // setup general things
  select('body').style('width: '+windowWidth+'px;'+'height: '+windowHeight+'px;');
  disableScroll();
  createCanvas(windowWidth, windowHeight);
  frameRate(30);
  ellipseMode(CENTER);
  noStroke();
  let homeDiv = createDiv();
  homeDiv.child(createA("/", "Home").style('font-size: 15px; text-decoration: none'));
  homeDiv.style('width: 100px; height: auto; position: absolute; left: '+(windowWidth/2-140)+'px; bottom: '+(yoffset/2-9)+'px; text-align: center;');
  let exampleDiv = createDiv();
  exampleDiv.child(createA("/?example=1", "Example").style('font-size: 15px; text-decoration: none'));
  exampleDiv.style('width: 100px; height: auto; position: absolute; right: '+(windowWidth/2-140)+'px; bottom: '+(yoffset/2-9)+'px; text-align: center;');
  
  if (picture_mode) {
    // cut and resize image
    minSize = min(width, height);
    let imgMinSize = min(img.width, img.height);
    cutImg = img.get(img.width/2-imgMinSize/2, img.height/2-imgMinSize/2, imgMinSize, imgMinSize);
    cutImg.resize(minSize, minSize);
    cutImg.loadPixels();

    // generate spots
    let spot = generateSpots(width/2, (height-yoffset)/2, 0.9*(minSize-yoffset), 8);
    spot.reveal(width/2, 0, 1, spot.col);
  }
  else {
    // create DOM objects
    xoffset = windowWidth/2-200;
    inputUrlInput = createInput();
    inputUrlInput.style('position: absolute; left: '+(xoffset+10)+'px; top: 74px; width: 310px;');
    convertButton = createButton('convert');
    convertButton.style('position: absolute; left: '+(xoffset+330)+'px; top: 74px; width: 60px;');
    convertButton.mousePressed(convertButtonPressed);
    outputUrlInput = createInput();
    outputUrlInput.style('position: absolute; left: '+(xoffset+10)+'px; top: 127px; width: 277px;');
    outputUrlInput.attribute('disabled', '');
    copyButton = createButton('copy');
    copyButton.style('position: absolute; left: '+(xoffset+297)+'px; top: 127px; width: 45px;');
    copyButton.attribute('disabled', '');
    copyButton.mousePressed(() => {navigator.clipboard.writeText(outputUrlInput.value());});
    openButton = createButton('open');
    openButton.style('position: absolute; left: '+(xoffset+345)+'px; top: 127px; width: 45px;');
    openButton.attribute('disabled', '');
    openButton.mousePressed(() => {window.location.href = outputUrlInput.value()});
  }
}

function draw() {
  // draw new background
  background(237, 214, 154);
  drawLine(0, height-yoffset+1, width, height-yoffset+1, 2, [191, 172, 124]);
  
  if (picture_mode) {
    // check for autosolve
    if (window.location.hash.substring(1) == "solve") if (frameCount > prevFrame + 15) {
      prevFrame = frameCount;
      for (let spot of spots) spot.auto();
    }

    // update and draw spots
    for (let spot of spots) spot.update(pmouseX, pmouseY, mouseX, mouseY);
    for (let spot of spots) spot.draw();
  }
  else {
    // draw text and lines
    drawLine(xoffset+5, 5, xoffset+395, 5);
    drawLine(xoffset+5, 44, xoffset+395, 44);
    drawLine(xoffset+5, 160, xoffset+395, 160);
    drawLine(xoffset+5, 5, xoffset+5, 160);
    drawLine(xoffset+395, 5, xoffset+395, 160);
    drawText("Dot Game", xoffset+200, 36, 32, 0, CENTER);
    drawText("picture URL:", xoffset+11, 67, 18);
    drawText("output URL:", xoffset+11, 120, 18);
  }
}

function drawText(txt="", x=0, y=0, size=12, color=0, align=LEFT, style=NORMAL) {
  noStroke();
  fill(color);
  textSize(size);
  textAlign(align, BASELINE);
  textStyle(style);
  text(txt, x, y);
  return textWidth(txt);
}

function drawLine(x0, y0, x1, y1, thick=3, col=0) {
  strokeWeight(thick);
  stroke(col);
  line(x0, y0, x1, y1);
}

//function mousePressed() {
//  if (picture_mode) for (let spot of spots) spot.auto();
//}

function convertButtonPressed() {
  copyButton.attribute('disabled', '');
  openButton.attribute('disabled', '');
  outputUrlInput.value('...');
  url = inputUrlInput.value();
  loadImage(corsAnywhereURL + url, (img) => {
    outputUrlInput.value(window.location.protocol + "//" + window.location.host + "?img=" + btoa(url));
    copyButton.removeAttribute('disabled');
    openButton.removeAttribute('disabled');
  }, (e) => {
    outputUrlInput.value("ERROR: image URL could not be loaded");
  });
}

function generateSpots(x, y, d, n) {
  let spot;
  if (n > 1) {
    let l = [];
    l.push(generateSpots(x-d/4, y-d/4, d/2, n-1));
    l.push(generateSpots(x+d/4, y-d/4, d/2, n-1));
    l.push(generateSpots(x-d/4, y+d/4, d/2, n-1));
    l.push(generateSpots(x+d/4, y+d/4, d/2, n-1));
    spot = new Spot(x, y, d, calcAvgColor(l), l);
  }
  else spot = new Spot(x, y, d, calcAvgPixelCol(x, y, d), []);
  spots.push(spot);
  return spot;
}

function getPixelColor(x, y) {
  x = max(min(minSize-1, x), 0);
  y = max(min(minSize-1, y), 0);
  let index = (y * cutImg.width + x) * 4;
  return [cutImg.pixels[index+0], cutImg.pixels[index+1], cutImg.pixels[index+2]];
}

function calcAvgPixelCol(x, y, d) {
  let sum = [0, 0, 0];
  let numPixels = 0;
  for (let i = int(x-d/2-(width/2-minSize/2)); i<=x+d/2-(width/2-minSize/2); i++) {
    for (let j = int(y-d/2-(height/2-minSize/2)); j<=y+d/2-(height/2-minSize/2); j++) {
      let col = getPixelColor(i, j);
      sum[0] += col[0];
      sum[1] += col[1];
      sum[2] += col[2];
      numPixels++;
    }
  }
  return [sum[0] / numPixels, sum[1] / numPixels, sum[2] / numPixels];
}

function calcAvgColor(chld) {
  let sum = [0, 0, 0];
  for (let c of chld) {
    sum[0] += c.col[0];
    sum[1] += c.col[1];
    sum[2] += c.col[2];
  }
  return [sum[0] / chld.length, sum[1] / chld.length, sum[2] / chld.length];
}