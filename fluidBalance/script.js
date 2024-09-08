const allLabels = document.querySelectorAll('.label');
const arsenal = document.getElementById('arsenalContainer');
const gridRectangles = document.querySelectorAll(".toFill");
const checkButton = document.getElementById("checkButton");

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/// PART 1 - CLICK AND DRAG ///////////////////////////////////////////////////////////

let lastTrigger = Date.now();

allLabels.forEach(label => {
    label.onmousedown = dragFunction(label);
    label.addEventListener('touchstart', dragFunction(label));
    label.ondragstart = function() {return false;};
  })

function dragFunction(element){
    return function(event){

      userX = event.clientX || event.targetTouches[0].pageX;
      userY = event.clientY || event.targetTouches[0].pageY;
      let shiftX = userX - element.getBoundingClientRect().left;
      let shiftY = userY - element.getBoundingClientRect().top;

    const newElement = element.cloneNode(true);

    document.body.appendChild(newElement);
    newElement.style.pointerEvents = "none";
    newElement.style.position = "fixed";
    newElement.style.zIndex = 1000;
    document.body.classList.add('no-select');
    moveAt(userX, userY);
  
    function moveAt(pageX, pageY) {
        newElement.style.left = pageX - shiftX + 'px';
        newElement.style.top = pageY - shiftY + 'px';
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
      newElement.style.pointerEvents = "auto";
      newElement.onmouseup = null;
      gridRectangles.forEach(rectangle => {
      const rect = rectangle.getBoundingClientRect();
      if (userX >= rect.left && userX <= rect.right && userY >= rect.top && userY <= rect.bottom) {
        if (rectangle != newElement.parentNode){
          addLabel(rectangle, newElement);
          newElement.remove();
        }
        newElement.style.position = "absolute";
        newElement.style.zIndex = 999;
        newElement.style.left = "";
        newElement.style.top = "";
        boolean = false;
      }
      });
      newElement.remove();
    };
  }
}

function addLabel(rectangle, element){
    rectangle.textContent = element.textContent;
}

/// PART 2 - GRAPHICAL VISUALIZATION /////////////////////////////////////////////////

let tables = document.querySelectorAll(".table");

let table0 = [];
let table1 = [];

function offsetLeft(element){
  return element.offsetLeft;
}

function offsetTop(element){
  return element.offsetTop;
}

table0.push([offsetLeft(tables[0]),offsetTop(tables[0])]);
table1.push([offsetLeft(tables[1]),offsetTop(tables[1])]);

tables[0].style.left = "1vw";
tables[0].style.top  = table0[0][1]+'px';

tables[1].style.right = "1vw";
tables[1].style.top  = table0[0][1]+'px';

table0.push([offsetLeft(tables[0]),table0[0][1]]);
table1.push([offsetLeft(tables[1]),table0[0][1]]);

tables[0].style.position = "absolute";
tables[1].style.position = "absolute";

tables[0].style.left = table0[0][0]+'px';
tables[0].style.top  = table0[0][1]+'px';

tables[1].style.left = table1[0][0]+'px';
tables[1].style.right = "";
tables[1].style.top  = table1[0][1]+'px';


async function aux(){
  await delay(1);
  tables[0].classList.add("smoothTransitions");
  tables[1].classList.add("smoothTransitions");
}

aux();

async function transition_01 (){

  tables[0].style.left = table0[1][0]+'px';
  tables[1].style.left = table1[1][0]+'px';
  await delay(500);
  tables[0].style.top  = table0[1][1]+'px';
  tables[1].style.top  = table1[1][1]+'px';
  await delay(500);
  document.getElementById("diagramContainer").style.opacity = 1;
  document.getElementById('arsenalContainer').style.backgroundColor="var(--light-highlight)";
  allLabels.forEach(lab => lab.style.opacity = 0);
  document.querySelectorAll('.tileTitle').forEach(lab => lab.style.opacity = 0);
  document.querySelectorAll('.arsenalTile').forEach(element => element.style.width = "33.33334%");
  await delay(500);
  document.querySelectorAll('.arsenalTile').forEach(element => element.style.display = "none");
  document.getElementById('arsenalContainer').style.boxShadow = "3px 3px 5px black";
  getScales();

  ECV_animation();
  ICV_animation();

  document.querySelectorAll('.mcqWrapper').forEach(element => element.style.display = "flex");  
}

