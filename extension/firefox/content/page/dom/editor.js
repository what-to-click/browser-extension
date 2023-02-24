export function deleteStep(index = -1) {
  const step = document.querySelector(`[wtc-step-index="${index}"]`);
  step.remove();
}