/// MAIN FUNCTIONALITIES

// - Generate crossword
// - Selecting cell & corresponding line + line switching (intersections)
// - Getting written letter and moving to next letter
// - Verification & Scoring

/// GENERAL ALL PURPOSE & TECHNICAL FUNCTIONS ///////////////////////////////////////////////////

function isMobile() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return /android|ipad|iphone|ipod/i.test(userAgent);
  } //Useless for now

function shuffleArray(array) {
    //Randomly shuffles a given array
    for (let i = array.length - 1; i > 0; i--) {
      //Starting from the last element, swap it with a previous element
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

function argMin(array) {
    //From github.com/engelen
    return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] < r[0] ? a : r))[1];
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
/// RELEVANT HTML ELEMENTS ////////////////////////////////////////////////////////////////////

let gridDiv = document.getElementById("grid");

/// VARIABLE DEFINITIONS //////////////////////////////////////////////////////////////////////

let grid = [];                                                          //Array containing information about the whole grid
let gridPhantom = [];                                                   //Grid, but in list form (for coordinates switching)
let cellDivs = [];                                                      //Array containing all cell elements
let verifPL = [];                                                       //Verified words
let verifPhantom = [];                                                  //Verified letters

let wordList = [];                                                      //List of all words in crossword
let hintList = [];                                                      //List of all hints (in same order)

let wordsPerGrid = 10;                                                  //Number of words in generated grid
let cellSize = 2.5;                                                     //Default cell size
const vw = window.innerWidth / 100;                                     //Convert vw to px

let callCount = 0;                                                      //Counts how many times has the function been called

let currentScore = 0;                                                   //Current score
let highScore = 0;                                                      //High score
let attempt = 0;                                                        //Attempt number


////////////////////////////////////////////////

/// INSERT NEW WORDS & HINTS HERE ! ////////////

////////////////////////////////////////////////

wordList.push("Kreatinin");
hintList.push("Et stof der kan benyttes til bestemmelse af GFR");

wordList.push("Glucose");
hintList.push("Et stof hvis renale clearance normalt er 0");

wordList.push("Proximale");
hintList.push("Nefron segmentet med den største vandreabsorption");

wordList.push("Urea");
hintList.push("Et stof der secerneres i det ascenderende ben af Henles slynge");

wordList.push("Litium");
hintList.push("Et stof hvis clearance er lig flowhastigheden ud af den proximale tubulus");

wordList.push("Renin");
hintList.push("Et enzym der secerneres fra nyren");

wordList.push("Aldosteron");
hintList.push("Et hormon hvis sekretion stimuleres af øget plasma AngII og plasma K+");

wordList.push("Vasopressin");
hintList.push("Et hormon der regulerer vandreabsorptionen i samlerørerne");

wordList.push("Furosemid");
hintList.push("Et slynge (loop) diuretikum");

wordList.push("Parathyroideahormon");
hintList.push("Et hormon der stimulerer Ca++ reabsorptionen i nyren");

wordList.push("Paraaminohippurat");
hintList.push("Et stof med en af de højeste værdier for renal clearance");

wordList.push("Ammonium");
hintList.push("En komponent i netto syreudskillelsen");

wordList.push("Bikarbonat");
hintList.push("Et stof hvis dannelse katalyseres af kulsyreanhydrase");

wordList.push("Albumin");
hintList.push("Et stof der ikke normalt passerer filtrationsbarrieren");

wordList.push("Acidose");
hintList.push("En tilstand med overskud af syre i kroppen");

wordList.push("Clearance");
hintList.push("Et mål for nyrens funktion");

wordList.push("Fosfat");
hintList.push("En buffer i tubulusvæsken");

wordList.push("Podocyt");
hintList.push("En celle der er en del af filtrationsbarrieren");

wordList.push("Hypocalcæmi");
hintList.push("En tilstand med forøget plasma PTH");

wordList.push("Nefronet");
hintList.push("Nyrens funktionelle enhed");

wordList.push("Respiratorisk");
hintList.push("En type af alkalose");

wordList.push("Descenderende");
hintList.push("Segment af Henles slynge med den højeste vandpermeabilitet");

