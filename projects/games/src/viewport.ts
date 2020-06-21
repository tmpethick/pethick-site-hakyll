export function runWhenInViewport(element, callback) {
  let ran = false;
  if (inView(element)) {
    callback();
  } else {
    const callbackWrapper = () => {
      if (!ran && inView(element)) {
        callback();
        ran = true;
        document.removeEventListener('scroll', callbackWrapper);
      }
    };
    document.addEventListener('scroll', callbackWrapper);
  }

}

// check if element is in view
export function inView(element) {
  var elementHeight = element.clientHeight;
  // get window height
  var windowHeight = window.innerHeight;
  // get number of pixels that the document is scrolled
  var scrollY = window.scrollY || window.pageYOffset;
  
  // get current scroll position (distance from the top of the page to the bottom of the current viewport)
  var scrollPosition = scrollY + windowHeight;
  // get element position (distance from the top of the page to the bottom of the element)
  var elementPosition = element.getBoundingClientRect().top + scrollY + elementHeight;
  
  // is scroll position greater than element position? (is element in view?)
  if (scrollPosition > elementPosition) {
    return true;
  }
  
  return false;
}
