/// MAIN FUNCTIONALITIES

// - Click and Drag of Labels
// - Level design, switching & transition
// - Level verification & Scoring

/// GENERAL ALL PURPOSE & TECHNICAL FUNCTIONS ///////////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", function() {
  highScore = localStorage.getItem('RAAS_highScore') || 0;                    //Get stored highscore value
  document.getElementById('highScore').textContent = highScore;               //Display value
});

function removeAllEventListeners(element) {
  const newElement = element.cloneNode(true);                                 //Clone element (static, only style)
  element.parentNode.replaceChild(newElement, element);                       //Swap old element for new one
  element.remove();                                                           //Remove old element
  return newElement;                                                          //Return new element for later use
} //Remove all event listener from given element by cloning it

function delay(ms) {                                                          //For timing functions and delays
  return new Promise(resolve => setTimeout(resolve, ms));
}

/// RELEVANT HTML ELEMENTS ////////////////////////////////////////////////////////////////////

const allRectangles = document.querySelectorAll('.rectangle');                //All rectangles (= boxes to be filled)
const allLabels = document.querySelectorAll('.label');                        //All labels (= boxes to be dragged)
const checkButton = document.getElementById('checkButton');                   //Big Check button
const body = document.body;                                                   //Document body
const arsenal = document.getElementById('arsenalContainer');                  //Arsenal container

const previousButton = document.getElementById('previousLevelButton');        //Right-side button to access previous level
const nextButton = document.getElementById('nextLevelButton');                //Right-side button to access next level

/// VARIABLE DEFINITIONS //////////////////////////////////////////////////////////////////////


var userX = 0;                                                                        //User mouse x position
var userY = 0;                                                                        //User mouse y position

let lastTrigger = 0;                                                                  //Last time click and drag was triggered (bug fix)

let level = 0;                                                                        //Current level
let maxLevel = 0;                                                                     //Maximum level reached by user
let gridRectangles = document.querySelectorAll('.rectangle.lvl'+level.toString());    //Grid rectangles from current level


let attempt = 0;                                                                      //Attempt number (of current level)
let currentScore = 0;                                                                 //Current score 
let highScore = 0;                                                                    //High score

let answers = [2,0,1,5,3,4,6,7];                                                      //Order of answers, for "random" shuffling
//This means that the correct label for rectangle 0 is label 2; rectangle 1 corresponds to label 0, etc. Works for all levels

/// EVENT LISTENERS //////////////////////////////////////////////////////////////////////////

allLabels.forEach(label => {
  label.onmousedown = dragFunction(label);                                            //Add drag listener (mouse)
  label.addEventListener('touchstart', dragFunction(label));                          //Add drag listener (touchscreen)
  label.ondragstart = function() {return false;};                                     //Disable undesirable native drag 
})

checkButton.addEventListener('click',verifyGrid);                                     //Add listener for verification

/// CLICK AND DRAG ////////////////////////////////////////////////////////////////////////////