wordList.push("Erytropoietin");
hintList.push("Et hormon der regulerer dannelsen af røde blodlegemer");

wordList.push("Medulla");
hintList.push("Region i nyren med den højeste osmolaritet");

wordList.push("Aquaporiner");
hintList.push("Membranproteiner der øger tubulus vandpermeabilitet");

wordList.push("Somatiske");
hintList.push("Type af nervefibre der innerverer urethras eksterne (rhabdo) sphincter");

wordList.push("Parasympatiske");
hintList.push("Del af det autonome nervesystem der kontraherer detrusor vesicae");

wordList.push("Pons");
hintList.push("Beliggenheden af det primære miktionscenter");

wordList.push("Ekskretionsfraktionen");
hintList.push("Den udskilte mængde af et stof i forhold til den udfiltrerede mængde");

wordList.push("Filtrationsfraktionen");
hintList.push("Fraktion af det renale plasmaflow der filtreres i glomerulus");

for (let i = 0; i < wordList.length; i++){
    wordList[i] = wordList[i].toUpperCase();            //Convert all words to uppercase
}

let VHints = [];                                                        //List containing all vertical hints
let HHints = [];                                                        //List containing all horizontal hints

let placementList = [];                                                 //List of placements [Word, x, y, orientation]
let selPlacement = [];                                                  //Selected word
let selID = -1;                                                         //Selected cell (<0 if outside grid)

let gridContainer = document.getElementById('gridContainer').getBoundingClientRect();       //Grid container (for sizing)
let desired_ratio = gridContainer.width/gridContainer.height;                               //Ratio of container size (for crossword sizing)



/// EVENT LISTENERS //////////////////////////////////////////////////////////////////////////

document.getElementById("wordsPerGrid").setAttribute("max",wordList.length);    //Set maximum of slider to number of words

document.getElementById("wordsPerGrid").addEventListener('input', updateWPG, false);        //Record when slider is changed
document.getElementById("wordsPerGrid").addEventListener('change', updateWPG, false);       //Record when slider is changed

document.getElementById("checkButton").addEventListener("click", verifyGrid);   //Big check button verification trigger

document.getElementById("gridContainer").addEventListener('click', (event) => {             //Deselect when clicking outside grid
    if (event.target === event.currentTarget) {                                             //bug fix (forgot why)
        deselect();
    }
  });

document.addEventListener('keydown', (event) => {                                           //Detect when a key is pressed
    if (event.key == "Tab"){
        event.preventDefault();                                                             //Bug fix
    }
    pressKey(event.key);})                                                                  //Trigger key handling

