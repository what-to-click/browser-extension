import { download } from "./common/download.js";
import { applyScrubs, removeScrubs } from "./common/scrubs.js";

export async function saveMarkdown() {
  document.querySelectorAll('.screenshot').forEach(applyScrubs);
  const title = document.querySelector('h1').innerText;
  const descriptions = [];
  document.querySelectorAll('.step-description .content').forEach((el) => descriptions.push(el.value));
  const screenshots = [];
  document.querySelectorAll('.step-image .screenshot').forEach((el) => screenshots.push(el.src));
  const markdown =
    `# ${title}

${descriptions.map((content, index) => `${index + 1}. ${content} \n ![${content}](${screenshots[index]})`).join('\n\n')}
    `;
  download(`What to click ${new Date().toDateString()}.md`, markdown, { type: 'text/markdown' });
  await removeScrubs();
}
