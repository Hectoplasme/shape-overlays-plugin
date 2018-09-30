/**
 * @file Module to make svg liquid overlays
 * @author Yoichi Kobayashi <https://twitter.com/ykob0123>
 * @author Laurianne Terrier <http://laurianneterrier.com/>
 * @version 1.0
 */

/** Utility function to debounce resize event
 * From https://davidwalsh.name/javascript-debounce-function.
 */
function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this,
      args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

/** Utility variable to store window size*/
let winsize = { width: window.innerWidth, height: window.innerHeight };

/**
 * Object to make the svg overlay on your website
 * @param {object} container - Container element to insert svg overlay after
 * @param {object} toggler - Button element who trigger the toggle function
 * @param {object} options - numPoints {number}, duration {number}, delayMax {number}, interval {number}, easing {string}
 * @constructor
 */
class ShapeOverlays {
  constructor(container, toggler, options) {
    this.DOM = { container: container, toggler: toggler };
    this.options = {
      numPoints: 10,
      duration: 900,
      delayMax: 300,
      interval: 250,
      ease: "CubicInOut",
      colors: [["#00c99b", "#ff0ea1"], ["#ffd392", "#ff3898"], "#110046"],
      openClass: "is-opened",
      animatable: [],
      direction: "bottom",
      alternate: false
    };
    Object.assign(this.options, options);

    this.delayPointsArray = [];
    this.timeStart = Date.now();
    this.isOpened = false;
    this.isAnimationg = false;

    if (this.DOM.toggler && this.DOM.container) {
      this.setup();
    }
  }
}

/** This method draw the svg and his color refs */
ShapeOverlays.prototype.drawSVG = function() {
  //Create the svg container
  this.DOM.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

  this.DOM.svg.setAttribute("class", "shape-overlays");
  this.DOM.svg.setAttribute("width", `${winsize.width}px`);
  this.DOM.svg.setAttribute("height", `${winsize.height}px`);
  this.DOM.svg.setAttribute(
    "viewbox",
    `0 0 ${winsize.width} ${winsize.height}`
  );
  this.DOM.svg.setAttribute("preserveAspectRatio", "none");

  this.DOM.defs = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "defs"
  );
  this.DOM.paths = [];

  //Create the fill definitions
  this.defs = this.options.colors.map((color, i) => {
    const def = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "linearGradient"
    );
    def.setAttribute("id", `gradient${i + 1}`);
    def.setAttribute("x1", "0%");
    def.setAttribute("y1", "0%");
    def.setAttribute("x2", "0%");
    def.setAttribute("y2", "100%");

    //Map colors of the gradient references
    const colors = [];
    if (!Array.isArray(color) && typeof color === "string") {
      const colorFill = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "stop"
      );
      colorFill.setAttribute("offset", "0%");
      colorFill.setAttribute("stop-color", color);
      colors.push(colorFill);
    } else if (Array.isArray(color)) {
      for (let j = 0; j < color.length; j++) {
        if (typeof color[j] === "string") {
          const colorFill = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "stop"
          );
          colorFill.setAttribute(
            "offset",
            `${(j * 100) / (color.length - 1)}%`
          );
          colorFill.setAttribute("stop-color", color[j]);
          colors.push(colorFill);
        }
      }
    }
    for (let j = 0; j < colors.length; j++) {
      def.appendChild(colors[j]);
    }

    //Create the color path
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill", `url(#gradient${i + 1})`);
    this.DOM.paths.push(path);
    this.DOM.defs.appendChild(def);
    return def;
  });

  // Append defs to svg
  this.DOM.svg.appendChild(this.DOM.defs);

  //Append paths to svg
  for (let i = 0; i < this.DOM.paths.length; i++) {
    this.DOM.svg.appendChild(this.DOM.paths[i]);
  }

  //Append svg after the container
  this.DOM.container.parentNode.insertBefore(
    this.DOM.svg,
    this.DOM.container.nextSibling
  );
};

ShapeOverlays.prototype.onResize = function() {
  winsize = { width: window.innerWidth, height: window.innerHeight };
  this.DOM.svg.setAttribute("width", `${winsize.width}px`);
  this.DOM.svg.setAttribute("height", `${winsize.height}px`);
  this.DOM.svg.setAttribute(
    "viewbox",
    `0 0 ${winsize.width} ${winsize.height}`
  );
  if (this.delayPointsArray.length !== 0) {
    this.renderLoop();
  }
};

