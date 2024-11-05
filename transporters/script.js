/// MAIN FUNCTIONALITIES

// - Click and Drag of Transporters
// - Transporter positioning : adding/removing to rectangle
// - Grid verification & Scoring

/// GENERAL ALL PURPOSE & TECHNICAL FUNCTIONS ///////////////////////////////////////////////////

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
} //For asynchronous functions

function isMobile() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return /android|ipad|iphone|ipod/i.test(userAgent);
} //Useless for now

document.addEventListener("DOMContentLoaded", function() {
  highScore1 = parseInt(localStorage.getItem('trans_highScore1')) || 0; //Table 1 HS
  highScore2 = parseInt(localStorage.getItem('trans_highScore2')) || 0; //Table 2 HS
  highScore = highScore1;
  document.getElementById('highScore').textContent = highScore; //Display HS
}); //Get stored highscore values

window.onresize = resizeAllSmallShapes;
window.onfullscreenchange = resizeAllSmallShapes;

function resizeAllSmallShapes(){
  allRectangles.forEach(rectangle => realignSmallShapes(rectangle));
} //SmallShapes in rectangles need to be resized from time to time

/// RELEVANT HTML ELEMENTS ////////////////////////////////////////////////////////////////////

const allRectangles = document.querySelectorAll('.rectangle');            //Rectangles from both tables
const allTransporters = document.querySelectorAll('.transporterImage');   //All transporters in arsenal
const checkButton = document.getElementById('checkButton');               //Big Check Button

const gameOverWindow = document.getElementById('gameOverWindow');         //Game over window
const showAnswersButton = document.getElementById('showAnswers');         //Show answer button (game over window)
const showCorrectionButton = document.getElementById('showCorrection');   //Show correction button (game over window)
const gameOverResetButton = document.getElementById('gameOverReset');     //Show reset button (game over window)
const gameOverScore = document.getElementById('gameOverScore');           //Score element in game over window (for display)
const gameOverPercent = document.getElementById('gameOverPercent');       //Performance element in game over window (for display)

const changeButton = document.getElementById('changeButton');             //Switch table button (side bar)
const resetButton = document.getElementById('resetButton');               //Reset table button (side bar)

/// VARIABLE DEFINITIONS //////////////////////////////////////////////////////////////////////

var userX = 0; // User mouse x position (when clicked)
var userY = 0; // User mouse y position (when clicked)

let lastCreation = Date.now(); //Last call to click function (to avoid double triggers)
let preventSelect = 0;         //Which rectangle to prevent selection in (bug fix)

let selectedRectangle = "none";             //Selected rectangle
let formerColor = "var(--rectangle-light)"; //Remember previous color for when rectangle is deselected

//Define the correct solution: row by row, rectangle by rectangle
//Table 1
const validationGrid1 = [];
//Na+
validationGrid1.push(['assets/yellowTriangle.png','assets/redSquare.png', 'assets/blackPill.png']);
validationGrid1.push(['assets/yellowTriangle.png','assets/redSquare.png', 'assets/whitePill.png', 'assets/blackPill.png']);
validationGrid1.push(['assets/orangeSquare.png','assets/yellowTriangle.png', 'assets/whitePill.png']);
validationGrid1.push(['assets/purpleSquare.png']);
validationGrid1.push(['assets/redCircle.png']);
//Cl-
validationGrid1.push(['assets/whitePill.png', 'assets/blackPill.png']);
validationGrid1.push(['assets/orangeTriangle.png','assets/grayPill.png', 'assets/blackPill.png']);
validationGrid1.push(['assets/orangeSquare.png']);
validationGrid1.push(['assets/purpleSquare.png']);
validationGrid1.push(['assets/whitePill.png']);
//K+
validationGrid1.push(['assets/blackPill.png']);
validationGrid1.push(['assets/whitePill.png', 'assets/blackPill.png']);
validationGrid1.push(['assets/orangeSquare.png','assets/whitePill.png','assets/blueCircle.png']);
validationGrid1.push([]);
validationGrid1.push(['assets/yellowDiamond.png','assets/blueCircle.png']);

