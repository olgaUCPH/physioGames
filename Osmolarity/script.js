/// MAIN FUNCTIONALITIES

// - Drawing smooth curve
// - Click and Drag of Control Points
// - Verification and Scoring
// - Questions module

/// GENERAL ALL PURPOSE & TECHNICAL FUNCTIONS ///////////////////////////////////////////////////

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function removeAllEventListeners(element) {
  const newElement = element.cloneNode(true);                                 //Clone element (static, only style)
  element.parentNode.replaceChild(newElement, element);                       //Swap old element for new one
  element.remove();                                                           //Remove old element
  return newElement;                                                          //Return new element for later use
} //Remove all event listener from given element by cloning it


document.addEventListener("DOMContentLoaded", function() {
  highScore_1 = parseInt(localStorage.getItem('O_highScore_1')) || 0;      //Case 1 high-score
  highScore_2 = parseInt(localStorage.getItem('O_highScore_2')) || 0;      //Case 2 high-score
  highScore_3 = parseInt(localStorage.getItem('O_highScore_3')) || 0;      //Case 3 high-score
}); //Get stored values

/// RELEVANT HTML ELEMENTS ////////////////////////////////////////////////////////////////////

const canvas = document.getElementById("gridContainer");                    //Where the curve should be drawn
let cP = Array.from(document.querySelectorAll('.controlPoint:not(.visualInstruction)'));//Points controlled by the user to define the curve
let cP_VI = document.querySelectorAll('.controlPoint.visualInstruction');   //Points for visual instructions

let curve = document.createElementNS("http://www.w3.org/2000/svg", 'svg');  //Create curve for further modification
let curve_VI = document.createElementNS("http://www.w3.org/2000/svg", 'svg');//Create curve for visual instructions

let graph = document.querySelector('.fullGraph');

let checkButton = document.getElementById("checkButton");                   //Big check button

/// VARIABLE DEFINITIONS //////////////////////////////////////////////////////////////////////

let cPcoords = [];                                                          //Array containing coordinates of all control points
let cPcoords_VI = [];                                                       //Array containing coordinates of all control points

let bool_vl = true;                                                         //Bool indicating if visual instructions should be displayed
let lastTrigger = Date.now();                                               //Last time click & drag was triggered (bug fix)
let startAnimate = 0;                                                       //Time at which animation was started

let userValues = [];                                                       //User answers (for verification)

let caseID = 0;                                                             //User-selected case
let attempt = 0;                                                            //Attempt number

let ranges = [];                                                            //Contains all verification ranges
ranges.push([[280,300],[280,300],[1100,1200],[150,250],[100,200],[250,350],[1100,1200],[1100,1200]]); //Case 1
ranges.push([[280,300],[280,300],[550, 650], [100,200],[100,150],[50, 100],[20, 80],   [20,80]]);     //Case 2
ranges.push([[280,300],[280,300],[600, 900], [300,350],[300,320],[280,300],[600,900],  [600,900]]);   //Case 3

let unscored = [true, true, true, true, true, true, true, true];            //Have the control points been scored ?
let currentScore = 0;                                                       //Current score
let highScore = 0;                                                          //High-Score

let currentQ = 1;                                                     //ID of the currently displayed question
let maxQ = 1;                                                         //ID of the max question reached by user

let questions = [];                                                   //Array containing all questions of chosen case
let answers = [];                                                     //Array containing all possible answers of chosen case
let correctAnswers = [];                                              //Array containing ID of correct answer from each question

let userAnswers = [];                                                 //Array to be filled with the answers of the user

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
    const d = points.reduce((acc, point, i, a) => 
      i == 0 ? `M ${point[0]},${point[1]}` :                                //If first element, simply move there
      i == 1 || i == points.length - 1 ? `${acc} L ${point[0]},${point[1]}` : // If first or last segment: linear 
      `${acc} ${bezierCommand(point, i, a)}`                              //Otherwise, write the accumulated string & the next bezier control point
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
    let canvasW = canvas.getBoundingClientRect().width;                     //Canvas width, for curve scaling
    let canvasH = canvas.getBoundingClientRect().height;                    //Canvas height, for curve scaling
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
    
    showLabel(element);                                                               //Display label with correct value
    

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
      if (!element.classList.contains("scoredPoint")){
        userY = event.clientY || event.targetTouches[0].pageY;                        //Get current mouse y position
      }
      moveAt(userX, userY);                                                           //Move element
      updateCurve();                                                                  //Update position of curve
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
        if (!element.classList.contains("scoredPoint")){      
          element.children[0].remove();                                               //Remove arrow indicator (does not exist if scored)
        }
        element.onmouseup = null;                                                     //bug fix (might be useless)        
    }
  }
}}