function pressKey(key){
    if (selID == -2){                                                                       //If no cell is selected, nothing to do
        return 0;
    }
    //if (key.length === 1 && key.match(/[a-zA-Z]/)) {                                        //If it's a single letter
    if (key.length === 1 && key.match(/[\p{Letter}\p{Mark}]+/gu)) {                          //If it's a single letter. Changed to include Danish letters!
        if (!cellDivs[selID].classList.contains('correct')){                                //And the cell has not been validated yet
            cellDivs[selID].classList.remove('incorrect');                                  //Reset style
            cellDivs[selID].innerHTML = key.toUpperCase() + cellDivs[selID].innerHTML.slice(1);     //Write letter
        }
        let ids = placementToID(selPlacement);                                              //Find next cell in current word
        const nextID = ids[Math.min(ids.indexOf(selID) + 1, ids.length - 1)];
        cellSel(nextID, selPlacement[3]);                                                   //Select said cell
    }
    switch (key) {
        case 'Backspace':                                                                   //If backspace is pressed
            if (cellDivs[selID].innerHTML[0] == ' ' || cellDivs[selID].classList.contains('correct')){      //If cell is empty or already validated
                let ids = placementToID(selPlacement);  
                const previousID = ids[Math.max(ids.indexOf(selID) - 1, 0)];                //Find previous cell in current word
                cellSel(previousID, selPlacement[3]);                                       //Select said cell
            }
            if (!cellDivs[selID].classList.contains('correct')){                            //Otherwise, if cell is not empty
                cellDivs[selID].classList.remove('incorrect');                              //Reset style
                cellDivs[selID].innerHTML = ' ' + cellDivs[selID].innerHTML.slice(1);       //Remove letter
            }
            break;
        case 'Tab':
            cellSel(selID, '');                                                             //Switch between horizontal and vertical at intersections
            break;
        case 'Enter':
            deselect();                                                                     //Deselect
            break;
        case 'Escape':
            deselect();                                                                     //Deselect
            break;

        //Arrow handling: find the next cell in the grid that belongs to the crossword
        case 'ArrowUp':
            [x,y] = switchCoords(selID);
            temp = x-1;
            while (temp >= 0 && grid[temp][y] == ' '){
                temp -= 1;
            }
            if(temp >= 0 && grid[temp][y] != ' '){
                cellSel(switchCoords([temp, y]), temp == x-1 ? 'V': '');
            }
            break;
        case 'ArrowDown':
            [x,y] = switchCoords(selID);
            temp = x+1;
            while (temp < grid.length && grid[temp][y] == ' '){
                temp += 1;
            }
            if(temp < grid.length && grid[temp][y] != ' '){
                cellSel(switchCoords([temp, y]), temp == x+1 ? 'V': '');
            }
            break;
        case 'ArrowLeft':
            [x,y] = switchCoords(selID);
            temp = y-1;
            while (temp >= 0 && grid[x][temp] == ' '){
                temp -= 1;
            }
            if(temp >= 0 && grid[x][temp] != ' '){
                cellSel(switchCoords([x, temp]), temp == y-1 ? 'H': '');
            }
            break;
        case 'ArrowRight':
            [x,y] = switchCoords(selID);
            temp = y+1;
            while (temp < grid[0].length && grid[x][temp] == ' '){
                temp += 1;
            }
            if(temp < grid[0].length && grid[x][temp] != ' '){
                cellSel(switchCoords([x, temp]), temp == y+1 ? 'H': '');
            }
            break;
      }
  };

/// GENERAL FUNCTIONALITY ///////////////////////////////////////////////////////////////////

function updateWPG(){
    wordsPerGrid = document.getElementById("wordsPerGrid").value;       //Get value of slider
    document.getElementById("wpgValue").textContent = wordsPerGrid;     //Change displayed value
    cellSize = 1.5 + (25 - wordsPerGrid)/15;                            //Change cell size (more words = smaller cells)
}

async function start(){                                                 //Starts generating and loading the crossword
    let startTime = Date.now();                                         //To record loading time
    document.getElementById("startScreen").style.display = "none";      //Hide start screen
    document.getElementById("loadingScreen").style.display = "flex";    //Show loading screen
    await delay(10);
    do{
        [grid, placementList] = createBestGrid(wordList, wordsPerGrid*10);                  //Create a grid from 10*N_words samples (working value)
    }while(placementList.length < wordsPerGrid);                                            //Repeat if not all words were placed
    document.getElementById("loadingScreen").style.display = "none";                        //Hide loading screen
    console.log(`Generation Time: ${Math.round(Date.now() - startTime)/1000} s`);           //For debug
    console.log(`${callCount} grids generated.`);                                           //For debut
    console.log(`Final grid entropy: ${Math.round(gridEntropy(grid, placementList, wordList))}`);   //For debug
    cellSize = Math.min(0.95*gridContainer.height/grid.length,0.85*gridContainer.width/grid[0].length)/vw;  //Set cellsize relative to grid size
    generateGrid(grid);                                                                     //Create grid elements
    cellDivs.forEach((cell, i) => {
        if (gridPhantom[i] != ' '){
            cell.onclick = function(){cellSel(i, '')};                                      //Add click listener to cells for selection
            verifPhantom.push(false);                                                       //Generate verification phantom
        }
        else{
            cell.onclick = deselect;                                                        //If it's a hidden cell, click listener to deselect
            verifPhantom.push(true);                                                        //Generate verification phantom (no need to check these)
        }
    })
    placementList.forEach(pl => verifPL.push(false));                                       //Generate verification placement list
}


/// CROSSWORD CREATION //////////////////////////////////////////////////////////////////////

