const allRectangles = document.querySelectorAll('.rectangle');
const checkButton = document.getElementById('checkButton');
const body = document.body;
const arsenal = document.getElementById('arsenalContainer');

let level = 0;
let maxLevel = 0;
let gridRectangles_0 = Array.from(document.querySelectorAll('.rectangle')).slice(0,3);
let gridRectangles_1 = Array.from(document.querySelectorAll('.rectangle')).slice(3);
let gridRectangles = allRectangles;

const allLabels = document.querySelectorAll('.label');
const allLabels_0 = Array.from(document.querySelectorAll('.label')).slice(0,3);
let allLabels_1 = Array.from(document.querySelectorAll('.label')).slice(3);

gridRectangles_1.forEach(rec => rec.style.display = "none");
document.getElementById('rec00').style.display = 'none';
allLabels_1.forEach(rec => rec.style.display = "none");

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
  label.addEventListener('touchstart', dragFunction(label));
  label.ondragstart = function() {return false;};
})

function dragFunction(element){
    return function(event){
      clickCount ++;
      userX = event.clientX || event.targetTouches[0].pageX;
      userY = event.clientY || event.targetTouches[0].pageY;
      let shiftX = userX - element.getBoundingClientRect().left;
      let shiftY = userY - element.getBoundingClientRect().top;
    const parent = element.parentNode;
    document.body.appendChild(element);
    element.style.pointerEvents = "none";
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
      if (Date.now() - lastTrigger > 10){
        parent.appendChild(element);
        let boolean = true;
        lastTrigger = Date.now();
        document.body.classList.remove('no-select');
        element.style.pointerEvents = "auto";
        element.onmouseup = null;
        gridRectangles.forEach(rectangle => {
          const rect = rectangle.getBoundingClientRect();
          if (userX >= rect.left-10 && userX <= rect.right+10 && userY >= rect.top-10 && userY <= rect.bottom+10) {
            console.log("test");
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
      //if (x < (children[i].getBoundingClientRect().left + children[i].getBoundingClientRect().right)/2){
      if (element.id < children[i].id){
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
  label.addEventListener('touchstart', dragFunction(label));
  label.ondragstart = function() {return false;};
}

/// BUTTON ////////////////////////////////////////////////////////////////////////////////////

checkButton.addEventListener('click',verifyGrid_0);

let attempt = 0;
let currentScore = 0;
let highScore = 0;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let acceptableAnswers_0 = [['A'], ['B'], ['C']];
let acceptableAnswers_1 = [[1],[2],[3,5],[4],[3,5],[6,7],[6,7],[8,9],[8,9],[10],[11],[12]];

async function verifyGrid_0() {
  attempt += 1;
  let allGood = true;
  gridRectangles_0.forEach((rectangle,i) => {
    if (rectangle.children.length == 0){
      rectangle.style.animation = '';
      void rectangle.offsetWidth;
      rectangle.style.animation = 'smallShake 0.5s ease-in-out forwards';
      allGood = false;
    }
    else{
      if (acceptableAnswers_0[i].includes(rectangle.firstChild.id.substring(3))){
        removeAllEventListeners(rectangle.firstChild);
        if (!rectangle.firstChild.classList.contains('correctRectangle')){
          rectangle.firstChild.classList.add('correctRectangle');
          rectangle.firstChild.style.backgroundColor = "var(--rectangle-deep)";
        }
      }
      else{
        rectangle.style.animation = '';
        rectangle.style.animation = 'smallShake 0.5s ease-in-out forwards';
        addToArsenal(rectangle.firstChild, rectangle.getBoundingClientRect().left);
        allGood = false;
      }
    }
  });
  document.getElementById('currentScore').textContent = currentScore;
  if (currentScore > highScore){
    highScore = currentScore;
    document.getElementById('highScore').textContent = highScore;
  }
  if (allGood){
    level_1();
    attempt = 0;
  }
}



async function verifyGrid_1() {
  attempt += 1;
  let allGood = true;
  gridRectangles_1.forEach((rectangle,i) => {
    if (rectangle.children.length == 0){
      rectangle.style.animation = '';
      void rectangle.offsetWidth;
      rectangle.style.animation = 'smallShake 0.5s ease-in-out forwards';
      allGood = false;
    }
    else{
      if (acceptableAnswers_1[i].includes(g(parseFloat(rectangle.firstChild.id.substring(3))))){
        removeAllEventListeners(rectangle.firstChild);
        if (!rectangle.firstChild.classList.contains('correctRectangle')){
          currentScore += (attempt == 1? 10: (attempt == 2? 5 : 1));
          rectangle.firstChild.classList.add('correctRectangle');
          rectangle.firstChild.style.backgroundColor = "var(--rectangle-deep)";
        }
      }
      else{
        rectangle.style.animation = '';
        rectangle.style.animation = 'smallShake 0.5s ease-in-out forwards';
        addToArsenal(rectangle.firstChild, rectangle.getBoundingClientRect().left);
        allGood = false;
      }
    }
  });
  document.getElementById('currentScore').textContent = currentScore;
  if (currentScore > highScore){
    highScore = currentScore;
    document.getElementById('highScore').textContent = highScore;
  }
  if (allGood){
    gameOver();
  }
}



/// LEVELS ////////////////////////////////////////////////////////////////////////////////

function gameOver(){
  const goWindow = document.getElementById("gameOverWindow");
  document.getElementById('gameOverScore').textContent = ' '+currentScore+' ';
  goWindow.style.display = "flex";
}

function level_1(){
  allLabels_1 = Array.from(document.querySelectorAll('.label')).slice(3);
  gridRectangles_0.forEach(rec => rec.style.display = "none");
  gridRectangles_1.forEach(rec => rec.style.display = "");
  document.getElementById('rec00').style.display = '';
  allLabels_1.forEach(rec => rec.style.display = '');
  for (const line of arrows){
    line.position();
    line.show("draw",{duration: 1000});
  }
  tutorial_arrow.hide('draw', {duration: 1});
  tutorial_arrow_2.hide('draw', {duration: 1});
  checkButton.removeEventListener('click',verifyGrid_0);
  checkButton.addEventListener('click',verifyGrid_1);
}

let arrows = [];

arrows.push(new LeaderLine(document.getElementById('rec00'),document.getElementById('rec01'),{color:"var(--pseudo-black)", path: "straight", hide:true}));
arrows.push(new LeaderLine(document.getElementById('rec01'),document.getElementById('rec02'),{color:"var(--pseudo-black)", path: "straight", hide:true}));

arrows.push(new LeaderLine(document.getElementById('rec02'),document.getElementById('rec03'),{color:"var(--pseudo-black)", startSocket: 'top', endSocket: 'left', hide: true}));
arrows.push(new LeaderLine(document.getElementById('rec02'),document.getElementById('rec04'),{color:"var(--pseudo-black)", path: "straight", hide:true}));
arrows.push(new LeaderLine(document.getElementById('rec02'),document.getElementById('rec05'),{color:"var(--pseudo-black)", startSocket: 'bottom', endSocket: 'left', hide: true}));

arrows.push(new LeaderLine(document.getElementById('rec04'),document.getElementById('rec06'),{color:"var(--pseudo-black)", startSocket: 'top', endSocket: 'bottom', hide: true}));
arrows.push(new LeaderLine(document.getElementById('rec04'),document.getElementById('rec07'),{color:"var(--pseudo-black)", path: "straight", hide:true}));
arrows.push(new LeaderLine(document.getElementById('rec04'),document.getElementById('rec08'),{color:"var(--pseudo-black)", path: "straight", hide:true}));
arrows.push(new LeaderLine(document.getElementById('rec04'),document.getElementById('rec09'),{color:"var(--pseudo-black)", startSocket: 'bottom', endSocket: 'top', hide: true}));

arrows.push(new LeaderLine(document.getElementById('rec10'),document.getElementById('rec06'),{color:"var(--pseudo-black)", path: "straight", hide:true}));
arrows.push(new LeaderLine(document.getElementById('rec10'),document.getElementById('rec07'),{color:"var(--pseudo-black)", startSocket: 'bottom', endSocket: 'right', hide:true}));

arrows.push(new LeaderLine(document.getElementById('rec08'),LeaderLine.pointAnchor(document.getElementById('rec12'), {x: 0.2*document.getElementById('rec12').clientWidth, y: 0}),{color:"var(--pseudo-black)",startSocket: 'right', endSocket: 'top', endSocketGravity: 10, hide:true}));
arrows.push(new LeaderLine(document.getElementById('rec09'),document.getElementById('rec12'),{color:"var(--pseudo-black)", path: "straight", hide:true}));

arrows.push(new LeaderLine(document.getElementById('rec12'),document.getElementById('rec11'),{color:"var(--pseudo-black)", path: "straight", hide:true}));

let tutorial_arrow = new LeaderLine(document.getElementById('recAA'),document.getElementById('recBB'),{color:"var(--pseudo-black)", path: "straight", hide:true});
let tutorial_arrow_2 = new LeaderLine(document.getElementById('recBB'),document.getElementById('recCC'),{color:"var(--pseudo-black)", path: "straight", hide:true});
tutorial_arrow.show("draw",{duration: 1000});
tutorial_arrow_2.show("draw",{duration: 1000});



//// PERMUTATION /////////////////////////////////////////////////////////

function generatePermutation() {
  const arr = [...Array(12).keys()].map(x => x + 1);

  for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function generateInverse(permutation) {
  const inverse = Array(permutation.length);
  for (let i = 0; i < permutation.length; i++) {
      inverse[permutation[i] - 1] = i + 1;
  }
  return inverse;
}

const permutation = generatePermutation();
const inversePermutation = generateInverse(permutation);

function f(n) {
  return permutation[n - 1];
}

function g(n) {
  return inversePermutation[n - 1];
}

allLabels_1.forEach(lab => {lab.id = "lab"+f(parseFloat(lab.id.substring(3))).toString(); addToArsenal(lab,0)});


let clickCount = 0;

// Function to update the counter
function updateClickCount() {
    clickCount++;
    document.getElementById('clicks').textContent = clickCount;
}

        // Add a click event listener to the whole document
document.addEventListener('click', updateClickCount);