//Table 2
const validationGrid2 = [];
//H+
validationGrid2.push(['assets/blueTriangle.png','assets/blueDiamond.png']);
validationGrid2.push(['assets/blueTriangle.png','assets/blueDiamond.png']);
validationGrid2.push(['assets/blueTriangle.png']);
validationGrid2.push([]);
validationGrid2.push(['assets/blueDiamond.png','assets/cyanDiamond.png','assets/greenDiamond.png']);
//HCO3-
validationGrid2.push(['assets/greenSquare.png']);
validationGrid2.push(['assets/greenSquare.png', 'assets/cyanTriangle.png']);
validationGrid2.push(['assets/greenSquare.png']);
validationGrid2.push([]);
validationGrid2.push(['assets/cyanTriangle.png','assets/greenTriangle.png']);

let attempt = 0;                                                      //Attempt number (for scoring)
let currentScore = 0;                                                 //Current score
let highScore = 0;                                                    //High score

const idOrder1 = [[0],[1,5],[2,6,10],[3,7,11],[4,8,12],[9,13],[14]];  //For nice propagation of color effect when checking
const idOrder2 = [[0],[1,5],[2,6],[3,7],[4,8],[9]];
let idOrder = idOrder1; 

let currentTable = 1;                                                 //Current table ID (1 or 2)
let validationGrid = validationGrid1;                                 //Validation grid to be used
gridRectangles = Array.from(allRectangles).slice(0,15);               //Rectangles to be used
let currentScore1 = 0;                                                //Score in table 1 (switching tables does not reset the table)
let currentScore2 = 0;                                                //Score in table 2
let highScore1 = 0;                                                   //Highscore in table 1
let highScore2 = 0;                                                   //Highscore in table 2
let attempt1 = 0;                                                     //Attempt number in table 1
let attempt2 = 0;                                                     //Attempt number in table 2
let maxScore = 150;                                                   //Maximum attainable score (table 1 by default)

let bool_instruction = true;                                          //Display visual instruction boolean

/// EVENT LISTENERS //////////////////////////////////////////////////////////////////////////

allTransporters.forEach(transporter => {
  transporter.onmousedown = dragFunction(transporter);                  //Mouse clicks
  transporter.ontouchstart = dragFunction(transporter);                 //Touchscreen
  transporter.addEventListener('touchstart', dragFunction(transporter));//Touchscreen (for some reason one works for tactile PCs, the other for tablets)
  transporter.ondragstart = function() {return false;};                 //Disable undesirable native click and drag of images
}) //Add a drag function to each transporter

allRectangles.forEach(rectangle => {
  rectangle.addEventListener("click", function () {selectRectangle(rectangle)}); //Click listener for rectangle selection
}); //Rectangle selection

checkButton.addEventListener('click',verifyGrid);                       //Check button = verification

//End window button functions
showAnswersButton.onclick = hideGameOverWindow;                     
showCorrectionButton.onclick = showCorrection;
gameOverResetButton.onclick = function(){hideGameOverWindow(); resetGrid()};

//Side bar button functions
resetButton.addEventListener('click', resetGrid);
changeButton.addEventListener('click', switchTables);

/// CLICK AND DRAG FUNCTIONALITY //////////////////////////////////////////////////////////////