function createBestGrid(wL, n){                                         //Creates n grids, scores them, then chooses the best one
    wL = shuffleArray([...wL]).slice(0,wordsPerGrid);                   //Shuffle words
    let grids = [];                                                     //Store grids, placements, entropies
    for (let i = 0; i < n; i++){                                        
        let [grid, pL] = createGrid(wL);                                //Create a grid randomly
        let entropy = gridEntropy(grid, pL, wL);                        //Score it 
        if (pL.length < wordsPerGrid){                                  //If there are not enough words, score it badly
            entropy = 1000000;
        }
        grids.push([grid, pL, entropy]);                                //Register
    }
    grids.sort((a, b) => a[2] - b[2]);                                  //Sort grids in increasing order of entropy
    [grid, pL] = grids[Math.floor(Math.random() * 1)];                  //Get the first element (note: change 1 to x to choose among x first elements)
    if (grid.length > grid[0].length){
        return [grid, pL] = flipGrid(grid, pL);                         //If grid is vertical, flip it to fit the screen
    }
    return [grid, pL];
}

function createGrid(wL){                                                //Creates a potential grid from a given word list
    callCount += 1;
    let grid = [[]];                                                    //Initialize empty grid
    let placementList = [];                                             //Initialize empty placement grid
    let remainingWords = shuffleArray([...wL]).slice(0,wordsPerGrid);   //Shuffle words
    //Place first word
    placeWord(grid, placementList, remainingWords[0], [0,0], Math.random() < 0.5 ? 'H':'V');
    remainingWords = remainingWords.splice(1);                          //Pop off first word
    let calls = 0;                                                      //Count number of calls to the while loop (avoid infinite loops)
    while (remainingWords.length > 0){                                  //While some words have not been placed
        calls += 1;                                                     //Increase count
        let previousGrid = JSON.parse(JSON.stringify(grid));            //Record current state
        let previouspL = JSON.parse(JSON.stringify(placementList));     //Record current state
        if (calls > 3*wL.length){                                       //If number of calls is too high
            return [grid, placementList];                               //Stop and return partial result
        }
        word = remainingWords[0];                                       //Get first word
        remainingWords = remainingWords.splice(1);                      //Pop it off
        let candidates = [];                                            //Record possible position where it could go
        placementList.forEach(placement => {
            candidates = candidates.concat(intersections(grid, placement, word));   //For each previously placed word, register possible intersections
        })
        if (candidates.length == 0){                                    //If word couldn't be placed
            remainingWords.push(word);                                  //Add it back to list of words, it may be placeable later
        }
        else{
            let [x, y, o] = candidates[Math.floor(Math.random() * candidates.length)];      //Choose a random position from all possibilities
            placeWord(grid, placementList, word, [x, y], o);            //Place the word
        }
        if (gridEntropy(grid, placementList, wL) >= 1000000){           //If there is a major issue with the placement, go back!
            grid = previousGrid;
            placementList = previouspL;
            remainingWords.push(word);
        }
    }      
    return [grid, placementList];
}

function intersections(grid, placement, word){                          //For a given placed word and candidate word, return all positions where they intersect without impeding on another word
    let candidates = [];                                                //Register all possible candidates
    let [ref_word, x, y, orientation] = placement;                      //Get input placement
    let ref_wordA = Array.from(ref_word);                               //Convert placed word to list of letters
    let wordA = Array.from(word);                                       //Convert new word to list of letters
    ref_wordA.forEach((ref_letter,i) =>{                                //Loop over all letters from both words
        wordA.forEach((letter,j) => {
            if (ref_letter == letter && i+j != 0){                      //If there are matching letters (that aren't both the first letter)
                position = [x + (orientation == 'V' ? i:-j), y + (orientation == 'H' ? i:-j)];  //Calculate where the new word would be placed (orthogonal to reference word)
                if (canPlace(grid, word, position, orientation == 'V' ? 'H' : 'V')){            //If it is a valid position (no overlap)
                    candidates.push([...position, orientation == 'V' ? 'H' : 'V']);             //Register position & orientation
                }
            }
        })
    })
    return candidates;
}