function dragFunction(element){
    return function(event){
      userX = event.clientX || event.targetTouches[0].pageX;                          //Get current mouse x position
      userY = event.clientY || event.targetTouches[0].pageY;                          //Get current mouse y position
      let shiftX = userX - element.getBoundingClientRect().left;                      //Compute relative position of mouse to dragged element (x)
      let shiftY = userY - element.getBoundingClientRect().top;                       //Compute relative position of mouse to dragged element (y)
    const parent = element.parentNode;                                                //Element parent (for switching)
    document.body.appendChild(element);                                               //Pull element out of its parent (for positioning)
    element.style.pointerEvents = "none";                                             //Remove pointer events (removes click through)
    element.style.position = "fixed";                                                 //Fixed position (for positioning)
    element.style.zIndex = 1000;                                                      //Bring element to front side
    document.body.classList.add('no-select');                                         //Disable text selection
    moveAt(userX, userY);                                                             //bug fix
  
    function moveAt(pageX, pageY) {                                                   //Move the element to a given position
      element.style.left = pageX - shiftX + 'px';                                     //Set x position
      element.style.top = pageY - shiftY + 'px';                                      //Set y position
    }
  
    function onMouseMove(event) {                                                     //Drag handling function
      userX = event.clientX || event.targetTouches[0].pageX;                          //Get current mouse x position                           
      userY = event.clientY || event.targetTouches[0].pageY;                          //Get current mouse y position
      moveAt(userX, userY);                                                           //Move element
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
        let boolean = true;                                                           //Boolean: is true if the element has not been dropped on a valid rectangle
        lastTrigger = Date.now();                                                     //Update trigger date (bug fix)
        document.body.classList.remove('no-select');                                  //Restore text selection
        element.style.pointerEvents = "auto";                                         //Restore pointer events
        element.onmouseup = null;                                                     //bug fix (might be useless)
        gridRectangles.forEach(rectangle => {
          const rect = rectangle.getBoundingClientRect();
          if (userX >= rect.left-10 && userX <= rect.right+10 && userY >= rect.top-10 && userY <= rect.bottom+10) { //Check if dropped on a rectangle
            if (rectangle != element.parentNode){                                     //If it's the initial parent, do nothing
              addLabel(rectangle, element);                                           //Add element to this rectangle
            }
            element.style.position = "absolute";                                      //Positioning (for display)
            element.style.zIndex = 999;                                               //Lower z position, but still in front
            element.style.left = "";                                                  //Remove positioning instructions from drag
            element.style.top = "";                                                   //remove positioning instructions from drag
            boolean = false;                                                          //No need to return to arsenal
          }
        });
        if (boolean){                                                                 //If not dropped on rectangle
          addToArsenal(element);                                                      //Return to arsenal
        }
      };
      }
      }
  }

/// LABELS HANDLING ///////////////////////////////////////////////////////////////////////////

function addLabel(container, element) { 
  //Add a label to a given rectangle
  if (container.children.length > 0){                                                 //If a rectangle already has a label, swap them
    if (!container.firstChild.classList.contains('correctRectangle')){                //But it isn't correct/validated
      let child = container.firstChild;                                               //Get label already in place
      element.parentNode.appendChild(child);                                          //Swap positions: add previous element to current element's position
      if (element.parentNode == arsenal){                                             //If it wasn't in a rectangle
        child.style.position = "relative";                                            //Arsenal positioning
      }
      let newChild = removeAllEventListeners(child);                                  //Reset all listeners (necessary for positioning shift to work)
      newChild.onmousedown = dragFunction(newChild);
      newChild.addEventListener('touchstart', dragFunction(newChild));
      newChild.ondragstart = function() {return false;};
      container.appendChild(element);                                                 //Add element to now empty rectangle
    }
    else{
      addToArsenal(element);                                                          //If rectangle has already been validated, do not swap
    }
  }
  else{                                                                               //If no previous labels, no need to swap
    container.appendChild(element);                                                   //Add element
    element.style.position = "absolute";                                              //Positioning
    element.style.zIndex = 999;
    element.style.left = "";
    element.style.top = "";
    let newElement = removeAllEventListeners(element);                                //Reset all listeners (necessary for positioning shift to work)
    newElement.onmousedown = dragFunction(newElement);
    newElement.addEventListener('touchstart', dragFunction(newElement));
    newElement.ondragstart = function() {return false;};
    bool_instruction = false;                                                         //Disable visual instruction (user should have understood what happens)
  }

}

function addToArsenal(element){
  //Return the label to the arsenal, in its correct position
  const children = arsenal.children;                                                  //Get all labels still in arsenal (for relative positioning)
  if (children.length == 0){                                                          //If there are none, just add it there
    arsenal.appendChild(element);
  }
  else{                                                                               //Else, insert it using the element id to sort 
    for (let i = 0; i < children.length; i+=1) {
      if (element.id < children[i].id){                                               //As soon as the next element has bigger id,
        arsenal.insertBefore(element, children[i]);                                   //Add element to arsenal
        break;
      }
      if (i == children.length - 1){                                                  //If element is the one with highest id
        arsenal.appendChild(element);                                                 //Add it at the end
      }
    }
  }
  
  element.style.position = "";                                                        //Return native positioning
  element.style.zIndex = "";
  element.style.left = "";
  element.style.top = "";
  let label = removeAllEventListeners(element);                                       //Reset positioning
  label.onmousedown = dragFunction(label);
  label.addEventListener('touchstart', dragFunction(label));
  label.ondragstart = function() {return false;};
}

