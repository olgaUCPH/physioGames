const allRectangles = document.querySelectorAll('.rectangle');
const allLabels = document.querySelectorAll('.label');
const checkButton = document.getElementById('checkButton');
const body = document.body;
const arsenal = document.getElementById('arsenalContainer');

const gridRectangles = allRectangles;


function isMobile() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return /android|ipad|iphone|ipod/i.test(userAgent);
}

document.addEventListener("DOMContentLoaded", function() {
  highScore1 = localStorage.getItem('highScore1') || 0;
  highScore2 = localStorage.getItem('highScore2') || 0;
  highScore = highScore1;
  themeId = localStorage.getItem('themeId') || 0;
  setColor(themeId);
  document.getElementById('highScore').textContent = highScore;
});

function display(text){
  document.getElementById('currentScore').textContent = text;
}

/// CLICK AND DRAG ////////////////////////////////////////////////////////////////////////////

var userX = 0;
var userY = 0;

let lastTrigger = 0;

let lastCreation = Date.now();

function removeAllEventListeners(element) {
  const newElement = element.cloneNode(true);
  element.parentNode.replaceChild(newElement, element);
  return newElement;
}

allLabels.forEach(label => {
  label.onmousedown = dragFunction(label);
  label.ontouchstart = dragFunction(label);
  label.addEventListener('touchstart', dragFunction(label));
  label.ondragstart = function() {return false;};
})

function dragFunction(element){
    return function(event){
      userX = event.clientX || event.targetTouches[0].pageX;
      userY = event.clientY || event.targetTouches[0].pageY;
      let shiftX = userX - element.getBoundingClientRect().left;
      let shiftY = userY - element.getBoundingClientRect().top;
    const parent = element.parentNode;
    document.body.appendChild(element);
    element.style.pointerEvents = "none";
    element.style.borderColor = "var(--pseudo-black)";
    element.style.backgroundColor = "var(--rectangle-light)";
    element.style.position = "fixed";
    element.style.zIndex = 1000;
    document.body.classList.add('no-select');
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
      if (Date.now() - lastTrigger > 1){
        parent.appendChild(element);
        let boolean = true;
        lastTrigger = Date.now();
        document.body.classList.remove('no-select');
        element.style.pointerEvents = "auto";
        element.onmouseup = null;
        gridRectangles.forEach(rectangle => {
          const rect = rectangle.getBoundingClientRect();
          if (userX >= rect.left-10 && userX <= rect.right+10 && userY >= rect.top-10 && userY <= rect.bottom+10) {
            if (rectangle != element.parentNode){
              addLabel(rectangle, element);
            }
            element.style.position = "absolute";
            element.style.zIndex = 999;
            element.style.left = "";
            element.style.top = "";
            boolean = false;
          }
        });
        if (boolean){
          addToArsenal(element, userX);
        }
      };
      }
      }
  }

/// ADDING TRANSPORTERS TO RECTANGLES //////////////////////////////////////////////////////////////

let counter = 0;

function addLabel(container, element) {
  if (container.children.length > 0){
    if (!container.firstChild.classList.contains('correctRectangle')){
      let child = container.firstChild;
      element.parentNode.appendChild(child);
      if (element.parentNode == arsenal){
        child.style.position = "relative";
      }
      let newChild = removeAllEventListeners(child);
      newChild.onmousedown = dragFunction(newChild);
      newChild.ontouchstart = dragFunction(newChild);
      newChild.addEventListener('touchstart', dragFunction(newChild));
      newChild.ondragstart = function() {return false;};
    }
    else{
      addToArsenal(element, element.getBoundingClientRect().left);
    }
  }
  if (container.children.length == 0){
    container.appendChild(element);
    element.style.position = "absolute";
    element.style.zIndex = 999;
    element.style.left = "";
    element.style.top = "";
    let newElement = removeAllEventListeners(element);
    newElement.onmousedown = dragFunction(newElement);
    newElement.ontouchstart = dragFunction(newElement);
    newElement.addEventListener('touchstart', dragFunction(newElement));
    newElement.ondragstart = function() {return false;};
  }

}

