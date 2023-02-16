export function deleteStep(index = -1) {
  const step = document.querySelector(`[wtc-step-index="${index}"]`);
  step.remove();
  recountIndexes();
}

function recountIndexes() {
  const steps = document.querySelectorAll('.step');
  let index = 1;
  for (const step of steps) {
    step.querySelector('.index').innerText = index;
    index++;
  }
}