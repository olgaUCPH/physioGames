/// MAIN FUNCTIONALITIES

// - Click and Drag of Control Points
// - Drawing smooth curve

/// GENERAL ALL PURPOSE & TECHNICAL FUNCTIONS ///////////////////////////////////////////////////

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/// RELEVANT HTML ELEMENTS ////////////////////////////////////////////////////////////////////

const canvas = document.getElementById("gridContainer");                    //Where the curve should be drawn
let cP = document.querySelectorAll('.controlPoint:not(.visualInstruction)');//Points controlled by the user to define the curve
let cP_VI = document.querySelectorAll('.controlPoint.visualInstruction');   //Points for visual instructions

let curve = document.createElementNS("http://www.w3.org/2000/svg", 'svg');  //Create curve for further modification
let curve_VI = document.createElementNS("http://www.w3.org/2000/svg", 'svg');//Create curve for visual instructions

let graph = document.querySelector('.fullGraph');

/// VARIABLE DEFINITIONS //////////////////////////////////////////////////////////////////////

let canvasW = canvas.getBoundingClientRect().width;                         //Canvas width, for curve scaling
let canvasH = canvas.getBoundingClientRect().height;                        //Canvas height, for curve scaling

let cPcoords = [];                                                          //Array containing coordinates of all control points
let cPcoords_VI = [];                                                       //Array containing coordinates of all control points

let bool_vl = true;                                                         //Bool indicating if visual instructions should be displayed
let lastTrigger = Date.now();                                               //Last time click & drag was triggered (bug fix)

/// EVENT LISTENERS //////////////////////////////////////////////////////////////////////////

cP.forEach(point => {
    point.onmousedown = dragFunction(point);                                            //Add drag listener (mouse)
    point.addEventListener('touchstart', dragFunction(point));                          //Add drag listener (touchscreen)
    point.ondragstart = function() {return false;};                                     //Disable undesirable native drag 
  })


/// CURVE HANDLING ////////////////////////////////////////////////////////////////////////////


function getPosition(element){                                              //Gets the X/Y position of an element relative to the canvas
    let rec = element.getBoundingClientRect();
    let x = rec.left + rec.width/2 - canvas.getBoundingClientRect().left;   //Get X position of center of element
    let y = rec.top + rec.height/2 - canvas.getBoundingClientRect().top;    //Get Y position of center of element
    return [x,y];
}

function getPoints(){                                                       //Gets X/Y coordinates of all the control points
    cPcoords = [];                                                          
    cP.forEach(point => cPcoords.push(getPosition(point)));
}

const svgPath = (points) => {                                               //Writes the svg path from given point coordinates
    const d = points.reduce((acc, point, i, a) => i === 0                   
      ? `M ${point[0]},${point[1]}`                                         //If first element, simply move there
      : `${acc} ${bezierCommand(point, i, a)}`                              //Otherwise, write the accumulated string & the next bezier control point
    , '')
    return `<path d="${d}" fill="none" stroke="var(--pseudo-black)" />`     
  }

const line = (pointA, pointB) => {                                          //Compute a line between two given points
    const lengthX = pointB[0] - pointA[0]                                   //X length
    const lengthY = pointB[1] - pointA[1]                                   //Y length
    return {
      length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),       //Total length
      angle: Math.atan2(lengthY, lengthX)                                   //Angle
    }
}

const controlPoint = (current, previous, next, reverse) => {                
    //Computes the bezier control point to be used to join smoothly previous, current and next point using bezier burves
    //Code inspired by https://francoisromain.medium.com/smooth-a-svg-path-with-cubic-bezier-curves-e37b49d46c74
    const p = previous || current                                           //For first control point, previous does not exist
    const n = next || current                                               //For last control point, next does not exist
    const smoothing = 0.15                                                  //Working value: 0 is linear, 1 is weird
    const o = line(p, n)                                                    //Properties of the opposed line
    const angle = o.angle + (reverse ? Math.PI : 0)                         //If current is last point, add pi to reverse angle
    const length = o.length * smoothing                                     //Smooth
    const x = current[0] + Math.cos(angle) * length                         //Compute control point x position
    const y = current[1] + Math.sin(angle) * length                         //Compute control point y position
    return [x, y]
  }  