/** This method handle the toggle action */
ShapeOverlays.prototype.toggle = function() {
  this.isAnimating = true;

  //Populate the points array with random initial value
  for (let i = 0; i < this.options.numPoints; i++) {
    this.delayPointsArray[i] = Math.random() * this.options.delayMax;
  }

  if (this.isOpened) {
    this.close();
  } else {
    this.open();
  }
};

/** This method open the panel */
ShapeOverlays.prototype.open = function() {
  this.isOpened = true;
  // Add utility class to toggler and svg
  this.DOM.svg.classList.add(this.options.openClass);
  this.DOM.toggler.classList.add(this.options.openClass);

  // Add utility class to animatable elements (ex: menu items)
  if (this.options.animatable instanceof Element) {
    this.options.animatable.classList.add(this.options.openClass);
  } else {
    for (let i = 0; i < this.options.animatable.length; i++) {
      this.options.animatable[i].classList.add(this.options.openClass);
    }
  }

  this.timeStart = Date.now();
  this.renderLoop();
};

/** This method close the panel */
ShapeOverlays.prototype.close = function() {
  // close code goes here
  this.isOpened = false;
  // Remove utility class to toggler and svg
  this.DOM.svg.classList.remove(this.options.openClass);
  this.DOM.toggler.classList.remove(this.options.openClass);

  // Remove utility class to animatable elements (ex: menu items)
  if (this.options.animatable instanceof Element) {
    this.options.animatable.classList.remove(this.options.openClass);
  } else {
    for (let i = 0; i < this.options.animatable.length; i++) {
      this.options.animatable[i].classList.remove(this.options.openClass);
    }
  }

  this.timeStart = Date.now();
  this.renderLoop();
};

/** This method return the easing function
 * @param {string} ease
 */
ShapeOverlays.prototype.getEasing = function(ease) {
  //
  // these easing functions are based on the code of glsl-easing module.
  // https://github.com/glslify/glsl-easings
  //

  switch (ease) {
    case "exponentialIn":
      return t => {
        return t == 0.0 ? t : Math.pow(2.0, 10.0 * (t - 1.0));
      };
    case "exponentialOut":
      return t => {
        return t == 1.0 ? t : 1.0 - Math.pow(2.0, -10.0 * t);
      };
    case "exponentialInOut":
      return t => {
        return t == 0.0 || t == 1.0
          ? t
          : t < 0.5
            ? +0.5 * Math.pow(2.0, 20.0 * t - 10.0)
            : -0.5 * Math.pow(2.0, 10.0 - t * 20.0) + 1.0;
      };
    case "sineOut":
      return t => {
        const HALF_PI = 1.5707963267948966;
        return Math.sin(t * HALF_PI);
      };
    case "circularInOut":
      return t => {
        return t < 0.5
          ? 0.5 * (1.0 - Math.sqrt(1.0 - 4.0 * t * t))
          : 0.5 * (Math.sqrt((3.0 - 2.0 * t) * (2.0 * t - 1.0)) + 1.0);
      };
    case "cubicIn":
      return t => {
        return t * t * t;
      };
    case "cubicOut":
      return t => {
        const f = t - 1.0;
        return f * f * f + 1.0;
      };
    case "cubicInOut":
      return t => {
        return t < 0.5
          ? 4.0 * t * t * t
          : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
      };
    case "quadraticOut":
      return t => {
        return -t * (t - 2.0);
      };
    case "quarticOut":
      return t => {
        return Math.pow(t - 1.0, 3.0) * (1.0 - t) + 1.0;
      };
    default:
      return t => {
        return t < 0.5
          ? 4.0 * t * t * t
          : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
      };
  }
};

/** This method return a string describing the path movement for the path d attribute depending on the direction
 * @param {object} time
 */
ShapeOverlays.prototype.updatePath = function(time) {
  switch (this.options.direction) {
    case "bottom":
      return this.options.alternate === true
        ? this.isOpened
          ? this.goToBottom(time)
          : this.goToTop(time)
        : this.goToBottom(time);
    case "left":
      return this.options.alternate === true
        ? this.isOpened
          ? this.goToLeft(time)
          : this.goToRight(time)
        : this.goToLeft(time);
    case "right":
      return this.options.alternate === true
        ? this.isOpened
          ? this.goToRight(time)
          : this.goToLeft(time)
        : this.goToRight(time);
    case "top":
      return this.options.alternate === true
        ? this.isOpened
          ? this.goToTop(time)
          : this.goToBottom(time)
        : this.goToTop(time);
    default:
      return this.options.alternate === true
        ? this.isOpened
          ? this.goToBottom(time)
          : this.goToTop(time)
        : this.goToBottom(time);
  }
};

