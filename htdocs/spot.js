let animSpeed = 4; //higher is slower
let minDistFactReveal = 0.025;

function drawCircle(x, y, d, c) {
  let r = d/2;
  drawingContext.beginPath();
  drawingContext.arc(x, y, r, 0, TWO_PI);
  drawingContext.fillStyle = "rgb(" + c + ")";
  drawingContext.fill();
}

function dst(x1, y1, x2, y2) {
  return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
}

class Spot {
  constructor(x, y, d, col, chld) {
    this.x = x;
    this.y = y;
    this.d = d;
    this.cx = x;
    this.cy = y;
    this.cd = d;
    this.col = col;
    this.ccol = col;
    this.chld = chld;
    this.parentDst = 1;
    this.parentD = d;
    this.parentCol = col;
    this.show = false;
    this.anim = false;
  }
  
  draw() {
    if (this.show) {
      if (this.anim) {
        let l = Math.min(dst(this.cx, this.cy, this.x, this.y) / this.parentDst, 1);
        let ll = Math.sqrt(l);
        this.ccol = [ll*this.parentCol[0]-(ll-1)*this.col[0], ll*this.parentCol[1]-(ll-1)*this.col[1], ll*this.parentCol[2]-(ll-1)*this.col[2]];
        this.cd = l * (this.parentD - this.d) + this.d;
        drawCircle(this.cx, this.cy, this.cd*(1+((minSize/250)/(this.cd*this.cd))), this.ccol);
      }
      else drawCircle(this.x, this.y, this.d, this.col);
    }
  }
  
  update(px, py, x, y) {
    if(dist(x, y, this.cx, this.cy) <= this.cd) this.over = true;
    else this.over = false;
    if (this.anim) {
      this.cx -= (this.cx-this.x) / animSpeed;
      this.cy -= (this.cy-this.y) / animSpeed;
      if (dist(this.x, this.y, this.cx, this.cy) < 0.1) {
        this.cx = this.x;
        this.cy = this.y;
        this.cd = this.d;
        this.ccol = this.col;
        this.anim = false;
      }
    }
    if (this.show && this.chld.length > 0 && dist(this.x, this.y, this.cx, this.cy) < minDistFactReveal*this.parentD) {
      let d = createVector(x-px, y-py);
      let f = createVector(px-this.cx, py-this.cy);
      let a = d.dot(d);
      let b = 2*f.dot(d);
      let c = f.dot(f)-(this.cd/2)*(this.cd/2);
      let discrim = b*b-4*a*c;
      if (discrim >= 0) {
        discrim = Math.sqrt(discrim);
        let t1 = (-b - discrim)/(2*a);
        let t2 = (-b + discrim)/(2*a);
        if((t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1) && !this.over) this.revealChld();
      }
    }
  }
  
  revealChld() {
    this.show = false;
    for (let spot of this.chld) spot.reveal(this.cx, this.cy, this.cd, this.ccol);
  }
  
  reveal(x, y, d, col) {
    this.cx = x;
    this.cy = y;
    this.parentD = d;
    this.parentDst = dist(this.x, this.y, x, y);
    this.parentCol = col;
    this.show = true;
    this.anim = true;
  }
  
  auto() {
    if (this.show && this.chld.length > 0) this.revealChld();
  }
}