function canPlace(grid, word, position, orientation){                   //Returns a boolean on whether the new word can be placed here (no overlap with other words)
    let [x,y] = position;                                               //Unpack values
    let l = word.length;                                                //Word length
    let canPlaceBool = true;                                            //Boolean
    word = Array.from(word);                                            //Convert word to list of letters
    if (orientation == 'V'){                                            //Vertical case 
        if (x < 0){                                                     //If the word starts outside of grid
            word = word.splice(-x);                                     //Ignore the first few letters (no risk of overlap)
            x = 0;                                                      //Reset position for shortened word
        }
        word = word.splice(0, grid.length - x);                         //Ignore the last few letters if any are outside of grid (no risk of overlap)
        word.forEach((letter, i) => {
            canPlaceBool &= (grid[x+i][y] == ' ' || grid[x+i][y] == letter);    //Bool becomes false if a letter would be placed on top of another letter
            }
        )
    }
    if (orientation == 'H'){                                            //Horizontal case
        if (y < 0){                                                     //If word starts outside of grid
            word = word.splice(-y);                                     //Ignore first few letters (no risk of overlap)
            y = 0;                                                      //Reset position for shortened word
        }
        word = word.splice(0, grid[0].length - y);                      //Ignore last few letters if any are outside the grid (no risk of overlap)
        word.forEach((letter, i) => {
            canPlaceBool &= (grid[x][y+i] == ' ' || grid[x][y+i] == letter);    //Bool becomes false if a letter would be placed on top of another letter
            }
        )
    }
    return canPlaceBool;
}

function placeWord(grid, placementList, word, position, orientation){
    let [x,y] = position;                                               //Get xy position
    let l = word.length;                                                //Get word length
    if (orientation == 'V'){                                            //Handle vertical placement
        if (x < 0){                                                     //If word starts outside of the grid
            for (let i = 0; i < -x; i++)                                
                {
                    grid.unshift(Array(grid[0].length).fill(' '));      //Add the right amount of empty rows above the grid
                }
            placementList.forEach(placement => {
                placement[1] -= x;                                      //Update all placements to new coordinate system
            })
            x = 0;                                                      //Reset position within new grid
        }
        if (x + l > grid.length){                                       //If word ends outside the grid
            let gl = grid.length;                                       //Get current number of rows
            for (let i = 0; i < x + l - gl; i++)    
            {
                grid.push(Array(grid[0].length).fill(' '));             //Add the right amount of empty rows below the grid
            }
        }
        Array.from(word).forEach((letter, i) => {
            grid[x+i][y] = letter;                                      //Write the word in its correct position
        })
    }
    if (orientation == 'H'){                                            //Handle horizontal placement
        if (y < 0){                                                     //If word starts outside of grid
            grid.forEach(row => {
                for (let i = 0; i < -y; i++)
                    {
                        row.unshift(' ');                               //Add the right amount of empty columns to the left of the grid
                    }
            })
            placementList.forEach(placement => {
                placement[2] -= y;                                      //Update all placements to new coordinate system
            })
            y = 0;                                                      //Reset position within new grid
        }
        if (y + l > grid[0].length){                                    //If word ends outside of grid
            let gl = grid[0].length;                                    //Get current amount of columns
            grid.forEach(row => {
                for (let i = 0; i < y + l - gl; i++)
                    {
                        row.push(' ');                                  //Add correct amount of empty columns to the right of the grid
                    }
            })
        }
        Array.from(word).forEach((letter, i) => {
            grid[x][y+i] = letter;                                      //Write the word in its correct position
        })
    }
    placementList.push([word, x, y, orientation]);                      //Register new word placement
}