/** This method return a string describing the path movement left to right
 * @param {object} time
 */
ShapeOverlays.prototype.goToRight = function(time) {
  const points = [];
  let thisEase;
  for (let i = 0; i < this.options.numPoints; i++) {
    if (
      this.options.numPoints === 2 &&
      Array.isArray(this.options.ease) &&
      this.options.ease[1]
    ) {
      thisEase = this.isOpened
        ? i === 1
          ? this.getEasing(this.options.ease[0])
          : this.getEasing(this.options.ease[1])
        : i === 1
          ? this.getEasing(this.options.ease[1])
          : this.getEasing(this.options.ease[0]);
    } else {
      thisEase = Array.isArray(this.options.ease)
        ? i % 2 === 1
          ? this.getEasing(this.options.ease[0])
          : this.options.ease[1]
            ? this.getEasing(this.options.ease[1])
            : this.getEasing(this.options.ease[0])
        : this.getEasing(this.options.ease);
    }

    points[i] =
      thisEase(
        Math.min(
          Math.max(time - this.delayPointsArray[i], 0) / this.options.duration,
          1
        )
      ) * winsize.width;
  }
  let str = "";
  str += this.isOpened ? `M ${points[0]} 0` : `M 0 0 H ${points[0]}`;

  for (let i = 0; i < this.options.numPoints - 1; i++) {
    const p = ((i + 1) / (this.options.numPoints - 1)) * winsize.width;
    const cp = p - ((1 / (this.options.numPoints - 1)) * winsize.width) / 2;
    str += `C ${points[i]} ${cp} ${points[i + 1]} ${cp} ${points[i + 1]} ${p} `;
  }
  str += this.isOpened ? `H 0 V 0` : `H ${winsize.width} V 0`;
  return str;
};

/** This method return a string describing the path movement right to left
 * @param {object} time
 */
ShapeOverlays.prototype.goToLeft = function(time) {
  const points = [];
  let thisEase;
  for (let i = 0; i < this.options.numPoints; i++) {
    if (
      this.options.numPoints === 2 &&
      Array.isArray(this.options.ease) &&
      this.options.ease[1]
    ) {
      thisEase = this.isOpened
        ? i === 1
          ? this.getEasing(this.options.ease[0])
          : this.getEasing(this.options.ease[1])
        : i === 1
          ? this.getEasing(this.options.ease[1])
          : this.getEasing(this.options.ease[0]);
    } else {
      thisEase = Array.isArray(this.options.ease)
        ? i % 2 === 1
          ? this.getEasing(this.options.ease[0])
          : this.options.ease[1]
            ? this.getEasing(this.options.ease[1])
            : this.getEasing(this.options.ease[0])
        : this.getEasing(this.options.ease);
    }

    points[i] =
      (1 -
        thisEase(
          Math.min(
            Math.max(time - this.delayPointsArray[i], 0) /
              this.options.duration,
            1
          )
        )) *
      winsize.width;
  }
  let str = "";
  str += this.isOpened ? `M 0 0 H ${points[0]}` : `M ${points[0]} 0`;

  for (let i = 0; i < this.options.numPoints - 1; i++) {
    const p = ((i + 1) / (this.options.numPoints - 1)) * winsize.width;
    const cp = p - ((1 / (this.options.numPoints - 1)) * winsize.width) / 2;
    str += `C ${points[i]} ${cp} ${points[i + 1]} ${cp} ${points[i + 1]} ${p} `;
  }
  str += this.isOpened ? `H ${winsize.width} V 0` : `H 0 V 0`;
  return str;
};

/** This method return a string describing the path movement top to bottom
 * @param {object} time
 */
