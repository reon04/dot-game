// disable friendly errors -> performance boost
p5.disableFriendlyErrors = true;

// global vars
let img, cutImg;
let minSize;
let spots = [];
let px, py;
let prevFrame = -15;

function preload() {
  //img = loadImage("https://upload.wikimedia.org/wikipedia/commons/d/d9/Kodaki_fuji_frm_shojinko.jpg");
  //img = loadImage("https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Grosser_Panda.JPG/640px-Grosser_Panda.JPG");
  //img = loadImage('https://t3.ftcdn.net/jpg/02/70/97/22/360_F_270972208_0wCfv9Nv4pOWbMiHyyHW6uKrRc613NCu.jpg');
  img = loadImage('https://etxdj2omrj7.exactdn.com/wp-content/uploads/2023/05/baeumer_fabian_2017_01.jpg?strip=all&lossy=1&ssl=1');
}

function setup() {
  // setup general things
  disableScroll();
  createCanvas(windowWidth, windowHeight);
  frameRate(30);
  ellipseMode(CENTER);
  noStroke();
  
  // cut and resize image
  minSize = min(width, height);
  let imgMinSize = min(img.width, img.height);
  cutImg = img.get(img.width/2-imgMinSize/2, img.height/2-imgMinSize/2, imgMinSize, imgMinSize);
  cutImg.resize(minSize, minSize);
  cutImg.loadPixels();

  // generate spots
  let spot = generateSpots(width/2, height/2, 0.9*minSize, 8);
  spot.show = true;
  
  // init previous mouse position
  px = mouseX;
  py = mouseY;
}

function draw() {
  // draw new background
  background(237, 214, 154);
  
  // check for autosolve
  if (window.location.hash.substring(1) == "solve") if (frameCount > prevFrame + 15) {
    prevFrame = frameCount;
    for (let spot of spots) spot.auto();
  }
  
  // update and draw spots
  //let t1 = millis();
  for (let spot of spots) spot.update(px, py, mouseX, mouseY);
  //let t2 = millis();
  for (let spot of spots) spot.draw();
  //let t3 = millis();
  //print("update: " + (t2-t1) + "ms");
  //print("draw: " + (t3-t2) + "ms");
  //print("both: " + (t3-t1) + "ms");
  //print("frame rate: " + frameRate() + "fps");
  
  // store mouse position as previous mouse position for next loop iteration
  px = mouseX;
  py = mouseY;
}

function mousePressed() {
  for (let spot of spots) spot.auto();
}

function touchStarted() {
  // ignore old touch position if screen is newly touched
  px = mouseX;
  py = mouseY;
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