function dragFunction(element){ //Creates a click and drag function for the given element
    return function(event){
      if (element.parentNode.classList.contains('correctRectangle')){return 0;} //If transporter in correct rectangle, cannot be dragged
      userX = event.clientX || event.targetTouches[0].pageX;                    //x position of mouse
      userY = event.clientY || event.targetTouches[0].pageY;                    //y position of mouse
      let shiftX = userX - element.getBoundingClientRect().left;                //x position of mouse relative to transporter
      let shiftY = userY - element.getBoundingClientRect().top;                 //y position of mouse relative to transporter
      let parent = element.parentNode;                                          //transporter parent element (rectangle or arsenal ?)
      if (!(element.classList.contains('smallShape'))){                         //If element is not a small shape, ie is from arsenal and needs to be replaced
        const newElement = element.cloneNode(true);                             //Create a copy
        element.parentNode.appendChild(newElement);                             //Add copy to arsenal
        newElement.onmousedown = dragFunction(newElement);                      //Add drag function (Mouse)
        newElement.style.animation = "fadeIn 0.5s forwards";                    //Fade In animation
        newElement.addEventListener('touchstart', dragFunction(newElement));    //Add drag function (Touchscreen)
        newElement.ondragstart = function() {return false;};                    //Disable native drag
      }

      document.addEventListener('mousemove', onMouseMove);                      //Event listener: moving mouse (mouse)
      document.addEventListener('touchmove', onMouseMove);                      //Event listener: moving mouse (touchscreen)
      document.addEventListener('mouseup', onMouseUp);                          //Event listener: releasing mouse (mouse)
      document.addEventListener('touchend', onMouseUp);                         //Event listener: releasing mouse (touchscreen)

      element.style.pointerEvents = "none";                                     //Disable click-through (useful for smallShapes on rectangles)
      element.style.position = "fixed";                                         //Positioning relative to the page, not to the parent
      element.style.zIndex = 1000;                                              //Get in front of everything
      moveAt(userX, userY);                                                     //Move to current position (bug fix)
      const startTime = Date.now();                                             //Get current time: useful to avoid double triggering (bug fix)
      element.style.transitionDuration = "0s";                                  //Remove transitions for smooth motion
  
    function moveAt(pageX, pageY) {                                             //MOVEMENT FUNCTION: For a given mouse position, move the transporter to that position
      element.style.transitionDuration = "0s";                                  //Smooth motion (bug fix)
      element.style.left = pageX - shiftX + 'px';                               //x positioning, using mouse position and initial relative position to transporter
      element.style.top = pageY - shiftY + 'px';                                //y positioning, using mouse position and initial relative position to transporter
    }
  
    function onMouseMove(event) {                                               //MOVEMENT CODING: When 'event' happens from listener, get mouse position and move transporter
      userX = event.clientX || event.targetTouches[0].pageX;                    //Get mouse x position
      userY = event.clientY || event.targetTouches[0].pageY;                    //Get mouse y position
      moveAt(userX, userY);                                                     //Move to position
    }
  
    async function onMouseUp(event) {                                           //MOUSE RELEASE FUNCTION: What happens when you drop the transporter
      document.removeEventListener('mousemove', onMouseMove);                   //Remove drag listener (mouse)
      document.removeEventListener('mouseup',onMouseUp);                        //Remove drop listener (mouse)
      document.removeEventListener('touchmove', onMouseMove);                   //Remove drag listener (touchscreen)
      document.removeEventListener('touchend',onMouseUp);                       //Remove drop listener (touchscreen)
      if (Date.now() - startTime < 150){                                        //Click handling (rapid drop after starting drag)
        if (element.classList.contains('smallShape')){                          //If it's a smallShape (in rectangle), remove it
          if (!parent.classList.contains('correctRectangle')){                  //Verify that it isn't in a correct rectangle (bug fix)
            preventSelect = parent;                                             //bug fix
            element.style.animation = 'fadeOut 0.5s ease-in-out forwards';      //Fade out animation
            element.addEventListener('animationend', () => {                    //Wait for end of animation
              element.remove();                                                 //Remove element
              realignSmallShapes(parent);                                       //Realign everything in rectangle
          }); 
        await delay(501);                                                       //bug fix
        realignSmallShapes(parent);                                             //bug fix
        preventSelect = 0;                                                      //bug fix
        }
        }
        else{
          clickShape(element);                                                  //Click handling function on arsenal transporter (send to selected rectangle)
        }
      }
      else{
        gridRectangles.forEach(rectangle => {                                   //Loop over table rectangles to check for collision
          const rect = rectangle.getBoundingClientRect();                       //Get hitbox
          if (userX >= rect.left && userX <= rect.right && userY >= rect.top && userY <= rect.bottom) { // Check collision
            if (appendableTransporter(rectangle, element) || rectangle == parent) { // Check if transporter can be added (< 4 transporters & transporter not already in rectangle)
              createSmallShape(rectangle, element, "slide");                    //Add smallshape to rectangle using slide animation
            }
          }
        });
      }
    realignSmallShapes(parent);                                                 //Realign everything from parent (bug fix)
    element.remove();                                                           //Removed dragged element (was cloned since)
    realignSmallShapes(parent);                                                 //bug fix  
    };
    }
  }

/// ADDING TRANSPORTERS TO RECTANGLES //////////////////////////////////////////////////////////////

function appendableTransporter(container, element){                             //Can a transporter be added to a given rectangle ? (Unblocked and less than 4 transporters)
    const elementImage = element.src;                                           //Get image url
    const smallShapes = container.querySelectorAll('.smallShape');              //Get all smallshapes already in rectangle
    let bool = container.querySelectorAll('.smallShape').length < 4 && !container.classList.contains('correctRectangle');
    smallShapes.forEach(shape => {bool = bool && shape.src != elementImage});   //Verify that no smallshape has the same image
    return bool;
}