function getValue(cp){                                                                //Get value of a control point
  const y = cp.getBoundingClientRect().top + cp.getBoundingClientRect().height/2;     //Get position of point
  //Get boundaries
  const ymax = graph.getBoundingClientRect().top + cp.getBoundingClientRect().height/2;
  const ymin = graph.getBoundingClientRect().top + graph.getBoundingClientRect().height - cp.getBoundingClientRect().height/2;
  //Compute corresponding value
  let value = Math.round((1-(ymax-y)/(ymax - ymin))*1200);
  return Math.round(value/10)*10;                                                       //Round to closest multiple of 5
}

function showLabel(cp){
  //Display label with point value, and remove it when unclicked
  let label = document.createElement('div');                                          //Create value label
  label.classList.add('label');                                                       //Style it
  cp.appendChild(label);                                                              //Add it to the control point
  label.textContent = getValue(cp);                                                   //Display correct value
  document.addEventListener('mousemove', ()=>label.textContent = getValue(cp));       //Drag listener (mouse)
  document.addEventListener('touchmove', ()=>label.textContent = getValue(cp));       //Drag listener (touchscreen)
  document.addEventListener('mouseup', ()=>label.remove());                           //Release listener (mouse)
  document.addEventListener('touchend', ()=>label.remove());                          //Release listener (touchscreen)
}

/// CASE SELECTION ///////////////////////////////////////////////////////////////////////////

function startCase(i){
  //Start the case specified by i
  document.getElementById("caseSelectionScreen").style.display = "none";              //Hide selection screen
  graph.style.display = "flex";                                                       //Show graph
  document.querySelectorAll(".case"+i).forEach(div =>div.style.display = "flex");     //Show instructions
  initializeCurve();                                                                  //Draw curve
  initializeCurve_VI();                                                               //Draw visual instructions curve
  animate_VI();                                                                       //Animate VI curve
  caseID = i;                                                                         //Record case ID
  document.getElementById("questionStart").style.display = "flex";                    //Show questions module
  checkButton.addEventListener("click", verifyGrid);                                  //Activate check button
  loadQuestions(i);                                                                   //Load questions from case i
  console.log([highScore_1, highScore_2, highScore_3]);
  highScore = [highScore_1, highScore_2, highScore_3][i-1];
  console.log(highScore);
  displayScore();
}


/// VERIFICATION /////////////////////////////////////////////////////////////////////////////