/// BUTTON ////////////////////////////////////////////////////////////////////////////////////

async function verifyGrid() {
  //Checks the answers of the user
  attempt += 1;                                                                       //Increase attempt ID (for scoring)
  let allGood = true;                                                                 //Boolean: are there no mistakes & nothing missing ?
  gridRectangles.forEach((rectangle,i) => {                                           //For each rectangle
    if (rectangle.children.length == 0){                                              //If there is nothing
      rectangle.style.animation = '';                                                 //Reset animation
      void rectangle.offsetWidth;                                                     //Reset animation
      rectangle.style.animation = 'smallShake 0.5s ease-in-out forwards';             //Shake animation
      allGood = false;                                                                //Record error
    }
    else{
      if (rectangle.firstChild.id == "lab"+level.toString()+answers[i].toString()){   //If label in rectangle corresponds to correct answer
        removeAllEventListeners(rectangle.firstChild);                                //Disable drag
        if (!rectangle.firstChild.classList.contains('correctRectangle')){            //Do not count score if it was already validated in previous attempt
          currentScore += (attempt == 1? 10: (attempt == 2? 5 : 1));                  //Add score (10 points if first attempt, 5 if second, )
          rectangle.firstChild.classList.add('correctRectangle');                     //Set rectangle to correct (no more interaction)
          rectangle.firstChild.classList.remove('hideColors');                        //Reveal colors of label
        }
      }
      else{
        rectangle.style.animation = '';                                               //Otherwise, cause error animation
        rectangle.style.animation = 'smallShake 0.5s ease-in-out forwards';
        addToArsenal(rectangle.firstChild);                                           //Remove label and return to arsenal
        allGood = false;                                                              //Record mistake
      }
    }
  });
  document.getElementById('currentScore').textContent = currentScore;                 //Display score
  if (currentScore > highScore){                                                      //If highscore beaten
    highScore = currentScore;                                                         //Update highscore
    document.getElementById('highScore').textContent = highScore;                     //Display highscore
    localStorage.setItem('RAAS_highScore',highScore);                                 //Store highscore
  }
  if (allGood){                                                                       //If everything is correct
    attempt = 0;                                                                      //Set attempt to 0
    maxLevel = Math.min(level+1, 2);                                                  //Increase max reached level (for navigation)
    if (level < 2){                                                                   //If there is a next level
      congratulations();                                                              //Launch congratulations window
      nextButton.style.animation = "shake 2s ease-in-out 0s infinite";                //Animate next level button
      nextButton.style.scale = 1.5;                                                   //Make it bigger to draw the eye
      nextButton.addEventListener('click',nextLevel);                                 //Activate next level button
      nextButton.classList.add("activeNext");
      nextButton.style.opacity = 1;
    }
    else{
      gameOver();                                                                     //If final level complete: show game over screen & performance
    }
  }
}



/// LEVELS ////////////////////////////////////////////////////////////////////////////////

///TRANSITION WINDOWS

//Handle the windows that appear when completing a level

function congratulations(){
  // Display congratulation window
  const cong = document.getElementById("congratulations");
  cong.addEventListener('animationend', function () {cong.style.display = "none";}) //Event listener: remove element at the end of the animation
  void cong.offsetWidth;                                                            //Reset animation
  cong.style.display = "flex";                                                      //Display
}

function gameOver(){
  // Display game over window
  const goWindow = document.getElementById("gameOverWindow");
  document.getElementById('gameOverScore').textContent = ' '+currentScore+' ';                        //Display final score
  document.getElementById('gameOverPercent').textContent = ' '+Math.round(currentScore/180*100)+' ';  //Display final performance
  goWindow.addEventListener('animationend', function () {goWindow.style.display = "none";});
  goWindow.style.display = "flex";
}

function offsetTop(element){
  //Compute the position, in pixel, from the left of the screen (including border)
  return element.offsetTop - parseFloat(getComputedStyle(element).borderTopWidth);
}

