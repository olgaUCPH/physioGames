const allRectangles = document.querySelectorAll('.rectangle');
const allTransporters = document.querySelectorAll('.transporterImage');
const checkButton = document.getElementById('checkButton');

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
} //For asynchronous functions

function isMobile() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return /android|ipad|iphone|ipod/i.test(userAgent);
} //Useless for now

document.addEventListener("DOMContentLoaded", function() {
  highScore1 = parseInt(localStorage.getItem('trans_highScore1')) || 0;
  highScore2 = parseInt(localStorage.getItem('trans_highScore2')) || 0;
  highScore = highScore1;
  document.getElementById('highScore').textContent = highScore;
}); //Get stored values

window.onresize = resizeAllSmallShapes;
window.onfullscreenchange = resizeAllSmallShapes;

function resizeAllSmallShapes(){
  allRectangles.forEach(rectangle => realignSmallShapes(rectangle));
} //SmallShapes in rectangles need to be resized

/// CLICK AND DRAG ////////////////////////////////////////////////////////////////////////////

var userX = 0;
var userY = 0;

let lastCreation = Date.now();
let preventSelect = 0;

allTransporters.forEach(transporter => {
    transporter.onmousedown = dragFunction(transporter);
    transporter.ontouchstart = dragFunction(transporter);
    transporter.addEventListener('touchstart', dragFunction(transporter));
    transporter.ondragstart = function() {return false;};
}) //Add a drag function to each transporter

