import { applyScrubs, removeScrubs } from "./common/scrubs.js";

export async function asJson() {
  document.querySelectorAll('.screenshot').forEach(applyScrubs);
  const title = document.querySelector('h1').innerText;
  const steps = [...document.querySelectorAll('.step')].map((stepElement) => {
    const description = stepElement.querySelector('.content').innerHTML;
    const screenshot = (stepElement.querySelector('.screenshot') || {}).src || null;
    return { description, screenshot };
  });

  await removeScrubs();
  return { title, steps };
}