function offsetRight(element){
  //Compute the position, in pixel, from the right of the screen (including border)
  return element.offsetParent.offsetWidth - (element.offsetLeft + element.offsetWidth) - parseFloat(getComputedStyle(element).borderLeftWidth);
}

function offsetBottom(element){
  //Compute the position, in pixel, from the bottom of the screen (including border)
  return element.offsetParent.offsetHeight - (element.offsetTop + element.offsetHeight) - parseFloat(getComputedStyle(element).borderTopWidth);
}

function offsetLeft(element){
  //Compute the position, in pixel, from the top of the screen (including border)
  return element.offsetLeft - parseFloat(getComputedStyle(element).borderLeftWidth);
}

function baseRecPosition(rec, position){
  //Set position of given rectangle to given position
  rec.style.top = position[0];
  rec.style.right = position[1];
  rec.style.bottom = position[2];
  rec.style.left = position[3];
}

function auxLoadLevel(rec){
  //Auxiliairy function when changing level: smooth transitions for base rectangles
  rec.classList.add('smoothTransitions');
  rec.classList.remove('rectangle');
  rec.classList.remove('lvl0');
  rec.firstChild.classList.remove('lvl0');
}

async function loadLevel(lvl){
  //Load a given level, with correct variables and correct diagram. 'level' is current level, 'lvl' is future level (confusing I know)
  checkButton.removeEventListener('click', verifyGrid);                           //Disable checking (avoid double triggers)
  for (const line of allArrows[level])                                            //For each currently drawn arrow
    {line.hide("draw", {duration: 1000})};                                        //Remove arrow (with animation)
  auxLoadLevel(rec00);                                                            //Change classes of base rectangles
  auxLoadLevel(rec01);
  auxLoadLevel(rec02);
  await delay(1000);                                                              //Wait for arrows to be hidden
  document.querySelectorAll('.lvl'+level.toString()).forEach(element => {         //For each element of current level
    element.style.animation = "fadeOut 1s";                                       //Fade out the element
    element.addEventListener("animationend", () =>{                               //When the animation is done, remove it
      element.style.animation = "";
      element.style.display = 'none';
      let label = removeAllEventListeners(element);                               //Reset event listener
      if (label.id.includes("lab")){                                              //Only if it's a label...
        label.onmousedown = dragFunction(label);
        label.addEventListener('touchstart', dragFunction(label));
        label.ondragstart = function() {return false;};
      }
    })
  })
  if (level != 0){await delay(1000);}                                             //If rectangles are being hidden (level = 1/2), wait
  gridRectangles = document.querySelectorAll('.rectangle.lvl'+lvl.toString());    //Select new gridRectangles, from new level
  baseRecPosition(rec00, position00[lvl]);                                        //Position base rectangles according to new level
  baseRecPosition(rec01, position01[lvl]);
  baseRecPosition(rec02, position02[lvl]);
  if (lvl != 0){await delay(1000);}                                               //If rectangles will need to appear (lvl = 1/2), wait until base rectangles have moved
  document.getElementById('lvl'+level.toString()+'title').classList.remove('currentLvl');     //Instructions: deselect current level
  document.getElementById('lvl'+level.toString()+'title').classList.add('otherLvl');          //Instructions: deselect current level
  document.getElementById('lvl'+lvl.toString()+'title').classList.remove('otherLvl');         //Instructions: select new level
  document.getElementById('lvl'+lvl.toString()+'title').classList.add('currentLvl');          //Instructions: select new level
  document.querySelectorAll('.lvl'+lvl.toString()).forEach(element => {           //Show all new rectangles from lvl
    element.style.display = '';
    element.style.animation = "fadeIn 1s";
    element.addEventListener('animationend', ()=>{element.style.animation = ''});
  });
  await delay(1000);                                                              //Wait for all rectangles to have been shown
  allArrows[lvl] = arrowFunctions[lvl]();                                         //Redraw all arrows (bug fix)
  for (const line of allArrows[lvl])
    {
      line.position();                                                            //Recalculate position of arrows (bug fix)
      line.show("draw", {duration: 1000})};                                       //Draw arrows
  level = lvl;                                                                    //Update current level
  if (level < maxLevel){                                                          //Handle level change button: if next level is accessible, show the button
    nextButton.addEventListener('click', nextLevel);
    nextButton.classList.add('activeNext');
    nextButton.style.opacity = 1;
  }
  if (level > 0){                                                                 //If previous level exists (level > 0), show the button
    previousButton.addEventListener('click', previousLevel);
    previousButton.classList.add('activePrevious');
    previousButton.style.opacity = 1;
  }
  checkButton.addEventListener('click', verifyGrid);                              //Reinstate checking now that the level is loaded
}



