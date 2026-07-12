"use strict";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const formulaEl = document.getElementById("formula");
const nameEl = document.getElementById("compoundName");
const detailsEl = document.getElementById("details");
const toastEl = document.getElementById("toast");
const stage = document.getElementById("stage");

const DPR_LIMIT = 2;
const trayHeight = 106;
let viewW = 0;
let viewH = 0;
let dpr = 1;

const ELEMENTS = {
  C:{colour:"#42464f", text:"#fff", valence:4, radius:29},
  H:{colour:"#f0f2f5", text:"#111", valence:1, radius:15},
  O:{colour:"#e84d55", text:"#fff", valence:2, radius:23}
};
const palette = [{type:"C",dx:-82},{type:"H",dx:0},{type:"O",dx:82}];

let atoms = [];
let bonds = [];
let dragged = null;
let pointerDown = false;
let dragMoved = false;
let startPos = null;
let idCounter = 1;
let lastTapAtom = null;
let lastTapTime = 0;
const bondCycleIndex = new Map();
let highlightedBond = null;
let highlightUntil = 0;
const DOUBLE_TAP_MS = 360;

function resizeCanvas() {
  const rect = stage.getBoundingClientRect();
  viewW = rect.width;
  viewH = rect.height;
  dpr = Math.min(window.devicePixelRatio || 1, DPR_LIMIT);
  canvas.width = Math.round(viewW * dpr);
  canvas.height = Math.round(viewH * dpr);
  canvas.style.width = viewW + "px";
  canvas.style.height = viewH + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resizeCanvas, {passive:true});
window.addEventListener("load", () => {
  resizeCanvas();
  updateReadout();
  frame();
}, {once:true});