function gridEntropy(grid, pL, wL)      {                                   //Compute "entropy" of a given grid. Higher entropies are undesirable
    sizeRatio = Math.abs(Math.max(grid.length/grid[0].length, grid[0].length/grid.length) - desired_ratio);       //Ratio of longest dimension over the other, compared to a 1.3 ratio (working value)
    filledRatio = (grid.length*grid[0].length)/pL.reduce((r, a) => r+a[0].length, 0);       //Ratio of empty cells over filled cells. Lower ratio indicates more intersections, which is desirable
    deadEnds = 0;                                                       //Number of dead ends (word starting or ending right next to another one, leading to a confusing length)
    pL.forEach(placement => {                                           //Loop over all words to check for dead ends
        [word, x, y, o] = placement;                                    
        if (o == 'V' && x + word.length < grid.length && grid[x + word.length][y] != ' '){      //If there is a letter right after end of word (vertical)
            deadEnds += 1;
        }
        if (o == 'H' && y + word.length < grid[0].length && grid[x][y + word.length] != ' '){   //If there is a letter right after end of word (horizontal)
            deadEnds += 1;
        }
        if (o == 'V' && x > 0 && grid[x - 1][y] != ' '){                //If there is a letter right before start of word (vertical)
            deadEnds += 1;
        }
        if (o == 'H' && y > 0 && grid[x][y - 1] != ' '){                //If there is a letter right before start of word (horizontal)
            deadEnds += 1;
        }
    })
    fakeWords = 0;                                                      //Fake Words are sequences of aligned letters that do not belong to the same word
    grid.forEach(row => {
        words = row.join('').split(' ').filter(word => word.length > 1);    //Concatenate list into string, then separate the "word"s using spaces. Ignore all 1-letter "words"
        words.forEach(word => fakeWords += !wL.includes(word));         //Count up "words that don't exist"
    })
    let [flippedGrid, flippedPL] = flipGrid(grid, pL);                  //Flip the grid to do the same thing over columns
    flippedGrid.forEach(row => {
        words = row.join('').split(' ').filter(word => word.length > 1);
        words.forEach(word => fakeWords += !wL.includes(word));
    })
    //The weighting of the different values is arbitrary and may be changed
    //Missing words and dead ends are highly undesirable so have high weights, other issues are lower
    let maxHCells = 0.85*document.getElementById("gridContainer").getBoundingClientRect().width/vw / cellSize;
    let maxVCells = 0.95*document.getElementById("gridContainer").getBoundingClientRect().height/vw / cellSize;

    if (deadEnds || fakeWords || grid.length > maxVCells || grid[0].length > maxHCells || sharedHeads(placementList)){
        return 1000000;
    }
    //return missingWords * 1000 + sizeRatio * 100 + filledRatio * 50 + deadEnds * 250 + fakeWords * 250;
    return sizeRatio * 100 + filledRatio * 50;
}

function sharedHeads(pL) {
    const heads = new Set();
    for (let p of pL) {
      // Extract the second and third elements
      const head = `${p[1]},${p[2]}`; // Create a unique key (string)
  
      if (heads.has(head)) {
        return true;
      }
      heads.add(head);
    }
    return false;
  }

function flipGrid(grid, pL){                                            //Flip a grid in case of higher height than width (for better display)
    return [grid[0].map((_, colIndex) => grid.map(row => row[colIndex])), pL.map((p) => [p[0], p[2], p[1], p[3] == 'H' ? 'V': 'H'])];
}

async function generateGrid(grid, final){                               //Create the html element from the given grid
    grid.forEach(row => {
        let rowDiv = document.createElement('div');                     //Create each row
        rowDiv.classList.add('row');                                    //Style it
        row.forEach(cell => {
            let cellDiv = document.createElement('div');                //Create each cell in each row
            cellDiv.classList.add('cell');                              //Style it
            cellDiv.classList.add('hidden');                            //Hide it
            cellDiv.textContent = ' ';                                  
            cellDiv.style.width = cellSize+"vw";
            cellDiv.style.height = cellSize+"vw";
            cellDiv.style.fontSize = 0.6*cellSize+"vw";
            //cellDiv.textContent = cell;                               //Write the letter (only for testing)
            cellDivs.push(cellDiv);                                     //Push cell to registering array
            gridPhantom.push(cell);                                     //Push value to grid horizontal phantom
            rowDiv.appendChild(cellDiv);                                //Append cell to row
        })
        gridDiv.appendChild(rowDiv);                                    //Append row to grid
    });
    reveal([placementList[0][1], placementList[0][2]]);
    generateLabels();        
}

async function reveal(pos){                                             //Recursive function to have a nice animation
    let [x,y] = pos;
    let i = switchCoords(pos);
    if (x < 0 || y < 0 || x >= grid.length || y >= grid[0].length || !cellDivs[i].classList.contains('hidden')){
        return 0;                                                       //If cell should not be revealed (already revealed or outside grid)
    }
    if (gridPhantom[i] != ' '){                                         //If it's a crossword cell
        cellDivs[i].classList.remove('hidden');                         //Reveal it
        await delay(30);
        reveal([x-1,y]);                                                //Reveal its neighbours
        reveal([x+1,y]);
        reveal([x,y-1]);
        reveal([x,y+1]);
    }
}