const bezierCommand = (point, i, a) => {                                    //Generate two bezier control point to join to next point
    const [cpsX, cpsY] = controlPoint(a[i - 1], a[i - 2], point)            //Start control point
    const [cpeX, cpeY] = controlPoint(point, a[i - 1], a[i + 1], true)      //End control point
    return `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point[0]},${point[1]}`  
  }

function initializeCurve(){
    getPoints();                                                            //Compute initial point coordinates
    curve.id = "curve";                                                     //Style curve
    curve.setAttribute("width", canvasW);                                   //Set to canvas width for correct scaling
    curve.setAttribute("height", canvasH);                                  //Set to canvas height for correct scaling
    curve.innerHTML = svgPath(cPcoords);                                    //Draw path using bezier curves; interpolate(cPcoords,200)
    canvas.appendChild(curve);                                              //Display on webpage
}

function updateCurve(){                                                     //Redraw curve when moving control points
    getPoints();                                                            //Calculate coordinates
    curve.innerHTML = svgPath(cPcoords);                                    //Update curve; interpolate(cPcoords,200)
}

initializeCurve();


/// B-SPLINE INTERPOLATION (USELESS? DOES NOT SEEM TO WORK AS INTENDED) /////////////////////////////////////

const b3 = (x) => {
  return Math.abs(x) < 1 ? 2/3 - x**2 + Math.abs(x)**3/2 : Math.abs(x) < 2 ? ((2-Math.abs(x))**3)/6 : 0;
}

const Phi = (x,ref) => {
  let agg = [];
  let h = (Math.max(...ref) - Math.min(...ref))/ref.length;
  for (let i = 0; i < ref.length; i++){
    agg.push(x.map((x) => b3((x-ref[i])/h)));
  }
  return math.transpose(math.matrix(agg));
}

function interpolate(points, N){
  const x = points.map(p => p[0]);
  const y = points.map(p => p[1]);
  const xi = Array.from({length: N}, (v, i) => Math.min(...x) + i * (Math.max(...x) - Math.min(...x)) / (N - 1));
  const phi = Phi(x, x);
  const W = math.multiply(math.multiply(math.inv(math.multiply(math.transpose(phi),phi)),math.transpose(phi)),y);
  const phi2 = Phi(xi, x);
  const yi = math.multiply(phi2, W);
  let points_i = [];
  for (let i = 0; i < N; i++){
    points_i.push([xi[i],yi.subset(math.index(i))]);
  }
  return points_i;
}

/// CLICK AND DRAG ////////////////////////////////////////////////////////////////////////////