async function createSmallShape(container, element, animation) {                //Remove a given transporter from a rectangle
  bool_instruction = false;                                                     //Disable visual instruction 
  lastCreation = Date.now();                                                    //Last time a small shape has been created (bug fix)
  const smallShape = document.createElement('img');                             //Create element
  smallShape.src = element.src;                                                 //Choose correct image
  smallShape.classList.add('smallShape');                                       //Apply Style
  container.appendChild(smallShape);                                            //Position in correct rectangle
  smallShape.style.transitionDuration = "0s";                                   //Immediate change of shape
  if(animation=="fade"){                                                     //Useless now ? Only for showing correct grid
    let eP = endPosition(smallShape,container);                                 //Compute where the small shape should go & its size
    smallShape.style.width = '100px';                                           //Initial size (bug fix)
    smallShape.style.height = '100px';                                          //Initial size (bug fix)
    smallShape.style.left = eP[0]+'px';                                         //End position
    smallShape.style.top = eP[1]+'px';                                          //End position
    smallShape.style.width = eP[2]*parseFloat(smallShape.style.height)+'px';    //End size
    smallShape.style.height = eP[2]*parseFloat(smallShape.style.height)+'px';   //End size
    smallShape.style.animation = 'fadeIn 0.5s ease-in-out forwards';}           //Animation
  if(animation=="slide"){                                                    //Most cases: slides from where it is dropped to final position   
    smallShape.style.transitionDuration = "0s";                                 //Bug fix
    smallShape.style.position = "fixed";                                        //Position relative to window
    smallShape.style.left = element.getBoundingClientRect().left+'px';          //Initial position (window)
    smallShape.style.top = element.getBoundingClientRect().top+'px';            //Initial position (window)
    smallShape.style.width = element.getBoundingClientRect().width+'px';        //Initial size (bug fix)
    smallShape.style.height = element.getBoundingClientRect().height+'px';      //Initial size (bug fix)
    smallShape.style.transformOrigin = 'top left';                              //For easier positioning
    smallShape.style.transitionDuration = "0.3s";                               //Smooth change of size
    let eP = endPosition(smallShape,container);                                 //Compute end position
    smallShape.style.left = eP[0]+'px';                                         //End position
    smallShape.style.top = eP[1]+'px';                                          //End position
    smallShape.style.transform = `scale(${eP[2]})`;                             //End size
    smallShape.style.filter = `drop-shadow(${1+container.children.length}px ${1+container.children.length}px ${1+container.children.length}px black)`; //Relative Shadow

  }
  realignSmallShapes(container);                                                //Make sure every shape in rectangle has correct size
  smallShape.addEventListener('animationend', () => {
    realignSmallShapes(container);                                              //Bug fix
    smallShape.style.transitionDuration = "0s";                                 //Bug fix
  });
  smallShape.style.transitionDuration = "0s";                                   //Bug fix
  await delay(100);
  smallShape.onmousedown = dragFunction(smallShape);                            //Make new smallshape draggable (mouse)
  smallShape.ontouchstart = dragFunction(smallShape);                           //Make new smallshape draggable (touchscreen)
  smallShape.addEventListener('touchstart', dragFunction(smallShape));          //Make new smallshape draggable (touchscreen) (bug fix)
  smallShape.ondragstart = function() {return false;};                          //Disable native drag
  ;
} //Add a given transporter to a rectangle
  
function removeShape(container, smallShape){
  if (!container.classList.contains('correctRectangle')){                       //Check if it's not in a correct rectangle
    smallShape.style.animation = 'fadeOut 0.5s ease-in-out forwards';           //Animation
    smallShape.addEventListener('animationend', () => {
      smallShape.remove();                                                      //Remove shape at the end of the animation
      realignSmallShapes(container);                                            //Align other smallshapes
  }); }
} 
  
function realignSmallShapes(container) {
    const smallShapes = container.querySelectorAll('.smallShape');              //Select all smallshapes in rectangle
    smallShapes.forEach(smallShape => {                                         //For each smallshape, calculate end position/size and reposition
      smallShape.style.transitionDuration = "0.3s";                             //Smooth positioning
      let eP = endPosition(smallShape,container);                               //Compute end position
      smallShape.style.left = eP[0]+'px';                                       //Move to end position (x)
      smallShape.style.top = eP[1]+'px';                                        //Move to end position (y)
      smallShape.style.transformOrigin = 'top left';                            //Bug fix
      smallShape.style.transform = `scale(${eP[2]})`;                           //Scale to end size
      smallShape.style.filter = `drop-shadow(${1+container.children.length}px ${1+container.children.length}px ${1+container.children.length}px black)`;
      });
} // Realign transporters in a rectangle
  