function generateLabels(){
    const hPlacements = placementList.filter(item => item[3] === 'H').sort((a, b) => a[1] - b[1]);  // Sort by the second element (x position)
    const vPlacements = placementList.filter(item => item[3] === 'V').sort((a, b) => a[2] - b[2]);  // Sort by the third element  (y position)
    placementList = [...hPlacements, ...vPlacements];
    hPlacements.forEach((placement,i) => {                                                          //Handle horizontal words
        let [word, x, y, o] = placement;
        HHints.push(hintList[wordList.indexOf(word)]);                                              //Add to list of horizontal hints
        let label = document.createElement("div");                                                  //Create label number for first cell
        label.classList.add("label");                                                               //Style it
        label.textContent = (i+1);                                                                  //Set the text
        cellDivs[switchCoords([x,y])].appendChild(label);                                           //Add it to first cell
        let hint = document.createElement("span");                                                  //Create hint element
        hint.textContent = (i+1).toString() + " - " + hintList[wordList.indexOf(word)];             //Set text
        hint.classList.add("hint");                                                                 //Style it
        document.getElementById("HHints").appendChild(hint);                                        //Add it to the list
        hint.onclick = (()=>cellSel(switchCoords([x,y]), 'H'));                                     //Add event listener to select word
    })
    vPlacements.forEach((placement,i) => {                                                          //Same thing here, but for vertical words
        let [word, x, y, o] = placement;
        VHints.push(hintList[wordList.indexOf(word)]);
        let label = document.createElement("div");
        label.classList.add("label");
        label.textContent = (i+1);
        cellDivs[switchCoords([x,y])].appendChild(label);
        let hint = document.createElement("span");
        hint.textContent = (i+1).toString() + " - " + hintList[wordList.indexOf(word)];
        hint.classList.add("hint");
        document.getElementById("VHints").appendChild(hint);
        hint.onclick = (()=>cellSel(switchCoords([x,y]), 'V'));
    })
}

function switchCoords(coords){                                          //Switch between 1D and 2D coordinates
    let n = grid[0].length;
    return typeof coords == 'number' ? [Math.floor(coords/n), coords%n] : coords[0]*n + coords[1];
}

function placementToID(placement){                                      //Gets the list of cell IDs corresponding to a given word
    [word, x, y, o] = placement;
    let ids = [];
    for (var i = 0; i < word.length; i++){
        ids.push(switchCoords([x + (o == 'V' ? i : 0), y + (o == 'H' ? i : 0)]))
    }
    return ids;
}

function IDtoPlacement(i){                                              //Get the list of words (max 2) that the given cell is in
    pls = [];
    placementList.forEach(placement => {
        let ids = placementToID(placement);
        if (ids.includes(i)){pls.push(placement)};
    })
    return pls;
}

/// CELL SELECTION ///////////////////////////////////////////////////////////////////

let previousValue = '';

function phantomInput(){                                                //For tablet compatibilty: abandoned for now
    let inputP = document.createElement('input');
    inputP.classList.add("inputPhantom");
    document.body.appendChild(inputP);
    inputP.focus();
    inputP.addEventListener('input', (event) => {
        if (inputP.value.length < previousValue.length){
            pressKey("Backspace");
        }
        else{
            value = inputP.value[inputP.value.length - 1];
            document.getElementById("currentScore").textContent = value;
            console.log(value);
            pressKey(value);
        }
        previousValue = inputP.value;
    });
}

