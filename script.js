const allRectangles = document.querySelectorAll('.rectangle');
const allTransporters = document.querySelectorAll('.transporterImage');
const checkButton = document.getElementById('checkButton');

function isMobile() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return /android|ipad|iphone|ipod/i.test(userAgent);
}

document.addEventListener("DOMContentLoaded", function() {
  display("Fail");
  display(isMobile()? "Yes": "No");
});

function display(text){
  document.getElementById('currentScore').textContent = text;
}

/// CLICK AND DRAG ////////////////////////////////////////////////////////////////////////////

var userX = 0;
var userY = 0;

let lastCreation = Date.now();

allTransporters.forEach(transporter => {
    transporter.onmousedown = dragFunction(transporter);
    transporter.ontouchstart = dragFunction(transporter);
    transporter.addEventListener('touchstart', dragFunction(transporter));
    transporter.ondragstart = function() {return false;};
})

function dragFunction(element){
    return function(event){
      userX = event.clientX || event.targetTouches[0].pageX;
      userY = event.clientY || event.targetTouches[0].pageY;
      let shiftX = userX - element.getBoundingClientRect().left;
      let shiftY = userY - element.getBoundingClientRect().top;
    element.style.pointerEvents = "none";
    element.style.position = "fixed";
    element.style.zIndex = 1000;
    moveAt(userX, userY);
    const startTime = Date.now();
  
    function moveAt(pageX, pageY) {
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
  
    function onMouseUp(event) {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup',onMouseUp);
      document.removeEventListener('touchmove', onMouseMove);
      document.removeEventListener('touchend',onMouseUp);
      element.style.pointerEvents = "auto";
      element.onmouseup = null;
      element.style.position = "absolute";
      element.style.zIndex = 999;
      element.style.left = "";
      element.style.top = "";
      const elementImage = element.src;
      if (Date.now() - startTime < 250){
        clickShape(elementImage);
      };
      gridRectangles.forEach(rectangle => {
        const rect = rectangle.getBoundingClientRect();
        if (userX >= rect.left && userX <= rect.right && userY >= rect.top && userY <= rect.bottom) {
          if (appendableTransporter(rectangle, elementImage)) { 
            createSmallShape(rectangle, elementImage);
          }
        }
      });
    };
    }
  }

/// ADDING TRANSPORTERS TO RECTANGLES //////////////////////////////////////////////////////////////

allRectangles.forEach(rectangle => {
    rectangle.addEventListener("click", function () {selectRectangle(rectangle)});
  });

function appendableTransporter(container, elementImage){
    const smallShapes = container.querySelectorAll('.smallShape');
    let bool = container.querySelectorAll('.smallShape').length < 6 && !container.classList.contains('correctRectangle');
    smallShapes.forEach(shape => {bool = bool && shape.src != elementImage});
    return bool;
}

function createSmallShape(container, elementImage) {
    lastCreation = Date.now();
    const smallShape = document.createElement('img');
    smallShape.src = elementImage;
    smallShape.classList.add('smallShape');
    smallShape.style.animation = 'fadeIn 0.5s ease-in-out forwards';
    smallShape.style.transitionDuration = "0s";
    container.appendChild(smallShape);
    realignSmallShapes(container);
    smallShape.addEventListener('animationend', () => {
      realignSmallShapes(container);
      smallShape.style.transitionDuration = "0.3s";
      smallShape.addEventListener('click', (e) => {
        e.stopPropagation();
        removeShape(container,smallShape);
      });
    });

    
}
  
function removeShape(container, smallShape){
  if (!container.classList.contains('correctRectangle')){
    smallShape.style.animation = 'fadeOut 0.5s ease-in-out forwards';
    smallShape.addEventListener('animationend', () => {
      container.removeChild(smallShape);
      realignSmallShapes(container);
  }); }
}
  
function realignSmallShapes(container) {
    const smallShapes = container.querySelectorAll('.smallShape');
    smallShapes.forEach(shape => {
        shape.style.width = "calc("+Math.max(0.9 * Math.pow(0.8,smallShapes.length - 1),0.45)+"*12.8vh)";
      });
}
  
let selectedRectangle = "none";

let counter = 1;

function clickShape(elementImage){
  if (selectedRectangle != "none"){
    counter += 1;
    if (appendableTransporter(selectedRectangle, elementImage)) { 
        createSmallShape(selectedRectangle, elementImage);
    }
    else{
      if (Date.now() - lastCreation > 500){
        selectedRectangle.querySelectorAll(`.smallShape`).forEach(element => {if (element.src == elementImage){removeShape(selectedRectangle,element);}});
        realignSmallShapes(selectedRectangle);
      }
    }
  }
}

let formerColor = "var(--rectangle-light)";

function selectRectangle(rectangle){
  if (!rectangle.classList.contains('correctRectangle')){
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
}

/// BUTTON ////////////////////////////////////////////////////////////////////////////////////

checkButton.addEventListener('click',verifyGrid);

const validationGrid1 = [];
//Na+
validationGrid1.push(['assets/yellowTriangle.png','assets/redSquare.png']);
validationGrid1.push(['assets/yellowTriangle.png','assets/redSquare.png', 'assets/whitePill.png']);
validationGrid1.push(['assets/orangeSquare.png','assets/yellowTriangle.png', 'assets/whitePill.png']);
validationGrid1.push(['assets/purpleSquare.png']);
validationGrid1.push(['assets/redCircle.png']);
//Cl-
validationGrid1.push(['assets/whitePill.png']);
validationGrid1.push(['assets/orangeTriangle.png','assets/grayPill.png']);
validationGrid1.push(['assets/orangeSquare.png']);
validationGrid1.push(['assets/purpleSquare.png','assets/whitePill.png']);
validationGrid1.push(['assets/whitePill.png']);
//K+
validationGrid1.push(['assets/blackPill.png']);
validationGrid1.push(['assets/whitePill.png']);
validationGrid1.push(['assets/orangeSquare.png','assets/whitePill.png','assets/blueCircle.png']);
validationGrid1.push([]);
validationGrid1.push(['assets/yellowDiamond.png','assets/blueCircle.png']);

const validationGrid2 = [];
//H+
validationGrid2.push(['assets/blueTriangle.png','assets/blueDiamond.png']);
validationGrid2.push(['assets/blueTriangle.png','assets/blueDiamond.png']);
validationGrid2.push(['assets/blueTriangle.png','assets/blueDiamond.png']);
validationGrid2.push([]);
validationGrid2.push(['assets/blueDiamond.png','assets/cyanDiamond.png','assets/greenDiamond.png']);
//HCO3-
validationGrid2.push(['assets/greenSquare.png']);
validationGrid2.push(['assets/greenSquare.png']);
validationGrid2.push(['assets/greenSquare.png']);
validationGrid2.push([]);
validationGrid2.push(['assets/cyanTriangle.png','assets/greenTriangle.png']);

let attempt = 0;
let currentScore = 0;
let highScore = 0;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const idOrder1 = [[0],[1,5],[2,6,10],[3,7,11],[4,8,12],[9,13],[14]];
const idOrder2 = [[0],[1,5],[2,6],[3,7],[4,8],[9]];
let idOrder = idOrder1;

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
    if (currentScore == 150){attempt += 1};
    if (attempt == 2){
      highScore = currentScore > highScore ? currentScore : highScore;
      document.getElementById('highScore').textContent = highScore;
      gameOver();
    }
  }
}