function verifyGrid(){
  attempt += 1;                                                                       //Increase attempt #
  userValues = Array.from(cP).map(getValue);                                          //Get point values
  let allGood = true;                                                                 //Boolean to check if nothing is wrong
  for (let i = 0; i < cP.length; i++){                                                //Iterate ove all points
    if(cP[i].children.length > 0){cP[i].removeChild(cP[i].children[0]);}              //If there is an indicator remaining: remove it
    const tooHigh = userValues[i] > ranges[caseID-1][i][1];                           //Bool: value is above range
    const tooLow  = userValues[i] < ranges[caseID-1][i][0];                           //Bool: value is below range
    const tH01 = i == 1 && userValues[i] > userValues[0] + 10;                        //Bool: First line is not straight (2 is above 1)
    const tL01 = i == 1 && userValues[i] < userValues[0] - 10;                        //Bool: First line is not straight (2 is below 1)
    const tH67 = i == 7 && userValues[i] > userValues[6] + 10;                        //Bool: Last line is not straight (8 is above 7)
    const tL67 = i == 7 && userValues[i] < userValues[6] - 10;                        //Bool: Last line is not straight (8 is below 7)
    const max2 = i == 2 && ((!unscored[6] && userValues[i] < userValues[6]) || (!unscored[7] && userValues[i] < userValues[7])); // Bool: Point 3 is not the max (7 or 8 have been scored already)
    const max6 = i == 6 && !unscored[2] && userValues[i] > userValues[2];             //Bool: Point 7 is above point 3 (Point 3 already scored)
    const max7 = i == 7 && !unscored[2] && userValues[i] > userValues[2];             //Bool: Point 8 is above point 3 (Point 3 already scored)
    if (tooHigh || tH01 || tH67 || max6 || max7){                                     //If current point is considered too high
      allGood = false;                                                                //Record that there was an error
      let img = document.createElement('img');                                        //Create arrow indicator
      img.src = "../assets/downArrow.png";                                            //Load down arrow
      cP[i].appendChild(img);                                                         //Attach it to control point
      img.style.top = "-4dvh";                                                        //Position it on top
      img.style.right = "-2dvh";                                                      //Position it to the right
      img.style.width = "1.5vw";                                                      //Set width
      img.style.height = "1.5vw";                                                     //Set height
      img.style.animation = "downArrow 2s ease-in-out 0s infinite";                   //Animate
    }
    else if (tooLow || tL01 || tL67 || max2){                                         //If current point is considered too low
      allGood = false;                                                                //Record that there was an error
      let img = document.createElement('img');                                        //Create arrow indicator
      img.src = "../assets/upArrow.png";                                              //Load up arrow
      cP[i].appendChild(img);                                                         //Attach it to control point
      img.style.bottom = "-4dvh";                                                     //Position it on bottom
      img.style.right = "-2dvh";                                                      //Position it to the right
      img.style.width = "1.5vw";                                                      //Set width
      img.style.height = "1.5vw";                                                     //Set height
      img.style.animation = "upArrow 2s ease-in-out 0s infinite";                     //Animate
    }
    else{                                                                             //Otherwise, point is correct
      if (unscored[i]){                                                               //If it has never been scored
        currentScore += attempt == 1 ? 10 : attempt == 2 ? 5 : 1;                     //Add score
        unscored[i] = false;                                                          //Record that it has been scored
        cP[i].classList.add("scoredPoint");                                           //Show that it has been scored
      }
      let img = document.createElement('img');                                        //Create checkmark indicator
      img.src = "assets/check.png";                                                   //Load image
      cP[i].appendChild(img);                                                         //Attach to control point
    }
  }
  displayScore();                                                                     //Display score
  if (allGood){                                                                       //If everything is correct
    transition();                                                                     //Transition into questions module
  }
}

function displayScore(){
  //Display score and update highscore if necessary
  if (currentScore > highScore){
    highScore = currentScore;                                                           //Update highscore if necessary
  }
  document.getElementById('currentScore').textContent = currentScore;                   //Display current score
  document.getElementById('highScore').textContent = highScore;                         //Display high score
  localStorage.setItem(`O_highScore_${caseID}`, highScore);
  
}


async function transition(){
  //Transition from graph control to questions module
  document.getElementById("gridContainer").style.height = "64dvh";                      //Change container heights
  document.getElementById("arsenalContainer").style.height = "28dvh";                   //Change container heights
  let initialP = Array.from(cP).map((x)=>parseFloat(x.style.top));                      //Get initial point position (animation)
  let finalP = Array.from(cP).map((x)=>64/70*parseFloat(x.style.top));                  //Get final point position (animation)
  for (let i = 0; i <= 100; i++){
    cP.forEach((point,j) => point.style.top = initialP[j] + i/100*(finalP[j] - initialP[j]) + 'px');  //Update progessively point position (animation)
    initializeCurve();                                                                  //Redraw curve
    await delay(5);                                                                     //Wait a bit
  }
  document.getElementById("questionStart").style.display = "none";                      //Hide questions placeholder
  document.getElementById("mcqWrapper").style.display = "flex";                         //Start questions module
  checkButton.removeEventListener("click", verifyGrid);                                 //Remove check button functionality
  setQuestion(currentQ);                                                                //Initialize first question
}

/// QUESTIONS /////////////////////////////////////////////////////////


