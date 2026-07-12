"use strict";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const formulaEl = document.getElementById("formula");
const nameEl = document.getElementById("compoundName");
const detailsEl = document.getElementById("details");
const toastEl = document.getElementById("toast");
const stage = document.getElementById("stage");

if (!ctx) {
  throw new Error("This browser does not support the HTML canvas element.");
}

// Safari and older mobile browsers may not provide CanvasRenderingContext2D.roundRect.
// The renderer uses it for panels during the first frame, so provide a compatible fallback.
if (typeof ctx.roundRect !== "function") {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius = 0) {
    let r = Array.isArray(radius) ? Number(radius[0] || 0) : Number(radius || 0);
    r = Math.max(0, Math.min(r, Math.abs(width) / 2, Math.abs(height) / 2));
    const right = x + width;
    const bottom = y + height;

    this.moveTo(x + r, y);
    this.lineTo(right - r, y);
    this.quadraticCurveTo(right, y, right, y + r);
    this.lineTo(right, bottom - r);
    this.quadraticCurveTo(right, bottom, right - r, bottom);
    this.lineTo(x + r, bottom);
    this.quadraticCurveTo(x, bottom, x, bottom - r);
    this.lineTo(x, y + r);
    this.quadraticCurveTo(x, y, x + r, y);
    this.closePath();
    return this;
  };
}

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
  canvas.width = Math.max(1, Math.round(viewW * dpr));
  canvas.height = Math.max(1, Math.round(viewH * dpr));
  canvas.style.width = viewW + "px";
  canvas.style.height = viewH + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

let chemBuilderStarted = false;
function startChemBuilder() {
  if (chemBuilderStarted) return;
  chemBuilderStarted = true;
  resizeCanvas();
  updateReadout();
  frame();
}

window.addEventListener("resize", resizeCanvas, {passive:true});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startChemBuilder, {once:true});
} else {
  startChemBuilder();
}