function endPosition(element, rectangle){
  const n = rectangle.children.length;                                          //Total number of small shapes in rectangle
  const i = Array.prototype.indexOf.call(rectangle.children, element);          //ID of given element among small shapes (to position relative to others)
  const w = rectangle.clientWidth + 2*parseFloat(window.getComputedStyle(rectangle).borderLeftWidth); //Rectangle width
  const h = rectangle.clientHeight+ 2*parseFloat(window.getComputedStyle(rectangle).borderTopWidth);  //Rectangle height
  const size = (n == 1) ? 0.8*h : (n == 2) ? Math.min(0.6*h,0.4*w) : 0.4*Math.min(h,w);               //End size
  let x = 0;                                                                    //Initialize x position
  let y = 0;                                                                    //Initialize y position
  if (n == 1){                                                              // If 1 small shape
    x = rectangle.getBoundingClientRect().left + w/2 - size/2;                  //Place at center horizontally
    y = rectangle.getBoundingClientRect().top + h/2 - size/2;                   //Place at center vertically
  }
  if (n == 2){                                                              // If two small shapes
    x = rectangle.getBoundingClientRect().left + 0.3*w + i*0.4*w - size/2;      //Place elements at 30% and 70% horizontally
    y = rectangle.getBoundingClientRect().top + h/2 - size/2;                   //Place at center vertically
  }
  if (n == 3){                                                              // If three small shapes
    x = i == 2 ? rectangle.getBoundingClientRect().left + w/2 - size/2 : rectangle.getBoundingClientRect().left + 0.3*w + i*0.4*w - size/2; //First two at 30% and 70% horizontal; third in the middle
    y = rectangle.getBoundingClientRect().top + 0.3*h + Math.floor(i/2)*0.4*h - size/2;                                                     //First two at 30% vertical; third at 70% vertical
  }
  if (n == 4){                                                              // If four small shapes
    x = rectangle.getBoundingClientRect().left + 0.3*w + i%2*0.4*w - size/2;            // 30/70% horizontal
    y = rectangle.getBoundingClientRect().top + 0.3*h + Math.floor(i/2)*0.4*h - size/2; // 30/70% vertical  
  }
  let scale = size/parseFloat(element.style.height);
  return [x,y,scale];
} // Compute end position of a given small shape in a rectangle, based on the number of rectangles already present

//Rectangle selection & clicking shapes

function clickShape(element){
  let elementImage = element.src;         //Get image
  if (selectedRectangle != "none"){       //If a rectangle is selected, add a smallshape if possible; else, remove clicked smallshape from rectangle
    if (appendableTransporter(selectedRectangle, element)) { 
        createSmallShape(selectedRectangle, element, "slide");
    }
    else{
      if (Date.now() - lastCreation > 500){
        selectedRectangle.querySelectorAll(`.smallShape`).forEach(x => {if (x.src == elementImage){removeShape(selectedRectangle,x);}});
        realignSmallShapes(selectedRectangle);
      }
    }
  }
} //Handle transporter clicking (when a rectangle is selected)


function selectRectangle(rectangle){
  if (!rectangle.classList.contains('correctRectangle') && rectangle != preventSelect){           //Rectangle can be selected
    if (rectangle == selectedRectangle) {                                                         //If it was already selected, unselect it
      selectedRectangle.style.backgroundColor = formerColor;
      selectedRectangle = "none";
    }
    else {
      if (selectedRectangle != "none") {selectedRectangle.style.backgroundColor = formerColor;};  //If another rectangle was selected, unselect it
      selectedRectangle = rectangle;                                                              //Select new rectangle
      formerColor = selectedRectangle.style.backgroundColor;                                      
      selectedRectangle.style.backgroundColor = "var(--rectangle-deep)";
    }
  }
} //Select a rectangle

/// VERIFICATION & SCORING///////////////////////////////////////////////////////////////////////////////////


