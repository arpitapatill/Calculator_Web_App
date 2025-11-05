const exprEl = document.getElementById("expression");
const resultEl = document.getElementById("result");
const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistory");
const themeToggle = document.getElementById("themeToggle");

let expression = "";
let radMode = false;
let history = JSON.parse(localStorage.getItem("sci_history") || "[]");

/* Theme */
(function(){
  const saved = localStorage.getItem("theme");
  if(saved === "light"){
    document.documentElement.classList.add("light");
    themeToggle.textContent = "☀️";
  }
})();
themeToggle.onclick = ()=>{
  document.documentElement.classList.toggle("light");
  let isLight = document.documentElement.classList.contains("light");
  localStorage.setItem("theme", isLight ? "light":"dark");
  themeToggle.textContent = isLight ? "☀️" : "🌙";
};

/* RENDER */
function render(){
  exprEl.textContent = expression || "0";

  if (!expression) {
    resultEl.textContent = "0";
    return;
  }

  try{
    let r = evalScientific(expression);
    resultEl.textContent = Number.isFinite(r) ? +r.toFixed(8) : "0";
  }catch{
    resultEl.textContent = "0";
  }
}

/* SAFE EVAL */
function evalScientific(expr){
  let e = expr;

  e = e.replace(/sin\(/g,"Math.sin(")
       .replace(/cos\(/g,"Math.cos(")
       .replace(/tan\(/g,"Math.tan(")
       .replace(/sqrt\(/g,"Math.sqrt(")
       .replace(/ln\(/g,"Math.log(")
       .replace(/log\(/g,"Math.log10(")
       .replace(/abs\(/g,"Math.abs(");

  e = e.replace(/π/g,"Math.PI").replace(/e/g,"Math.E");

  e = e.replace(/(\d+)!/g,(m,n)=> factorial(Number(n)));

  e = e.replace(/(\b[\d.]+\b)\^(\b[\d.]+\b)/g,"Math.pow($1,$2)");

  if(!radMode){
    e = e.replace(/Math\.sin\((.*?)\)/g,"Math.sin(($1)*Math.PI/180)");
    e = e.replace(/Math\.cos\((.*?)\)/g,"Math.cos(($1)*Math.PI/180)");
    e = e.replace(/Math\.tan\((.*?)\)/g,"Math.tan(($1)*Math.PI/180)");
  }

  e = e.replace(/%/g,"/100");

  return Function("return " + e)();
}

function factorial(n){
  if(n < 0) return 0;
  let r=1;
  for(let i=1;i<=n;i++) r*=i;
  return r;
}

/* BUTTON HANDLER */
document.querySelectorAll("button").forEach(btn=>{
  btn.onclick = ()=>{

    const v = btn.dataset.value;
    const fn = btn.dataset.fn;
    const act = btn.dataset.action;

    if(btn.id === "radDeg"){
      radMode = !radMode;
      btn.textContent = radMode ? "RAD" : "DEG";
      return;
    }

    if(fn){ return applyFn(fn); }

    if(act === "ac"){ expression=""; render(); return; }

    if(act === "clear"){ expression = expression.slice(0,-1); render(); return; }

    if(act === "backspace"){ expression = expression.slice(0,-1); render(); return; }

    if(act === "equals"){ calculate(); return; }

    if(v){ expression += v; render(); }
  };
});

/* APPLY SCI FUNCTIONS */
function applyFn(fn){
  let x = expression || "0";

  const map = {
    sin:`sin(${x})`,
    cos:`cos(${x})`,
    tan:`tan(${x})`,
    sqrt:`sqrt(${x})`,
    ln:`ln(${x})`,
    log:`log(${x})`,
    pow2:`(${x})^2`,
    pow3:`(${x})^3`,
    exp:`exp(${x})`,
    inv:`1/(${x})`,
    abs:`abs(${x})`,
    fact:`${x}!`
  };
  expression = map[fn];
  render();
}

/* CALCULATE */
function calculate(){
  try{
    let r = evalScientific(expression);
    r = Number.isFinite(r) ? +r.toFixed(8) : 0;

    history.push(`${expression} = ${r}`);
    localStorage.setItem("sci_history", JSON.stringify(history));
    renderHistory();

    expression = String(r);
    render();
  }catch{
    resultEl.textContent="0";
  }
}

/* HISTORY */
function renderHistory(){
  historyList.innerHTML = "";
  if(history.length === 0){
    historyList.innerHTML = "<li style='opacity:0.5'>No history</li>";
    return;
  }

  history.slice().reverse().forEach(item=>{
    const li=document.createElement("li");
    li.textContent=item;
    li.onclick=()=>{
      expression=item.split("=")[1].trim();
      render();
    };
    historyList.appendChild(li);
  });
}

clearHistoryBtn.onclick = ()=>{
  history=[];
  localStorage.removeItem("sci_history");
  renderHistory();
};

renderHistory();
render();

/* MODE SWITCH */
document.getElementById("modeStandard").onclick = ()=>{
  document.getElementById("scientificPad").classList.add("hidden");
  document.getElementById("modeStandard").classList.add("active");
  document.getElementById("modeScientific").classList.remove("active");
};

document.getElementById("modeScientific").onclick = ()=>{
  document.getElementById("scientificPad").classList.remove("hidden");
  document.getElementById("modeScientific").classList.add("active");
  document.getElementById("modeStandard").classList.remove("active");
};
