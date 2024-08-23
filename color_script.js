let themeId = 0;
let themeMemory = 0;


document.addEventListener("DOMContentLoaded", function() {
    themeId = parseInt(localStorage.getItem('themeId')) || 0;
    setColor(themeId);
  });

document.getElementById('colorButton').addEventListener('click', colorChange);

  /// COLOR THEMES //////////////////////////////////////////////////////////////////////////
let background     = ["#141e46","#D6E5FA","#1E0342","#92817A","#343A40","#5F8670","#A0DEFF","#FAF6F0","#111111","#A3D8FF","#666666","#322C2B","#DCD6F7"];
let pseudoBlack    = ["#141e46","#141e46","#1E0342","#505050","#343A40","#202020","#0E21A0","#000000","#000000","#7952B3","#222831","#322C2B","#424874"];
let deepHighlight  = ["#C70039","#D77FA1","#0E46A3","#183E0C","#7952B3","#820300","#5AB2FF","#000000","#282822","#FF76CE","#31363F","#803D3B","#424874"];
let lightHighlight = ["#FF7979","#E6B2C6","#9AC8CD","#BEDBBB","#FFC107","#B80000","#CAF4FF","#CE1212","#666666","#94FFD8","#76ABAE","#AF8260","#A6B1E1"];
let pseudoWhite    = ["#FFF5E0","#FEF6FB","#E1F7F5","#FFF5E0","#E1E8EB","#FF9800","#FFF9D0","#F4DFC8","#EEEEEE","#FDFFC2","#EEEEEE","#E4C59E","#F4EEFF"];

const root = document.documentElement;
function colorChange(){
  setColor((themeId+1)%background.length);
}

function setColor(id){
    themeId = id;
    themeMemory = id;
    localStorage.setItem('themeId',id);
  root.style.setProperty('--background', background[id]);
  root.style.setProperty('--pseudo-black', pseudoBlack[id]);
  root.style.setProperty('--pseudo-white', pseudoWhite[id]);
  root.style.setProperty('--deep-highlight', deepHighlight[id]);
  root.style.setProperty('--light-highlight', lightHighlight[id]);
}


function tempColor(id){
  const previousColor = themeId;
  setColor(id);
  themeMemory = previousColor;
}

function restoreColor(){
  setColor(themeMemory);
}