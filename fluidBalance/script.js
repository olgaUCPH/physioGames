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
      if (Date.now() - lastTrigger > 10){
        let boolean = true;
        lastTrigger = Date.now();
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
        if (boolean){
            newElement.remove();
        }
      };
      }
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

transition_01();
aux();

async function transition_01 (){

  tables[0].style.left = table0[1][0]+'px';
  tables[1].style.left = table1[1][0]+'px';
  await delay(500);
  tables[0].style.top  = table0[1][1]+'px';
  tables[1].style.top  = table1[1][1]+'px';
  await delay(500);
}

checkButton.addEventListener("click", transition_01);



function updateKeyframeScaleX(scaleXValue) {
  const styleSheet = document.styleSheets[0]; // Access the first stylesheet
  
  // Remove the existing keyframes rule (if any)
  for (let i = 0; i < styleSheet.cssRules.length; i++) {
    const rule = styleSheet.cssRules[i];
    if (rule.name === 'ECV') {
      styleSheet.deleteRule(i);
      break;
    }
  }

  // Insert the new keyframes rule with dynamic scaleX value
  const keyframes = `
    @keyframes ECV {
      10% { transform: scaleX(1); }
      20% { transform: scaleX(${scaleXValue}); }
      80% { transform: scaleX(${scaleXValue}); }
      90% { transform: scaleX(1); }
    }
  `;

  styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
}

// Example calculation for scaleX value based on a parameter
const someParameter = 1; // Your dynamic parameter
const scaleXValue = 1 + someParameter; // Example: scaleX(1 + 0.2) = scaleX(1.2)

// Update the keyframe with the dynamically calculated value
updateKeyframeScaleX(scaleXValue);