async function verifyGrid() {
  checkButton.removeEventListener('click',verifyGrid);                      //Disable double-click
  attempt += 1;                                                             //Add attempt
  selectedRectangle = "none";                                               //Disable selected rectangle
  if (attempt > 2){ 
    resetGrid();                                                            //If last attempt, reset grid
  }
  else{
    for (const ids of idOrder) {                                            //In order of nice propagation effect
      for (const i of ids){
        rectangle = gridRectangles[i];                                      //Select current rectangle
        if (checkRectangle(i)){                                             //If all transporters are correct
          if (!rectangle.classList.contains('correctRectangle')){currentScore += 5*(3-attempt);} //Add Score
          rectangle.style.borderColor = "darkGreen";                        //Visual change
          rectangle.style.backgroundColor = "darkGreen";
          rectangle.classList.add('correctRectangle');                      //Disable further modification of rectangle
        }
        else{
          rectangle.style.borderColor = attempt == 1 ? "goldenRod": "maroon";     //First attempt: wrong = yellow; Second: wrong = red
          rectangle.style.backgroundColor = attempt == 1 ? "khaki": "lightPink";  //Same thing
        }
      }
      await delay(200);
      document.getElementById('currentScore').textContent = currentScore;   //Display Score
    };
    checkButton.addEventListener('click',verifyGrid);                       //Re-enable verification
    if (currentScore == maxScore){attempt += 1};                            //If everything is correct on first attempt, skip second attempt
    if (attempt == 2){
      highScore = currentScore > highScore ? currentScore : highScore;      //Update highscore if necessary
      document.getElementById('highScore').textContent = highScore;         //Display highscore
      currentTable == 1 ? localStorage.setItem('trans_highScore1', highScore):localStorage.setItem('trans_highScore2', highScore); //Save highscore
      gameOver();                                                           //Display game over window
    }
  }
} //Check if the grid is correct

function checkRectangle(i){
  const smallShapes = gridRectangles[i].querySelectorAll('.smallShape');                        //Get all transporters
  let userAnswer = [];
  smallShapes.forEach(shape => {userAnswer.push("assets/"+shape.src.split(/(\\|\/)/g).pop())}); //Create answer string (for easy comparison)
  return userAnswer.sort().join(',') === validationGrid[i].sort().join(',');                    //Compare to correct answer
} //Check if a single rectangle is correct


/// GAME OVER ////////////////////////////////////////////////////////////////////////////////

function gameOver(){
  checkButton.removeEventListener('click',verifyGrid);                  //Disable verification
  gameOverScore.textContent = currentScore;                             //Display score in game over window
  gameOverPercent.textContent = Math.round(currentScore/maxScore*100);  //Display performance in game over window
  gameOverWindow.style.animation = 'fadeIn 0.5s ease-in-out forwards';  //Window animation
  gameOverWindow.style.display = 'block';                               //Display window
  resetButton.removeEventListener('click', resetGrid);                  //Disable sidebar button functions
  changeButton.removeEventListener('click', switchTables);              //Disable sidebar button functions
} //Game over window functionality

function hideGameOverWindow(){
  checkButton.addEventListener('click',verifyGrid);                     //Return function to buttons
  resetButton.addEventListener('click', resetGrid);
  changeButton.addEventListener('click', switchTables);
  gameOverWindow.style.animation = 'fadeOut 0.5s ease-in-out forwards';
} //Dismiss game over window

function showCorrection(){
  hideGameOverWindow();
  resetGrid();
  attempt = 2;
  gridRectangles.forEach((rectangle,i) => {
    validationGrid[i].forEach(source => createSmallShape(rectangle,{src: source},"fade"));
    rectangle.style.borderColor = 'darkGreen';
    rectangle.style.backgroundColor = 'darkGreen';
    rectangle.classList.add('correctRectangle');
  })
} //Display correction in rectangles

function resetGrid() {
  gridRectangles.forEach(rectangle => {
    rectangle.innerHTML = ''; 
    rectangle.style = '';
    selectedRectangle = 'none';
    rectangle.classList.remove('correctRectangle');
  });
  attempt = 0;
  currentScore = 0;
  document.getElementById('currentScore').textContent = currentScore;
  checkButton.addEventListener('click',verifyGrid);
} //Remove all transporters from grid; reset attempts

/// SIDE BAR ///////////////////////////////////////////////////////////////////////////