checkButton.addEventListener("click", transition_01);

const allRectangles = document.querySelectorAll(".rectangle");

function getScales(){
  ECV_scaleX = parseFloat(allRectangles[9].textContent)/parseFloat(allRectangles[0].textContent);
  ECV_scaleY = parseFloat(allRectangles[10].textContent)/parseFloat(allRectangles[1].textContent);

  ICV_scaleX = parseFloat(allRectangles[12].textContent)/parseFloat(allRectangles[3].textContent);
  ICV_scaleY = parseFloat(allRectangles[13].textContent)/parseFloat(allRectangles[4].textContent);
}

let ECV_scaleX = 1;
let ICV_scaleX = 1;
let ECV_scaleY = 1;
let ICV_scaleY = 1;

let animate_ECV = true;
let animate_ICV = true;

async function ECV_animation(){
  const ECV = document.getElementById("ECV1");
  ECV.style.transform = `scaleX(${ECV_scaleX}) scaleY(${ECV_scaleY})`;
  await delay (8000);
  ECV.style.transform = `scaleX(1) scaleY(1)`;
  await delay (2000);
  if (animate_ECV){ECV_animation();}
}

async function ICV_animation(){
  const ICV = document.getElementById("ICV1");
  ICV.style.transform = `scaleX(${ICV_scaleX}) scaleY(${ICV_scaleY})`;
  await delay (8000);
  ICV.style.transform = `scaleX(1) scaleY(1)`;
  await delay (2000);
  if (animate_ICV){ICV_animation();}
}

function x_highlight(id){
  let element = document.getElementById(id);
  element.style.width = "100%";
  element.offsetHeight;
  element.style.animation = "xExtend 0.5s forwards";
}

async function x_restore(id){
  let element = document.getElementById(id);
  element.offsetHeight;
  element.style.width = "10%";
  element.style.animation = "xRetract 0.5s forwards";
}

function y_highlight(id){
  let element = document.getElementById(id);
  element.style.display = "flex";
  element.style.height = "100%";
  element.offsetHeight;
  element.style.animation = "yExtend 0.5s forwards";
}

async function y_restore(id){
  let element = document.getElementById(id);
  element.offsetHeight;
  element.style.height = "10%";
  element.style.animation = "yRetract 0.5s forwards";
}

const TBW1_Container = document.getElementById("TBW1_X_Container");
const ECV_Shadow = document.getElementById("ECV_Shadow");
const ICV_Shadow = document.getElementById("ICV_Shadow");

async function diagram_update() {
  TBW1_Container.style.width = document.getElementById('ECV1').getBoundingClientRect().width + document.getElementById('ICV1').getBoundingClientRect().width +"px";
  TBW1_Container.style.height = Math.max(document.getElementById('ECV1').getBoundingClientRect().height,document.getElementById('ICV1').getBoundingClientRect().height) + "px";
  TBW1_Container.style.left = document.getElementById('ECV1').getBoundingClientRect().left + "px";
  TBW1_Container.style.top = Math.max(document.getElementById('ECV1').getBoundingClientRect().top, document.getElementById('ICV1').getBoundingClientRect().top) + "px";

  ECV_Shadow.style.width = document.getElementById('ECV1').getBoundingClientRect().width+"px";
  ECV_Shadow.style.height = document.getElementById('ECV1').getBoundingClientRect().height + "px";
  ECV_Shadow.style.left = document.getElementById('ECV1').getBoundingClientRect().left + "px";
  ECV_Shadow.style.top = document.getElementById('ECV1').getBoundingClientRect().top + "px";
  
  ICV_Shadow.style.width = document.getElementById('ICV1').getBoundingClientRect().width+"px";
  ICV_Shadow.style.height = document.getElementById('ICV1').getBoundingClientRect().height + "px";
  ICV_Shadow.style.left = document.getElementById('ICV1').getBoundingClientRect().left + "px";
  ICV_Shadow.style.top = document.getElementById('ICV1').getBoundingClientRect().top + "px";
  await delay(10);
  diagram_update();
}

diagram_update();