function cellSel(i, o){
    cellDivs.forEach(cell => {
        cell.classList.remove('main');                                  //Remove style from currently selected word
        cell.classList.remove('secondary');
    })
    let placements = IDtoPlacement(i);                                  //Get the words corresponding to current cell
    if (o != ''){
        placements = placements.filter((x) => x[3] == o);               //If an orientation is specified, select the corresponding word
    }
    let ids = [];                                                       
    if ((i != selID && placements.includes(selPlacement) && o == '')){  //If new cell is selected, but is on the same word, stay on that wprd
        ids = placementToID(selPlacement);                              //Get all cells in the selected word
    }
    else if (i == selID && placements[0] == selPlacement && placements.length > 1){     //Otherwise, switch to the other word
        ids = placementToID(placements[1]);
        selPlacement = placements[1];
    } 
    else{                                                               //Otherwise, get the first corresponding word
        ids = placementToID(placements[0]);
        selPlacement = placements[0];
    }
    ids.forEach(j => {
        cellDivs[j].classList.add('secondary');                         //Highlight selected word
    })
    cellDivs[i].classList.add('main');                                  //Highlight selected cell
    cellDivs[i].classList.remove('secondary');
    selID = i;
    let plID = placementList.indexOf(selPlacement);                     
    let hints = document.querySelectorAll('.hint');
    hints.forEach(h => h.classList.remove("currentHint"));              //Deselect previous hint
    Array.from(hints)[plID].classList.add("currentHint");               //Select new hint
    Array.from(hints)[plID].scrollIntoView({                            //Bring to view selected hint
        behavior: 'smooth',  // Smooth scrolling animation
        block: 'nearest',    // Aligns the element to the nearest edge of the container
        inline: 'nearest'
      });
      if (isMobile()){                                                  //For tablet functionality (abandoned for now)
        if(!document.querySelector('.inputPhantom')){phantomInput();}
      else{
        document.querySelector('.inputPhantom').focus();
      }
      }
}

function deselect(){                                                //Handle cell deselection
    selID = -2;                                                     //Deselect cell
    selPlacement = [];                                              //Deselect word
    cellDivs.forEach(cell => {
        cell.classList.remove('main');                              //Visualize deselection
        cell.classList.remove('secondary');
    })
    let hints = document.querySelectorAll('.hint');
    hints.forEach(h => h.classList.remove("currentHint"));          //Visualize deselection
    document.querySelector('.inputPhantom').remove();
    previousValue = '';
}


// VERICATION AND SCORING ////////////////////////////////////////////

function verifyGrid(){                                              //Handles verification
    attempt += 1;
    cellDivs.forEach(cell => cell.classList.remove('revealed'));    //Reset verification animation
    placementList.forEach((pl,i) => {
        if (!verifPL[i]){                                           //If word has not been validated yet
            let correct = true;
            placementToID(pl).forEach(id => correct = (correct && cellDivs[id].textContent[0] == gridPhantom[id]));     //Check each letter of the word
            verifPL[i] = correct;                                   //Record result for the word
            currentScore += correct * (attempt == 1 ? 10 : attempt == 2 ? 5 : 1);       //Score depending on result
            placementToID(pl).forEach(id => verifPhantom[id] = verifPhantom[id] || correct);        //Record results on cells
        }
    }
    )
    displayScore();                                                 //Display score
    if (selID > 0){
        revealCorrect(switchCoords(selID));                         //Start revelation animation in current position if possible
        deselect();                                                 //Deselect current cells 
    }
    else{
        revealCorrect([placementList[0][1],placementList[0][2]]);   //Reveal starting from first cell
    }

}

function displayScore(){
    //Display score and update highscore if necessary
    if (currentScore > highScore){
      highScore = currentScore;                                                           //Update highscore if necessary
    }
    document.getElementById('currentScore').textContent = currentScore;                   //Display current score
    document.getElementById('highScore').textContent = highScore;                         //Display high score
    localStorage.setItem(`cw_highScore`, highScore);
    
  }

async function revealCorrect(pos){                                  //Recursive animation for verification revelation
    let [x,y] = pos;
    let i = switchCoords(pos);
    if (x < 0 || y < 0 || x >= grid.length || y >= grid[0].length || cellDivs[i].classList.contains('revealed')){
        return 0;
    }
    if (gridPhantom[i] != ' '){
        if(verifPhantom[i]){cellDivs[i].classList.add('correct');}
        else{cellDivs[i].classList.add('incorrect');}
        cellDivs[i].classList.add('revealed');
        await delay(30);
        revealCorrect([x-1,y]);
        revealCorrect([x+1,y]);
        revealCorrect([x,y-1]);
        revealCorrect([x,y+1]);
    }
}