function switchTables(){
  bool_instruction = false;                     //Disable visual instructions

  //Switch everything

  if (currentTable == 1){
    document.querySelectorAll(".tableOne").forEach(element => {element.style.display = "none"}); //Hide table 1
    document.querySelectorAll(".tableTwo").forEach(element => {element.style.display = "flex"}); //Show table 2
    gridRectangles = Array.from(allRectangles).slice(15,25);
    validationGrid = validationGrid2;
    attempt1 = attempt;
    attempt = attempt2;
    currentScore1 = currentScore;
    currentScore = currentScore2;
    highScore1 = highScore;
    highScore = highScore2;
    maxScore = 100;
    document.getElementById('currentScore').textContent = currentScore;
    document.getElementById('highScore').textContent = highScore;
    idOrder = idOrder2;
    currentTable = 2;
  }
  else{
    document.querySelectorAll(".tableOne").forEach(element => {element.style.display = "flex"}); //Show table 1
    document.querySelectorAll(".tableTwo").forEach(element => {element.style.display = "none"}); //Hide table 2
    gridRectangles = Array.from(allRectangles).slice(0,15);
    validationGrid = validationGrid1;
    attempt2 = attempt;
    attempt = attempt1;
    currentScore2 = currentScore;
    currentScore = currentScore1;
    highScore2 = highScore;
    highScore = highScore1;
    maxScore = 150;
    document.getElementById('currentScore').textContent = currentScore;
    document.getElementById('highScore').textContent = highScore;
    idOrder = idOrder1;
    currentTable = 1;
  }
  
} //Switch between tables 1 and 2

/// VISUAL INSTRUCTIONS /////////////////////////////////////////////////

//Create elements for visual instructions
const cursor = document.createElement('img');                                 //Mouse cursor
cursor.src = "../.assets/cursor_click.png";                                    //Add image
const shape = document.createElement('img');                                  //Transparent shape
shape.src = "assets/yellowTriangle.png";                                      //Add image
shape.style.width = allTransporters[0].getBoundingClientRect().width+'px';    //Set image size
shape.style.height = allTransporters[0].getBoundingClientRect().height+'px';  //Set image size
cursor.style.width = "20px";                                                  //Set cursor size
cursor.style.height = "";                                                     //Set cursor size
cursor.classList.add('visualInstruction');                                    //Assign to visual instruction class
shape.classList.add('visualInstruction');                                     //Assign to visual instruction class

//Define movement of cursor
let cursor_position = [[0.5*allTransporters[0].getBoundingClientRect().left+'px', allTransporters[0].getBoundingClientRect().top+'px']];
cursor_position.push([allTransporters[0].getBoundingClientRect().left+0.5*allTransporters[0].getBoundingClientRect().width+'px', allTransporters[0].getBoundingClientRect().top+0.5*allTransporters[0].getBoundingClientRect().height+'px']);
cursor_position.push([allRectangles[0].getBoundingClientRect().left+0.5*allRectangles[0].getBoundingClientRect().width+'px', allRectangles[0].getBoundingClientRect().top+0.5*allRectangles[0].getBoundingClientRect().height+'px'])

//Define movement of shape
let shape_position = [[allTransporters[0].getBoundingClientRect().left+'px', allTransporters[0].getBoundingClientRect().top+'px']];
shape_position.push(shape_position[0]);
shape_position.push([parseFloat(cursor_position[2][0]) + parseFloat(shape_position[1][0]) - parseFloat(cursor_position[1][0])+'px',parseFloat(cursor_position[2][1]) + parseFloat(shape_position[1][1]) - parseFloat(cursor_position[1][1])+'px']);

//Set position of given element
function setPosition(element, pos){
  element.style.left = pos[0];
  element.style.top = pos[1];
}

let count = 0;                              //Track position
setPosition(cursor, cursor_position[0]);
setPosition(shape, shape_position[0]);

document.body.appendChild(cursor);          //Add element to webpage
document.body.appendChild(shape);           //Add element to webpage

async function instructions(){
  await delay(2000);
  count = (count+1)%3;
  cursor.style.display = 'block';
  shape.style.display = "block";
  setPosition(cursor, cursor_position[count]);
  setPosition(shape, shape_position[count]);
  if (count == 0){
    cursor.style.display = 'none';
    shape.style.display = 'none';
  }
  if (count == 2){
    await delay(1000);
  }
  if (bool_instruction) {instructions();}
  else{cursor.style.display = "none";shape.style.display = "none";}
} //Loop visual instructions animation while bool_instruction is true

instructions();