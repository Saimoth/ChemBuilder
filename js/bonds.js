"use strict";

function usedValence(a) {
  let total = 0;
  for (const current of bonds) {
    if (current.a === a || current.b === a) total += current.order;
  }
  return total;
}

function freeValence(a) {
  return ELEMENTS[a.type].valence - usedValence(a);
}

function findBond(a, b) {
  return bonds.find(current =>
    (current.a === a && current.b === b) ||
    (current.a === b && current.b === a)
  );
}

function upgradeNextBond(a) {
  if (freeValence(a) <= 0) {
    showToast(`${a.type} has no free valency`);
    return;
  }

  const attached = bonds.filter(current => current.a === a || current.b === a);
  if (!attached.length) {
    showToast("This atom has no bonded neighbours");
    return;
  }

  const eligible = attached.filter(current => {
    const neighbour = current.a === a ? current.b : current.a;
    return current.order < 3 && freeValence(neighbour) > 0;
  });

  if (!eligible.length) {
    showToast("No attached bond can be strengthened");
    return;
  }

  const previous = bondCycleIndex.get(a.id) ?? -1;
  const chosenIndex = (previous + 1) % eligible.length;
  const chosen = eligible[chosenIndex];
  bondCycleIndex.set(a.id, chosenIndex);
  chosen.order += 1;
  highlightedBond = chosen;
  highlightUntil = performance.now() + 520;
  navigator.vibrate?.(24);
  updateReadout();

  const neighbour = chosen.a === a ? chosen.b : chosen.a;
  const labels = ["", "single", "double", "triple"];
  showToast(`${a.type}–${neighbour.type} is now ${labels[chosen.order]}`);
}

function registerAtomTap(a) {
  const now = performance.now();
  if (lastTapAtom === a && now - lastTapTime <= DOUBLE_TAP_MS) {
    lastTapAtom = null;
    lastTapTime = 0;
    upgradeNextBond(a);
  } else {
    lastTapAtom = a;
    lastTapTime = now;
  }
}
