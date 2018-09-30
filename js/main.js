(function() {
  const mainContainer = document.querySelector(".js-container");
  const button = document.querySelector(".js-toggler");
  const overlay = new ShapeOverlays(mainContainer, button, {
    numPoints: 4,
    duration: 800,
    delayMax: 0,
    interval: 60,
    ease: ["sineOut", "exponentialInOut"],
    direction: "left",
    alternate: true,
    animatable: document.querySelectorAll(".js-menu-item")
  });
})();
