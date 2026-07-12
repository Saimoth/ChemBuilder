"use strict";

function pointFromEvent(event) {
  const rect = canvas.getBoundingClientRect();
  const point = event.touches ? event.touches[0] : event;
  return {x:point.clientX-rect.left, y:point.clientY-rect.top};
}

function nearestAtom(point, extra=12) {
  for (let i=atoms.length-1; i>=0; i--) {
    const a = atoms[i];
    if (Math.hypot(a.x-point.x,a.y-point.y) <= ELEMENTS[a.type].radius+extra) return a;
  }
  return null;
}

function begin(event) {
  event.preventDefault();
  const point = pointFromEvent(event);
  pointerDown = true;
  dragMoved = false;
  startPos = point;

  const hit = nearestAtom(point);
  if (hit) {
    dragged = hit;
    return;
  }

  if (point.y > viewH-trayHeight) {
    const centreX = viewW/2;
    const paletteY = viewH-trayHeight/2;
    for (const item of palette) {
      if (Math.hypot(point.x-(centreX+item.dx),point.y-paletteY) < 38) {
        dragged = atom(item.type,point.x,point.y);
        atoms.push(dragged);
        updateReadout();
        return;
      }
    }
  }
}

function move(event) {
  if (!pointerDown || !dragged) return;
  event.preventDefault();
  const point = pointFromEvent(event);

  if (Math.hypot(point.x-startPos.x,point.y-startPos.y) > 5) dragMoved = true;
  dragged.x = point.x;
  dragged.y = point.y;
  dragged.vx = 0;
  dragged.vy = 0;

  for (const target of atoms) {
    if (target === dragged) continue;
    const distance = Math.hypot(target.x-dragged.x,target.y-dragged.y);
    const existing = findBond(dragged,target);

    if (!existing && distance < 58 && freeValence(dragged) > 0 && freeValence(target) > 0) {
      bonds.push(bond(dragged,target,1));
      updateReadout();
      navigator.vibrate?.(18);
    } else if (existing && distance > 150) {
      bonds = bonds.filter(current => current !== existing);
      updateReadout();
    }
  }
}

function end(event) {
  if (!pointerDown) return;
  event.preventDefault();

  const tappedAtom = !dragMoved && dragged ? dragged : null;
  if (dragged && dragged.y > viewH-trayHeight+12) {
    const doomed = dragged;
    atoms = atoms.filter(a => a !== doomed);
    bonds = bonds.filter(current => current.a !== doomed && current.b !== doomed);
    bondCycleIndex.delete(doomed.id);
    if (lastTapAtom === doomed) lastTapAtom = null;
    updateReadout();
  } else if (tappedAtom) {
    registerAtomTap(tappedAtom);
  }

  dragged = null;
  pointerDown = false;
  startPos = null;
}

canvas.addEventListener("pointerdown", begin, {passive:false});
canvas.addEventListener("pointermove", move, {passive:false});
canvas.addEventListener("pointerup", end, {passive:false});
canvas.addEventListener("pointercancel", end, {passive:false});
