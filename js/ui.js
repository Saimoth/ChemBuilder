"use strict";

let toastTimer = 0;

function showToast(text) {
  toastEl.textContent = text;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1200);
}

function clearAll() {
  atoms = [];
  bonds = [];
  dragged = null;
  lastTapAtom = null;
  lastTapTime = 0;
  bondCycleIndex.clear();
  highlightedBond = null;
  updateReadout();
}

document.getElementById("clearBtn").addEventListener("click", clearAll);
document.getElementById("helpBtn").addEventListener("click", () => {
  document.getElementById("help").classList.add("open");
});
document.getElementById("closeHelp").addEventListener("click", () => {
  document.getElementById("help").classList.remove("open");
});
