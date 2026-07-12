"use strict";

function physics() {
  for (const current of bonds) {
    const target = current.order === 1 ? 72 : current.order === 2 ? 64 : 58;
    let dx = current.b.x - current.a.x;
    let dy = current.b.y - current.a.y;
    const distance = Math.hypot(dx,dy) || 1;
    const force = (distance - target) * 0.014;
    const forceX = dx / distance * force;
    const forceY = dy / distance * force;

    if (current.a !== dragged) {
      current.a.vx += forceX;
      current.a.vy += forceY;
    }
    if (current.b !== dragged) {
      current.b.vx -= forceX;
      current.b.vy -= forceY;
    }
  }

  for (let i=0; i<atoms.length; i++) {
    for (let j=i+1; j<atoms.length; j++) {
      const a = atoms[i];
      const b = atoms[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distance = Math.hypot(dx,dy) || 1;
      const minimum = ELEMENTS[a.type].radius + ELEMENTS[b.type].radius + 13;

      if (distance < minimum) {
        const force = (minimum - distance) * 0.025;
        const forceX = dx / distance * force;
        const forceY = dy / distance * force;
        if (a !== dragged) {
          a.vx -= forceX;
          a.vy -= forceY;
        }
        if (b !== dragged) {
          b.vx += forceX;
          b.vy += forceY;
        }
      }
    }
  }

  for (const parent of atoms) {
    const neighbours = [];
    for (const current of bonds) {
      if (current.a === parent) neighbours.push(current.b);
      else if (current.b === parent) neighbours.push(current.a);
    }

    for (let i=0; i<neighbours.length; i++) {
      for (let j=i+1; j<neighbours.length; j++) {
        const a = neighbours[i];
        const b = neighbours[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distance = Math.hypot(dx,dy) || 1;

        if (distance < 112) {
          const force = (112 - distance) * 0.0025;
          const forceX = dx / distance * force;
          const forceY = dy / distance * force;
          if (a !== dragged) {
            a.vx -= forceX;
            a.vy -= forceY;
          }
          if (b !== dragged) {
            b.vx += forceX;
            b.vy += forceY;
          }
        }
      }
    }
  }

  for (const a of atoms) {
    if (a === dragged) continue;
    a.vx *= 0.82;
    a.vy *= 0.82;
    a.x += a.vx;
    a.y += a.vy;

    const radius = ELEMENTS[a.type].radius;
    a.x = Math.max(radius + 6, Math.min(viewW - radius - 6, a.x));
    a.y = Math.max(radius + 6, Math.min(viewH - trayHeight - radius - 7, a.y));
  }
}