function dragFunction(element){
    return function(event){
      if (element.parentNode.classList.contains('correctRectangle')){return 0;}
      userX = event.clientX || event.targetTouches[0].pageX;
      userY = event.clientY || event.targetTouches[0].pageY;
      let shiftX = userX - element.getBoundingClientRect().left;
      let shiftY = userY - element.getBoundingClientRect().top;
      let parent = element.parentNode;
      if (!(element.classList.contains('smallShape'))){
        const newElement = element.cloneNode(true);
        element.parentNode.appendChild(newElement);
        newElement.onmousedown = dragFunction(newElement);
        newElement.style.animation = "fadeIn 0.5s forwards";
        newElement.addEventListener('touchstart', dragFunction(newElement));
        newElement.ondragstart = function() {return false;};
      }

      element.style.pointerEvents = "none";
      element.style.position = "fixed";
      element.style.zIndex = 1000;
      moveAt(userX, userY);
      const startTime = Date.now();
      element.style.transitionDuration = "0s";
  
    function moveAt(pageX, pageY) {
      element.style.transitionDuration = "0s";
      element.style.left = pageX - shiftX + 'px';
      element.style.top = pageY - shiftY + 'px';
    }
  
    function onMouseMove(event) {
      userX = event.clientX || event.targetTouches[0].pageX;
      userY = event.clientY || event.targetTouches[0].pageY;
      moveAt(userX, userY);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('touchmove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchend', onMouseUp);
  
    async function onMouseUp(event) {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup',onMouseUp);
      document.removeEventListener('touchmove', onMouseMove);
      document.removeEventListener('touchend',onMouseUp);
      if (Date.now() - startTime < 150){
        if (element.classList.contains('smallShape')){
          if (!parent.classList.contains('correctRectangle')){
            preventSelect = parent;
            element.style.animation = 'fadeOut 0.5s ease-in-out forwards';
            element.addEventListener('animationend', () => {
              element.remove();
              realignSmallShapes(parent);
          }); 
        await delay(501);
        realignSmallShapes(parent);
        preventSelect = 0;
        }
        }
        else{
          clickShape(element);
        }
      }
      else{
        gridRectangles.forEach(rectangle => {
          const rect = rectangle.getBoundingClientRect();
          if (userX >= rect.left && userX <= rect.right && userY >= rect.top && userY <= rect.bottom) {
            if (appendableTransporter(rectangle, element) || rectangle == parent) { 
              createSmallShape(rectangle, element, "slide");
            }
          }
        });
      }
    realignSmallShapes(parent);
    element.remove();
    realignSmallShapes(parent);
    };
    }
  }

/// ADDING TRANSPORTERS TO RECTANGLES //////////////////////////////////////////////////////////////

allRectangles.forEach(rectangle => {
    rectangle.addEventListener("click", function () {selectRectangle(rectangle)});
  }); //Rectangle selection

function appendableTransporter(container, element){
    const elementImage = element.src;
    const smallShapes = container.querySelectorAll('.smallShape');
    let bool = container.querySelectorAll('.smallShape').length < 4 && !container.classList.contains('correctRectangle');
    smallShapes.forEach(shape => {bool = bool && shape.src != elementImage});
    return bool;
} //Can a transporter be added to a given rectangle ? (Unblocked and less than 6 transporters)

async function createSmallShape(container, element, animation) {
  bool_instruction = false;
    lastCreation = Date.now();
    const smallShape = document.createElement('img');
    smallShape.src = element.src;
    smallShape.classList.add('smallShape');
    container.appendChild(smallShape);
    smallShape.style.transitionDuration = "0s";
    if(animation=="fade"){
      let eP = endPosition(smallShape,container);
      smallShape.style.width = '100px';
      smallShape.style.height = '100px';
      smallShape.style.left = eP[0]+'px';
      smallShape.style.top = eP[1]+'px';
      smallShape.style.width = eP[2]*parseFloat(smallShape.style.height)+'px';
      smallShape.style.height = eP[2]*parseFloat(smallShape.style.height)+'px';
      smallShape.style.animation = 'fadeIn 0.5s ease-in-out forwards';}
    if(animation=="slide"){
      smallShape.style.transitionDuration = "0s";
      smallShape.style.position = "fixed";
      smallShape.style.left = element.getBoundingClientRect().left+'px';
      smallShape.style.top = element.getBoundingClientRect().top+'px';
      smallShape.style.width = element.getBoundingClientRect().width+'px';
      smallShape.style.height = element.getBoundingClientRect().height+'px';
      smallShape.style.transformOrigin = 'top left';
      smallShape.style.transitionDuration = "0.3s";
      let eP = endPosition(smallShape,container);
      smallShape.style.left = eP[0]+'px';
      smallShape.style.top = eP[1]+'px';
      smallShape.style.transform = `scale(${eP[2]})`;
      smallShape.style.filter = `drop-shadow(${1+container.children.length}px ${1+container.children.length}px ${1+container.children.length}px black)`;

    }
    realignSmallShapes(container);
    smallShape.addEventListener('animationend', () => {
      realignSmallShapes(container);
      smallShape.style.transitionDuration = "0s";
    });
    smallShape.style.transitionDuration = "0s";
    await delay(100);
    smallShape.onmousedown = dragFunction(smallShape);
    smallShape.ontouchstart = dragFunction(smallShape);
    smallShape.addEventListener('touchstart', dragFunction(smallShape));
    smallShape.ondragstart = function() {return false;};
    ;
} //Add a given transporter to a rectangle
  
function removeShape(container, smallShape){
  if (!container.classList.contains('correctRectangle')){
    smallShape.style.animation = 'fadeOut 0.5s ease-in-out forwards';
    smallShape.addEventListener('animationend', () => {
      smallShape.remove();
      realignSmallShapes(container);
  }); }
} //Remove a given transporter from a rectangle
  
function realignSmallShapes(container) {
    const smallShapes = container.querySelectorAll('.smallShape');
    smallShapes.forEach(smallShape => {
      smallShape.style.transitionDuration = "0.3s";
      let eP = endPosition(smallShape,container);
      smallShape.style.left = eP[0]+'px';
      smallShape.style.top = eP[1]+'px';
      smallShape.style.transformOrigin = 'top left';
      smallShape.style.transform = `scale(${eP[2]})`;
      smallShape.style.filter = `drop-shadow(${1+container.children.length}px ${1+container.children.length}px ${1+container.children.length}px black)`;
      });
} // Realign transporters in a rectangle
  
function endPosition(element, rectangle){
  const n = rectangle.children.length;
  const i = Array.prototype.indexOf.call(rectangle.children, element);
  const w = rectangle.clientWidth + 2*parseFloat(window.getComputedStyle(rectangle).borderLeftWidth);
  const h = rectangle.clientHeight+ 2*parseFloat(window.getComputedStyle(rectangle).borderTopWidth);
  const size = (n == 1) ? 0.8*h : (n == 2) ? Math.min(0.6*h,0.4*w) : 0.4*Math.min(h,w);
  let x = 0;
  let y = 0;
  if (n == 1){
    x = rectangle.getBoundingClientRect().left + w/2 - size/2;
    y = rectangle.getBoundingClientRect().top + h/2 - size/2;
  }
  if (n == 2){
    x = rectangle.getBoundingClientRect().left + 0.3*w + i*0.4*w - size/2;
    y = rectangle.getBoundingClientRect().top + h/2 - size/2; 
  }
  if (n == 3){
    x = i == 2 ? rectangle.getBoundingClientRect().left + w/2 - size/2 : rectangle.getBoundingClientRect().left + 0.3*w + i*0.4*w - size/2;
    y = rectangle.getBoundingClientRect().top + 0.3*h + Math.floor(i/2)*0.4*h - size/2; 
  }
  if (n == 4){
    x = rectangle.getBoundingClientRect().left + 0.3*w + i%2*0.4*w - size/2;
    y = rectangle.getBoundingClientRect().top + 0.3*h + Math.floor(i/2)*0.4*h - size/2; 
  }
  let scale = size/parseFloat(element.style.height);
  return [x,y,scale];
}


let selectedRectangle = "none";

let counter = 1;

function clickShape(element){
  let elementImage = element.src;
  if (selectedRectangle != "none"){
    counter += 1;
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

let formerColor = "var(--rectangle-light)";

function selectRectangle(rectangle){
  if (!rectangle.classList.contains('correctRectangle') && rectangle != preventSelect){
    if (rectangle == selectedRectangle) {
      selectedRectangle.style.backgroundColor = formerColor;
      selectedRectangle = "none";
    }
    else {
      if (selectedRectangle != "none") {selectedRectangle.style.backgroundColor = formerColor;};
      selectedRectangle = rectangle;
      formerColor = selectedRectangle.style.backgroundColor;
      selectedRectangle.style.backgroundColor = "var(--rectangle-deep)";
    }
  }
} //Select a rectangle

/// BUTTON ////////////////////////////////////////////////////////////////////////////////////

checkButton.addEventListener('click',verifyGrid);


//Define the correct solution
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

let attempt = 0;
let currentScore = 0;
let highScore = 0;

const idOrder1 = [[0],[1,5],[2,6,10],[3,7,11],[4,8,12],[9,13],[14]];
const idOrder2 = [[0],[1,5],[2,6],[3,7],[4,8],[9]];
let idOrder = idOrder1; //For nice propagation effect when checking

async function verifyGrid() {
  checkButton.removeEventListener('click',verifyGrid);
  attempt += 1;
  selectedRectangle = "none";
  if (attempt > 2){
    resetGrid();
  }
  else{
    for (const ids of idOrder) {
      for (const i of ids){
        rectangle = gridRectangles[i];
        if (checkRectangle(i)){
          if (!rectangle.classList.contains('correctRectangle')){currentScore += 5*(3-attempt);}
          rectangle.style.borderColor = "darkGreen";
          rectangle.style.backgroundColor = "darkGreen";
          rectangle.classList.add('correctRectangle');
        }
        else{
          rectangle.style.borderColor = attempt == 1 ? "goldenRod": "maroon";
          rectangle.style.backgroundColor = attempt == 1 ? "khaki": "lightPink";
        }
      }
      await delay(200);
      document.getElementById('currentScore').textContent = currentScore;
    };
    checkButton.addEventListener('click',verifyGrid);
    if (currentScore == maxScore){attempt += 1};
    if (attempt == 2){
      highScore = currentScore > highScore ? currentScore : highScore;
      document.getElementById('highScore').textContent = highScore;
      currentTable == 1 ? localStorage.setItem('trans_highScore1', highScore):localStorage.setItem('trans_highScore2', highScore);
      gameOver();
    }
  }
} //Check if the grid is correct

function checkRectangle(i){
  const smallShapes = gridRectangles[i].querySelectorAll('.smallShape');
  let userAnswer = [];
  smallShapes.forEach(shape => {userAnswer.push("assets/"+shape.src.split(/(\\|\/)/g).pop())});
  return userAnswer.sort().join(',') === validationGrid[i].sort().join(',');
} //Check if a single rectangle is correct


/// GAME OVER ////////////////////////////////////////////////////////////////////////////////

const gameOverWindow = document.getElementById('gameOverWindow');
const showAnswersButton = document.getElementById('showAnswers');
const showCorrectionButton = document.getElementById('showCorrection');
const gameOverResetButton = document.getElementById('gameOverReset');
const gameOverScore = document.getElementById('gameOverScore');
const gameOverPercent = document.getElementById('gameOverPercent');

function gameOver(){
  checkButton.removeEventListener('click',verifyGrid);
  gameOverScore.textContent = currentScore;
  gameOverPercent.textContent = Math.round(currentScore/maxScore*100);
  gameOverWindow.style.animation = 'fadeIn 0.5s ease-in-out forwards';
  gameOverWindow.style.display = 'block';
  resetButton.removeEventListener('click', resetGrid);
  changeButton.removeEventListener('click', switchTables);
}

showAnswersButton.onclick = hideGameOverWindow;
showCorrectionButton.onclick = showCorrection;
gameOverResetButton.onclick = function(){hideGameOverWindow(); resetGrid()};



function hideGameOverWindow(){
  checkButton.addEventListener('click',verifyGrid);
  resetButton.addEventListener('click', resetGrid);
  changeButton.addEventListener('click', switchTables);
  gameOverWindow.style.animation = 'fadeOut 0.5s ease-in-out forwards';
}

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
}

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
}

/// SIDE BAR ///////////////////////////////////////////////////////////////////////////

const changeButton = document.getElementById('changeButton');
const resetButton = document.getElementById('resetButton');

resetButton.addEventListener('click', resetGrid);
changeButton.addEventListener('click', switchTables);

let currentTable = 1;
let validationGrid = validationGrid1;
gridRectangles = Array.from(allRectangles).slice(0,15);
let currentScore1 = 0;
let currentScore2 = 0;
let highScore1 = 0;
let highScore2 = 0;
let attempt1 = 0;
let attempt2 = 0;
let maxScore = 150;

function switchTables(){
  bool_instruction = false;

  if (currentTable == 1){
    document.querySelectorAll(".tableOne").forEach(element => {element.style.display = "none"});
    document.querySelectorAll(".tableTwo").forEach(element => {element.style.display = "flex"});
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
    document.querySelectorAll(".tableOne").forEach(element => {element.style.display = "flex"});
    document.querySelectorAll(".tableTwo").forEach(element => {element.style.display = "none"});
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
  
}

/// VISUAL INSTRUCTIONS /////////////////////////////////////////////////

const cursor = document.createElement('img');
cursor.src = "../assets/cursor_click.png";
const shape = document.createElement('img');
shape.src = "assets/yellowTriangle.png";
shape.style.width = allTransporters[0].getBoundingClientRect().width+'px';
shape.style.height = allTransporters[0].getBoundingClientRect().height+'px';
cursor.style.width = "20px";
cursor.style.height = "";
cursor.classList.add('visualInstruction');
shape.classList.add('visualInstruction');

let cursor_position = [[0.5*allTransporters[0].getBoundingClientRect().left+'px', allTransporters[0].getBoundingClientRect().top+'px']];
cursor_position.push([allTransporters[0].getBoundingClientRect().left+0.5*allTransporters[0].getBoundingClientRect().width+'px', allTransporters[0].getBoundingClientRect().top+0.5*allTransporters[0].getBoundingClientRect().height+'px']);
cursor_position.push([allRectangles[0].getBoundingClientRect().left+0.5*allRectangles[0].getBoundingClientRect().width+'px', allRectangles[0].getBoundingClientRect().top+0.5*allRectangles[0].getBoundingClientRect().height+'px'])

let shape_position = [[allTransporters[0].getBoundingClientRect().left+'px', allTransporters[0].getBoundingClientRect().top+'px']];
shape_position.push(shape_position[0]);
shape_position.push([parseFloat(cursor_position[2][0]) + parseFloat(shape_position[1][0]) - parseFloat(cursor_position[1][0])+'px',parseFloat(cursor_position[2][1]) + parseFloat(shape_position[1][1]) - parseFloat(cursor_position[1][1])+'px']);

function setPosition(element, pos){
  element.style.left = pos[0];
  element.style.top = pos[1];
}

let count = 0;
setPosition(cursor, cursor_position[0]);
setPosition(shape, shape_position[0]);

document.body.appendChild(cursor);
document.body.appendChild(shape);

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
}

let bool_instruction = true;

instructions();