ShapeOverlays.prototype.goToBottom = function(time) {
  const points = [];
  let thisEase;
  for (let i = 0; i < this.options.numPoints; i++) {
    if (
      this.options.numPoints === 2 &&
      Array.isArray(this.options.ease) &&
      this.options.ease[1]
    ) {
      thisEase = this.isOpened
        ? i === 1
          ? this.getEasing(this.options.ease[0])
          : this.getEasing(this.options.ease[1])
        : i === 1
          ? this.getEasing(this.options.ease[1])
          : this.getEasing(this.options.ease[0]);
    } else {
      thisEase = Array.isArray(this.options.ease)
        ? i % 2 === 1
          ? this.getEasing(this.options.ease[0])
          : this.options.ease[1]
            ? this.getEasing(this.options.ease[1])
            : this.getEasing(this.options.ease[0])
        : this.getEasing(this.options.ease);
    }

    points[i] =
      thisEase(
        Math.min(
          Math.max(time - this.delayPointsArray[i], 0) / this.options.duration,
          1
        )
      ) * winsize.height;
  }
  let str = "";
  str += this.isOpened ? `M 0 0 V ${points[0]}` : `M 0 ${points[0]}`;

  for (let i = 0; i < this.options.numPoints - 1; i++) {
    const p = ((i + 1) / (this.options.numPoints - 1)) * winsize.width;
    const cp = p - ((1 / (this.options.numPoints - 1)) * winsize.width) / 2;
    str += `C ${cp} ${points[i]} ${cp} ${points[i + 1]} ${p} ${points[i + 1]}`;
  }
  str += this.isOpened ? `V 0 H 0` : `V ${winsize.height} H 0`;
  return str;
};

/** This method return a string describing the path movement bottom to top
 * @param {object} time
 */
ShapeOverlays.prototype.goToTop = function(time) {
  const points = [];
  let thisEase;
  for (let i = 0; i < this.options.numPoints; i++) {
    if (
      this.options.numPoints === 2 &&
      Array.isArray(this.options.ease) &&
      this.options.ease[1]
    ) {
      thisEase = this.isOpened
        ? i === 1
          ? this.getEasing(this.options.ease[0])
          : this.getEasing(this.options.ease[1])
        : i === 1
          ? this.getEasing(this.options.ease[1])
          : this.getEasing(this.options.ease[0]);
    } else {
      thisEase = Array.isArray(this.options.ease)
        ? i % 2 === 1
          ? this.getEasing(this.options.ease[0])
          : this.options.ease[1]
            ? this.getEasing(this.options.ease[1])
            : this.getEasing(this.options.ease[0])
        : this.getEasing(this.options.ease);
    }

    points[i] =
      (1 -
        thisEase(
          Math.min(
            Math.max(time - this.delayPointsArray[i], 0) /
              this.options.duration,
            1
          )
        )) *
      winsize.height;
  }
  let str = "";
  str += this.isOpened ? `M 0 ${points[0]}` : `M 0 0 V ${points[0]}`;

  for (let i = 0; i < this.options.numPoints - 1; i++) {
    const p = ((i + 1) / (this.options.numPoints - 1)) * winsize.width;
    const cp = p - ((1 / (this.options.numPoints - 1)) * winsize.width) / 2;
    str += `C ${cp} ${points[i]} ${cp} ${points[i + 1]} ${p} ${points[i + 1]}`;
  }
  str += this.isOpened ? `V ${winsize.height} H 0` : `V 0 H 0`;
  return str;
};

/** This method set the paths d attribute according to time*/
ShapeOverlays.prototype.render = function() {
  if (this.isOpened) {
    for (let i = 0; i < this.DOM.paths.length; i++) {
      this.DOM.paths[i].setAttribute(
        "d",
        this.updatePath(
          Date.now() - (this.timeStart + this.options.interval * i)
        )
      );
    }
  } else {
    for (let i = 0; i < this.DOM.paths.length; i++) {
      this.DOM.paths[i].setAttribute(
        "d",
        this.updatePath(
          Date.now() -
            (this.timeStart +
              this.options.interval * (this.DOM.paths.length - 1 - i))
        )
      );
    }
  }
};

/** This method animate the rendered paths */
ShapeOverlays.prototype.renderLoop = function() {
  this.render();

  if (
    Date.now() - this.timeStart <
    this.options.duration +
      this.options.interval * (this.DOM.paths.length - 1) +
      this.options.delayMax
  ) {
    requestAnimationFrame(() => {
      this.renderLoop();
    });
  } else {
    this.isAnimating = false;
  }
};

/** This method create the svg and listen events (toggler click && window resize)*/
ShapeOverlays.prototype.setup = function() {
  this.drawSVG();

  this.DOM.toggler.addEventListener("click", () => this.toggle());
  window.addEventListener(
    "resize",
    debounce(() => {
      this.onResize();
    })
  );
};