function sendAnswer(n){
  //Function triggered when an answer is chosen. Records the answer, and score
  if (userAnswers.length < currentQ) {                                              //If the question has not been answered yet
    if (n == correctAnswers[userAnswers.length]) {currentScore += 10; displayScore()};//Add score if correct answer
    userAnswers.push(n);                                                            //Record answer
    maxQ = Math.min(maxQ+1,questions.length);                                       //Raise maximum question reached by one (if there is one more)
  }
  setQuestion(currentQ);                                                            //Reset question: the recorded answer will change the display
}

function setQuestion(i){
  //Sets the given question: display correct question and corresponding answers; if question was answered already, show which is correct and which was chosen
  if (i < 1 || i > maxQ ){return 0;}                                                //Impossible to set a question if the number does not exist

  document.querySelectorAll(".singleAnswer > .checkWrapper").forEach(element => element.style.display = "none");          //Hide all checkmarks tied to answers
  document.querySelectorAll(".checkWrapper > img").forEach(element => element.style.display = "none");                    //Hide all checkmarks tied to answers (bug fix)
  currentQ = i;                                                                                                           //Keep track of new question
  //If Question 1: "Previous question" button should be inactive
  if (i==1){document.getElementById("previousQ").classList.add("inactiveButton");document.getElementById("previousQ").classList.remove("activeButton");}
  else{document.getElementById("previousQ").classList.add("activeButton");document.getElementById("previousQ").classList.remove("inactiveButton");}
  //If not the last question reached: "Next question" button should be active
  if (i<maxQ){document.getElementById("nextQ").classList.add("activeButton");document.getElementById("nextQ").classList.remove("inactiveButton");}
  else{document.getElementById("nextQ").classList.add("inactiveButton");document.getElementById("nextQ").classList.remove("activeButton");}
  document.getElementById("qNumber").textContent = "Question "+currentQ;            //Update question number
  document.getElementById("qTitle").textContent = questions[currentQ-1];            //Update question text
  document.getElementById("answer1").textContent = answers[currentQ-1][0];          //Update answer text
  document.getElementById("answer2").textContent = answers[currentQ-1][1];          //Update answer text
  document.getElementById("answer3").textContent = answers[currentQ-1][2];          //Update answer text

  document.getElementById("answer1").classList.remove("selectedButton");            //Reset style
  document.getElementById("answer2").classList.remove("selectedButton");            //Reset style
  document.getElementById("answer3").classList.remove("selectedButton");            //Reset style

  if (i < maxQ || (userAnswers.length == correctAnswers.length)){                  //If the question has been answered (not max reached, or all question answered)
    document.getElementById("answer1").style.backgroundColor = correctAnswers[i-1] == 1 ? "darkgreen" : "maroon";       //Show the correct answer in green, others in red
    document.getElementById("answer2").style.backgroundColor = correctAnswers[i-1] == 2 ? "darkgreen" : "maroon";       //Show the correct answer in green, others in red
    document.getElementById("answer3").style.backgroundColor = correctAnswers[i-1] == 3 ? "darkgreen" : "maroon";       //Show the correct answer in green, others in red
    
    document.getElementById("answer1").classList.remove("activeButton");          //Disable buttons
    document.getElementById("answer2").classList.remove("activeButton");          //Disable buttons
    document.getElementById("answer3").classList.remove("activeButton");          //Disable buttons

    document.querySelectorAll(".singleAnswer > .checkWrapper").forEach(element => element.style.display = "flex");      //Display check marks

    //Display which answer was selected by the user with a white border and larger scale
    if (userAnswers[i-1] == 1){document.getElementById("answer1").classList.add("selectedButton")}
    if (userAnswers[i-1] == 2){document.getElementById("answer2").classList.add("selectedButton")}
    if (userAnswers[i-1] == 3){document.getElementById("answer3").classList.add("selectedButton")}

    //Display which answer is correct with a check mark
    if (correctAnswers[i-1] == 1){document.getElementById("a1True").style.display = "block"; document.getElementById("a2False").style.display = "block"; document.getElementById("a3False").style.display = "block"}
    if (correctAnswers[i-1] == 2){document.getElementById("a1False").style.display = "block"; document.getElementById("a2True").style.display = "block"; document.getElementById("a3False").style.display = "block"}
    if (correctAnswers[i-1] == 3){document.getElementById("a1False").style.display = "block"; document.getElementById("a2False").style.display = "block"; document.getElementById("a3True").style.display = "block"}

  }
  else{
    //If question has not been answered, set backgrounds to black and activate buttons
    document.getElementById("answer1").style.backgroundColor = "var(--pseudo-black)";     
    document.getElementById("answer2").style.backgroundColor = "var(--pseudo-black)";
    document.getElementById("answer3").style.backgroundColor = "var(--pseudo-black)";

    document.getElementById("answer1").classList.add("activeButton");
    document.getElementById("answer2").classList.add("activeButton");
    document.getElementById("answer3").classList.add("activeButton");
  }

};