function dragFunction(element){
    return function(event){
      userX = event.clientX || event.targetTouches[0].pageX;                          //Get current mouse x position
      userY = event.clientY || event.targetTouches[0].pageY;                          //Get current mouse y position
      let shiftX = userX - element.getBoundingClientRect().left;                      //Compute relative position of mouse to dragged element (x)
      let shiftY = userY - element.getBoundingClientRect().top;                       //Compute relative position of mouse to dragged element (y)
    parent = element.parentNode;
    document.body.appendChild(element);                                               //Pull element out of its parent (for positioning)
    
    element.style.position = "fixed";                                                 //Fixed position (for positioning)
    element.style.zIndex = 1000;                                                      //Bring element to front side
    document.body.classList.add('no-select');                                         //Disable text selection
    moveAt(userX, userY);                                                             //bug fix
      
    let label = document.createElement('div');                                        //Create value label
    label.classList.add('label');                                                     //Style it
    element.appendChild(label);                                                       //Add it to the control point
    label.textContent = getValue(element);                                            //Display correct value
    

    function moveAt(pageX, pageY) {                                                   //Move the element to a given position
      element.style.left = pageX - shiftX + 'px';                                     //Set x position
      element.style.top = pageY - shiftY + 'px';                                      //Set y position
      if (element.getBoundingClientRect().top < graph.getBoundingClientRect().top){   //Restrict movement to top of the graph
        element.style.top = graph.getBoundingClientRect().top + "px";
      }
      if (element.getBoundingClientRect().bottom > graph.getBoundingClientRect().bottom){ //Restrict movement to bottom of the graph
        element.style.top = element.getBoundingClientRect().top - (element.getBoundingClientRect().bottom - graph.getBoundingClientRect().bottom) + "px";
      }
    }
  
    function onMouseMove(event) {      
      bool_vl = false;                                                                //Disable visual instructions                                               //Drag handling function
      //userX = event.clientX || event.targetTouches[0].pageX;                        //Restrict to vertical movement
      userY = event.clientY || event.targetTouches[0].pageY;                          //Get current mouse y position
      moveAt(userX, userY);                                                           //Move element
      updateCurve();                                                                  //Update position of curve
      label.textContent = getValue(element);                                          //Update value of label
    }

    document.addEventListener('mousemove', onMouseMove);                              //Drag listener (mouse)
    document.addEventListener('touchmove', onMouseMove);                              //Drag listener (touchscreen)
    document.addEventListener('mouseup', onMouseUp);                                  //Release listener (mouse)
    document.addEventListener('touchend', onMouseUp);                                 //Release listener (touchscreen)
  
    function onMouseUp(event) {                                                       //Release handling function
      document.removeEventListener('mousemove', onMouseMove);                         //Remove drag listener (mouse)
      document.removeEventListener('mouseup',onMouseUp);                              //Remove release listener (mouse)
      document.removeEventListener('touchmove', onMouseMove);                         //Remove drag listener (touchscreen)
      document.removeEventListener('touchend',onMouseUp);                             //Remove release listener (touchscreen)
      if (Date.now() - lastTrigger > 10){                                             //Avoid double triggers (bug fix)
        parent.appendChild(element);                                                  //Add element to initial parent (useful for switching)
        lastTrigger = Date.now();                                                     //Update trigger date (bug fix)
        document.body.classList.remove('no-select');                                  //Restore text selection
        
        element.onmouseup = null;                                                     //bug fix (might be useless)        
    }
    label.remove();                                                                   //Remove label
  }
}}

function getValue(cp){
  const y = cp.getBoundingClientRect().top + cp.getBoundingClientRect().height/2;
  const ymax = graph.getBoundingClientRect().top + cp.getBoundingClientRect().height/2;
  const ymin = graph.getBoundingClientRect().top + graph.getBoundingClientRect().height - cp.getBoundingClientRect().height/2;
  return Math.round((1-(ymax-y)/(ymax - ymin))*1200);
}

/// VISUAL INSTRUCTION ///////////////////////////////////////////////////////////////////////

function getPoints_VI(){                                                  //Gets X/Y coordinates of all the control points
  cPcoords_VI = [];                                                          
  cP_VI.forEach(point => cPcoords_VI.push(getPosition(point)));
}

function initializeCurve_VI(){
  curve_VI.id = "curve";                                                  //Style curve
  curve_VI.classList.add("visualInstruction");                            //Style curve
  curve_VI.setAttribute("width", canvasW);                                //Set to canvas width for correct scaling
  curve_VI.setAttribute("height", canvasH);                               //Set to canvas height for correct scaling
  canvas.appendChild(curve_VI);                                           //Display on webpage
  updateCurve_VI();                                                       //Calculate position and draw path
}

function updateCurve_VI(){                                                //Redraw curve when moving control points
  getPoints_VI();                                                         //Calculate coordinates
  curve_VI.innerHTML = svgPath(cPcoords_VI);                              //Draw path using bezier curves
}

async function animate_VI(){                                              //Animate movement of one of the points with a sinusoid
  cP_VI[1].style.top = cP_VI[0].getBoundingClientRect().top - graph.getBoundingClientRect().top + 20*Math.cos(Date.now()/300)+'px';
  updateCurve_VI();                                                       //Redraw curve
  await delay(15);
  if (bool_vl){animate_VI();}                                             //Loop until disabled
  else{
    document.querySelectorAll(".visualInstruction").forEach(element => element.remove()); //Remove all elements
  }
}

initializeCurve_VI();
animate_VI();