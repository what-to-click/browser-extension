import { download } from "./common/download.js";
import { applyScrubs, removeScrubs } from "./common/scrubs.js";

export async function saveMarkdown() {
  document.querySelectorAll('.screenshot').forEach(applyScrubs);
  const title = document.querySelector('h1').innerText;
  var markdown = `# ${title}\n\n`;
  document.querySelectorAll('.step').forEach((el, index) => {
    let image = el.querySelector('.step-image .screenshot');
    let description = el.querySelector('.step-description .content');

    markdown += `${index + 1}. ${description.textContent}`
    if (image != undefined && image != null) {
      markdown += `\n ![${description.textContent.split(`\n`)[0] + '...'}](${image.src})\n\n`;
    } else {
      markdown += `\n\n`;
    }
  })

  download(`What to click ${new Date().toDateString()}.md`, markdown, { type: 'text/markdown' });
  await removeScrubs();
}