/// SIDE BAR ///////////////////////////////////////////////////////////////////////////

previousButton.style.opacity = 0.5;                                               //Make buttons transparent (they initially do nothing)
nextButton.style.opacity = 0.5;

function previousLevel(){
  //Function that triggers when pressing 'previous' button: access previous level, and deactivate the button
  //If previous can still be used in the level, loadLevel will reactivate the button
  loadLevel(level - 1);
  previousButton.removeEventListener('click', previousLevel);
  previousButton.classList.remove("activePrevious");
  previousButton.style.opacity = 0.5;
}

function nextLevel(){
  //Function that triggers when pressing 'next' button: access next level, and deactivate the button
  //If next can still be used in the level, loadLevel will reactivate the button
  nextButton.style.animation = '';
  nextButton.style.scale = '';                                                    //Remove animation and scale: can happen after congratulations()
  nextButton.removeEventListener('click', nextLevel);
  loadLevel(level + 1);
  nextButton.classList.remove("activeNext");
  nextButton.style.opacity = 0.5;
}


/// ARROWS ! ///////////////////////////////////////////////////////////////////////////

//Arrows are drawn using the LeaderLine by Anseki plugin. One needs to specify starting point and end point; the rest is cosmetic

function level0Arrows(){
  //Draw all arrows from level 0
  let arrows = [];
  arrows.push(new LeaderLine(document.getElementById('rec00'),document.getElementById('rec01'),{color:"var(--pseudo-black)", path: "straight", hide:true}));
  arrows.push(new LeaderLine(document.getElementById('rec01'),document.getElementById('rec02'),{color:"var(--pseudo-black)", path: "straight", hide:true}));
  return arrows;
}

function level1Arrows(){
  //Draw all arrows from level 1
  let arrows = [];
  arrows.push(new LeaderLine(document.getElementById('rec00'),document.getElementById('rec10'),{color:"var(--pseudo-black)", startSocket: 'top', endSocket: 'left', hide: true}));
  arrows.push(new LeaderLine(document.getElementById('rec00'),document.getElementById('rec14'),{color:"var(--pseudo-black)", startSocket: 'right', endSocket: 'left', path: "straight", hide: true}));

  arrows.push(new LeaderLine(document.getElementById('rec10'),document.getElementById('rec11'),{color:"var(--pseudo-black)", startSocket: 'top', endSocket: 'left', path: 'magnet', hide: true}));
  arrows.push(new LeaderLine(document.getElementById('rec10'),document.getElementById('rec12'),{color:"var(--pseudo-black)", startSocket: 'bottom', endSocket: 'left', path: 'magnet', hide: true}));
  arrows.push(new LeaderLine(document.getElementById('rec10'),document.getElementById('rec13'),{color:"var(--pseudo-black)", startSocket: 'right', endSocket: 'left', path:'straight', hide: true}));
  arrows.push(new LeaderLine(LeaderLine.pointAnchor(document.getElementById('rec11'), {x: document.getElementById('rec11').clientWidth, y: 0.4*document.getElementById('rec11').clientHeight}),document.getElementById('rec01'),{color:"var(--pseudo-black)", startSocket: 'right', endSocket: 'top', path: 'fluid', startSocketGravity: 500, hide: true}));
  arrows.push(new LeaderLine(document.getElementById('rec13'),document.getElementById('rec16'),{color:"var(--pseudo-black)", startSocket: 'bottom', endSocket: 'top', path:'straight', hide: true}));
  arrows.push(new LeaderLine(document.getElementById('rec12'),document.getElementById('rec15'),{color:"var(--pseudo-black)", startSocket: 'bottom', endSocket: 'top', path: "straight", hide: true}));

  arrows.push(new LeaderLine(document.getElementById('rec14'),document.getElementById('rec15'),{color:"var(--pseudo-black)", startSocket: 'right', endSocket: 'left', path: "straight", hide: true}));
  arrows.push(new LeaderLine(document.getElementById('rec14'),document.getElementById('rec17'),{color:"var(--pseudo-black)", startSocket: 'bottom', endSocket: 'left', hide: true}));
  arrows.push(new LeaderLine(document.getElementById('rec15'),document.getElementById('rec16'),{color:"var(--pseudo-black)", startSocket: 'right', endSocket: 'left', path: "straight", hide: true}));
  arrows.push(new LeaderLine(document.getElementById('rec16'),document.getElementById('rec01'),{color:"var(--pseudo-black)", startSocket: 'right', endSocket: 'left', path: "straight", hide: true}));

  arrows.push(new LeaderLine(document.getElementById('rec17'),LeaderLine.pointAnchor(document.getElementById('rec01'), {x: 0, y: 0.85*document.getElementById('rec01').clientHeight}),{color:"var(--pseudo-black)", startSocket: 'right', endSocket: 'left', path: 'magnet', startSocketGravity: 200,  hide: true}));

  arrows.push(new LeaderLine(document.getElementById('rec01'),document.getElementById('rec02'),{color:"var(--pseudo-black)", startSocket: 'bottom', endSocket: 'top', path: "straight", hide: true}));
  return arrows;
}