function checkRectangle(i){
  const smallShapes = gridRectangles[i].querySelectorAll('.smallShape');
  let userAnswer = [];
  smallShapes.forEach(shape => {userAnswer.push("assets/"+shape.src.split(/(\\|\/)/g).pop())});
  return userAnswer.sort().join(',') === validationGrid[i].sort().join(',');
}


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
  gameOverPercent.textContent = Math.round(currentScore/150*100);
  gameOverWindow.style.animation = 'fadeIn 0.5s ease-in-out forwards';
  gameOverWindow.style.display = 'block';
}

showAnswersButton.onclick = hideGameOverWindow;
showCorrectionButton.onclick = showCorrection;
gameOverResetButton.onclick = function(){hideGameOverWindow(); resetGrid()};



function hideGameOverWindow(){
  checkButton.addEventListener('click',verifyGrid);
  gameOverWindow.style.animation = 'fadeOut 0.5s ease-in-out forwards';
}

function showCorrection(){
  hideGameOverWindow();
  resetGrid();
  attempt = 2;
  gridRectangles.forEach((rectangle,i) => {
    validationGrid[i].forEach(src => createSmallShape(rectangle,src));
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

resetButton.onclick = resetGrid;
changeButton.onclick = switchTables;

let currentTable = 1;
let validationGrid = validationGrid1;
gridRectangles = Array.from(allRectangles).slice(0,15);
let currentScore1 = 0;
let currentScore2 = 0;
let highScore1 = 0;
let highScore2 = 0;
let attempt1 = 0;
let attempt2 = 0;

function switchTables(){
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
    document.getElementById('currentScore').textContent = currentScore;
    document.getElementById('highScore').textContent = highScore;
    idOrder = idOrder1;
    currentTable = 1;
  }
  
}

/// COLOR THEMES //////////////////////////////////////////////////////////////////////////
let background     = ["#141e46","#D6E5FA","#1E0342","#92817A","#343A40","#5F8670","#4D2DB7","#3A4D39","#A3D8FF","#DCD6F7"];
let pseudoBlack    = ["#141e46","#141e46","#1E0342","#505050","#343A40","#202020","#0E21A0","#3A4D39","#202020","#424874"];
let deepHighlight  = ["#C70039","#D77FA1","#0E46A3","#8DB596","#7952B3","#820300","#9D44C0","#4F6F52","#FF76CE","#424874"];
let lightHighlight = ["#FF7979","#E6B2C6","#9AC8CD","#BEDBBB","#FFC107","#B80000","#EC53B0","#739072","#94FFD8","#A6B1E1"];
let pseudoWhite    = ["#FFF5E0","#FEF6FB","#E1F7F5","#FFF5E0","#E1E8EB","#FF9800","#FFF5E0","#ECE3CE","#FDFFC2","#F4EEFF"];

let themeId = 0;

document.getElementById('colorButton').onclick = colorChange;

const root = document.documentElement;
function colorChange(){
  themeId = (themeId+1)%background.length;
  root.style.setProperty('--background', background[themeId]);
  root.style.setProperty('--pseudo-black', pseudoBlack[themeId]);
  root.style.setProperty('--pseudo-white', pseudoWhite[themeId]);
  root.style.setProperty('--deep-highlight', deepHighlight[themeId]);
  root.style.setProperty('--light-highlight', lightHighlight[themeId]);
}