function loadQuestions(i){
  switch (i){
    case 1:
      questions.push("Where in the nephron is the tubular fluid hypotonic during antidiuresis ?");
      answers.push(["The proximal tubule","The late part of TAL and early part of the distal convoluted tubule","The collecting duct"]);
      correctAnswers.push(2);
      
      questions.push("The hyperosmolarity in the medulla is due to:");
      answers.push(["Only NaCl","Only urea","Nacl and urea"]);
      correctAnswers.push(3);
      break;
    case 2:
      questions.push("Why is medullary osmolarity low during water diuresis ?");
      answers.push(["Reduced activity of the Na/K/2Cl-cotransporter","Reduced amount of urea in the inner medulla","Reduced amount of NaCl in the outer medulla"]);
      correctAnswers.push(2);
      
      questions.push("The tubular water permeability is decreased during water diuresis");
      answers.push(["In the collecting duct","In the proximal tubule","In the descending limb of the loop of Henle"]);
      correctAnswers.push(1);
      break;
      
    case 3:
      questions.push("Why is urinary osmolarity reduced after administration of Furosemide?");
      answers.push(["Reduced water permeability in the collecting duct","Reduced urea permeability in the inner medullary collecting duct","Reduced medullary osmolarity due to inhibition of the Na/K/2Cl-cotransporter"]);
      correctAnswers.push(3);
      
      questions.push("Where in the nephron is the tubular fluid hypotonic during Furosemide?");
      answers.push(["Nowhere","The late part of TAL and early part of the distal convoluted tubule","The collecting duct"]);
      correctAnswers.push(1);
      break;
  }
}

/// VISUAL INSTRUCTION ///////////////////////////////////////////////////////////////////////

function getPoints_VI(){                                                  //Gets X/Y coordinates of all the control points
  cPcoords_VI = [];                                                          
  cP_VI.forEach(point => cPcoords_VI.push(getPosition(point)));
}

function initializeCurve_VI(){
  let canvasW = canvas.getBoundingClientRect().width;                     //Canvas width, for curve scaling
  let canvasH = canvas.getBoundingClientRect().height;                    //Canvas height, for curve scaling
  curve_VI.id = "curve";                                                  //Style curve
  curve_VI.classList.add("visualInstruction");                            //Style curve
  curve_VI.setAttribute("width", canvasW);                                //Set to canvas width for correct scaling
  curve_VI.setAttribute("height", canvasH);                               //Set to canvas height for correct scaling
  canvas.appendChild(curve_VI);                                           //Display on webpage
  updateCurve_VI();                                                       //Calculate position and draw path
  startAnimate = Date.now();
}

function updateCurve_VI(){                                                //Redraw curve when moving control points
  getPoints_VI();                                                         //Calculate coordinates
  curve_VI.innerHTML = svgPath(cPcoords_VI);                              //Draw path using bezier curves
}

function animate_function(time){                                          //Animate curve: a sin wave with delay between each wave
  const elapsed = time -  startAnimate;
  const period = 2500;
  return (elapsed/period) % 3 < 2 ? 0 : Math.sin(2*3.1415*elapsed/period);
}

async function animate_VI(){                                              //Animate movement of one of the points with a sinusoid
  cP_VI[1].style.top = cP_VI[0].getBoundingClientRect().top - graph.getBoundingClientRect().top + 20*animate_function(Date.now())+'px';
  updateCurve_VI();                                                       //Redraw curve
  await delay(15);
  if (bool_vl){animate_VI();}                                             //Loop until disabled
  else{
    document.querySelectorAll(".visualInstruction").forEach(element => element.remove()); //Remove all elements
  }
}