function level2Arrows(){
  //Draw all arrows from level 2
  let arrows = [];
  arrows.push(new LeaderLine(document.getElementById('rec00'), document.getElementById('rec01'),{color:"var(--pseudo-black)", startSocket: 'right', endSocket: 'left', path:"straight", hide: true}));
  arrows.push(new LeaderLine(document.getElementById('rec01'), document.getElementById('rec20'),{color:"var(--pseudo-black)", startSocket: 'right', endSocket: 'left', path:"straight", hide: true}));
  
  arrows.push(new LeaderLine(LeaderLine.pointAnchor(document.getElementById('rec20'), {x: 0, y: 0.85*document.getElementById('rec20').clientHeight}), document.getElementById('rec21'),{color:"var(--pseudo-black)", startSocket: 'left', endSocket: 'top', path:"magnet", hide: true}));
  arrows.push(new LeaderLine(LeaderLine.pointAnchor(document.getElementById('rec20'), {x: document.getElementById('rec20').clientWidth, y: 0.85*document.getElementById('rec20').clientHeight}), document.getElementById('rec22'),{color:"var(--pseudo-black)", startSocket: 'right', endSocket: 'top', path:"magnet", hide: true}));
  arrows.push(new LeaderLine(document.getElementById('rec20'), document.getElementById('rec23'),{color:"var(--pseudo-black)", startSocket: 'bottom', endSocket: 'top', path:"straight", hide: true}));
  arrows.push(new LeaderLine(document.getElementById('rec21'), document.getElementById('rec23'),{color:"var(--pseudo-black)", startSocket: 'bottom', endSocket: 'left', path:"magnet", hide: true}));
  arrows.push(new LeaderLine(document.getElementById('rec22'), document.getElementById('rec24'),{color:"var(--pseudo-black)", startSocket: 'bottom', endSocket: 'top', path:"straight", hide: true}));
  arrows.push(new LeaderLine(document.getElementById('rec23'), document.getElementById('rec24'),{color:"var(--pseudo-black)", startSocket: 'bottom', endSocket: 'left', path:"magnet", hide: true}));
  arrows.push(new LeaderLine(document.getElementById('rec24'), document.getElementById('rec02'),{color:"var(--pseudo-black)", startSocket: 'right', endSocket: 'left', path:"straight", hide: true}));

  arrows.push(new LeaderLine(document.getElementById('rec20'), document.getElementById('rec25'),{color:"var(--pseudo-black)", startSocket: 'right', endSocket: 'left', path:"straight", hide: true}));
  arrows.push(new LeaderLine(document.getElementById('rec25'), document.getElementById('rec26'),{color:"var(--pseudo-black)", startSocket: 'bottom', endSocket: 'top', path:"straight", hide: true}));
  arrows.push(new LeaderLine(document.getElementById('rec26'), document.getElementById('rec02'),{color:"var(--pseudo-black)", startSocket: 'bottom', endSocket: 'top', path:"straight", hide: true}));

  return arrows;
}