function addToArsenal(element, x){
  const children = arsenal.children;
  if (children.length == 0){
    arsenal.appendChild(element);
  }
  else{
    for (let i = 0; i < children.length; i+=1) {
      if (x < (children[i].getBoundingClientRect().left + children[i].getBoundingClientRect().right)/2){
        arsenal.insertBefore(element, children[i]);
        break;
      }
      if (i == children.length - 1){
        arsenal.appendChild(element);
      }
    }
  }
  
  element.style.position = "";
  element.style.zIndex = 999;
  element.style.left = "";
  element.style.top = "";
  let label = removeAllEventListeners(element);
  label.onmousedown = dragFunction(label);
  label.ontouchstart = dragFunction(label);
  label.addEventListener('touchstart', dragFunction(label));
  label.ondragstart = function() {return false;};
}

/// BUTTON ////////////////////////////////////////////////////////////////////////////////////

checkButton.addEventListener('click',verifyGrid);

let attempt = 0;
let currentScore = 0;
let highScore = 0;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let level = "0";

async function verifyGrid() {
  attempt += 1;
  gridRectangles.forEach((rectangle,i) => {
    if (rectangle.children.length == 0){
      rectangle.style.borderColor = attempt == 1 ? "goldenRod": "maroon";
      rectangle.style.backgroundColor = attempt == 1 ? "khaki": "lightPink";
    }
    else{
      if (rectangle.firstChild.id == "lab"+level+(i+1).toString()){
        rectangle.firstChild.style.borderColor = "darkGreen";
        rectangle.firstChild.style.backgroundColor = "darkGreen";
        rectangle.style.borderColor = "darkGreen";
        rectangle.style.backgroundColor = "darkGreen";
        removeAllEventListeners(rectangle.firstChild);
        rectangle.firstChild.classList.add('correctRectangle');
        currentScore += 5;
      }
      else{
        rectangle.style.borderColor = attempt == 1 ? "goldenRod": "maroon";
        rectangle.style.backgroundColor = attempt == 1 ? "khaki": "lightPink";
        rectangle.firstChild.style.borderColor = attempt == 1 ? "goldenRod": "maroon";
        rectangle.firstChild.style.backgroundColor = attempt == 1 ? "khaki": "lightPink";
      }
    }
  });
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

//resetButton.addEventListener('click', resetGrid);
//changeButton.addEventListener('click', switchTables);

/// COLOR THEMES //////////////////////////////////////////////////////////////////////////
let background     = ["#141e46","#D6E5FA","#1E0342","#92817A","#343A40","#5F8670","#4D2DB7","#3A4D39","#A3D8FF","#DCD6F7"];
let pseudoBlack    = ["#141e46","#141e46","#1E0342","#505050","#343A40","#202020","#0E21A0","#3A4D39","#7952B3","#424874"];
let deepHighlight  = ["#C70039","#D77FA1","#0E46A3","#8DB596","#7952B3","#820300","#9D44C0","#4F6F52","#FF76CE","#424874"];
let lightHighlight = ["#FF7979","#E6B2C6","#9AC8CD","#BEDBBB","#FFC107","#B80000","#EC53B0","#739072","#94FFD8","#A6B1E1"];
let pseudoWhite    = ["#FFF5E0","#FEF6FB","#E1F7F5","#FFF5E0","#E1E8EB","#FF9800","#FFF5E0","#ECE3CE","#FDFFC2","#F4EEFF"];

let themeId = 0;

document.getElementById('colorButton').onclick = colorChange;

const root = document.documentElement;
function colorChange(){
  themeId = (themeId+1)%background.length;
  localStorage.setItem('themeId',themeId);
  setColor(themeId);
}

function setColor(id){
  root.style.setProperty('--background', background[id]);
  root.style.setProperty('--pseudo-black', pseudoBlack[id]);
  root.style.setProperty('--pseudo-white', pseudoWhite[id]);
  root.style.setProperty('--deep-highlight', deepHighlight[id]);
  root.style.setProperty('--light-highlight', lightHighlight[id]);
}