let arrowFunctions = [level0Arrows, level1Arrows, level2Arrows];          //List of drawing functions to be called later

/// INITIALIZATION ///////////////////////////////////////////////////////////////////////////////////////////////

/// BASE RECTANGLE POSITIONING

//Handle the three rectangles from level 0, so that they move to correct positions when changing levels
//All the following operations are done in a few milliseconds, but are important to compute exact desired
//positions relative to the user's screen, and allow for smooth transitions

//This section is technical, purely cosmetic and irrelevant to the overall function of the game

//Get elements
const rec00 = document.getElementById("rec00");
const rec01 = document.getElementById("rec01");
const rec02 = document.getElementById("rec02");

//Create position recorder
let position00 = [];
let position01 = [];
let position02 = [];

//Set positions to level 0
baseRecPosition(rec00,["","","","10vw"]);
baseRecPosition(rec01,["","","",""]);
baseRecPosition(rec02,["","10vw","",""]);

//Record positions in pixels
position00.push([offsetTop(rec00)+'px',offsetRight(rec00) + 'px',offsetBottom(rec00) + 'px', offsetLeft(rec00)+'px']);
position01.push([offsetTop(rec01)+'px',offsetRight(rec01) + 'px',offsetBottom(rec01) + 'px', offsetLeft(rec01)+'px']);
position02.push([offsetTop(rec02)+'px',offsetRight(rec02) + 'px',offsetBottom(rec02) + 'px', offsetLeft(rec02)+'px']);

//Set positions to level 1
baseRecPosition(rec00,["","","18vh","1vw"]);
baseRecPosition(rec01,["","2vw","18vh",""]);
baseRecPosition(rec02,["","2vw","0.5vh",""]);

//Record positions in pixels
position00.push([offsetTop(rec00)+'px',offsetRight(rec00) + 'px',offsetBottom(rec00) + 'px', offsetLeft(rec00)+'px']);
position01.push([offsetTop(rec01)+'px',offsetRight(rec01) + 'px',offsetBottom(rec01) + 'px', offsetLeft(rec01)+'px']);
position02.push([offsetTop(rec02)+'px',offsetRight(rec02) + 'px',offsetBottom(rec02) + 'px', offsetLeft(rec02)+'px']);

//Set positions to level 2
baseRecPosition(rec00,["0.5vh","","","1vw"]);
baseRecPosition(rec01,["0.5vh","","","calc(0.185*max(100vw - 17vw,100vh - 50vh))"]);
baseRecPosition(rec02,["","4vw","0.5vh",""]);

//Record positions in pixels
position00.push([offsetTop(rec00)+'px',offsetRight(rec00) + 'px',offsetBottom(rec00) + 'px', offsetLeft(rec00)+'px']);
position01.push([offsetTop(rec01)+'px',offsetRight(rec01) + 'px',offsetBottom(rec01) + 'px', offsetLeft(rec01)+'px']);
position02.push([offsetTop(rec02)+'px',offsetRight(rec02) + 'px',offsetBottom(rec02) + 'px', offsetLeft(rec02)+'px']);

//Return to level 0 position
baseRecPosition(rec00,position00[0]);
baseRecPosition(rec01,position01[0]);
baseRecPosition(rec02,position02[0]);

//Draw and store all arrows from all levels

const allArrows = [level0Arrows(), level1Arrows(), level2Arrows()];     

for (const line of allArrows[0]){                                         //Show all arrows from level 0
  line.show();
}

document.querySelectorAll('.lvl1, .lvl2').forEach(element => {            //Hide everything from levels 1 & 2
  element.style.display = 'none';
});
