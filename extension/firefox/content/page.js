const tagToName = {
  'BUTTON': 'button',
  'A': 'link',
  'INPUT': 'input field',
};

async function main() {
  const sessionId = new URLSearchParams(window.location.href.split('?')[1]).get('s');
  const images = await browser.runtime.sendMessage({ type: 'fetchImages', data: { session: sessionId } });
  const steps = images.map(({ image, target }, index) => `
    <div class="step" data-step-index="${index + 1}">
      <p class="step-description">
        <span class="text-content">
          <span class="index">${index + 1}</span> 
          <span contenteditable class="content">Click <i>${target.innerText}</i>${tagToName[target.tagName] ? ` ${tagToName[target.tagName]}` : ''}.</span>
        </span>
        <button class="text-button delete-button">Remove step</button>
      </p>
      <div class="step-image">
        <img class="screenshot" src="${image}">
        <img class="cursor" src="${cursorPng}">
      </div>
    </div>`
  );
  const parser = new DOMParser();
  const stepElements = steps.map((html) => parser.parseFromString(html, 'text/html').querySelector('.step'));
  const content = document.querySelector('.steps');
  stepElements.forEach((step, index) => step.addEventListener('click', () => deleteStep(index + 1)));
  stepElements.forEach((step) => content.appendChild(step));
}
main();

async function savePdf() {
  document.querySelector('.export').classList.add('hidden');
  await browser.runtime.sendMessage({ type: 'savePdf' });
  document.querySelector('.export').classList.remove('hidden');
}

function saveHtml() {
  document.location = `data:text/attachment;,
  <!DOCTYPE html>
  ${encodeURIComponent(document.querySelector('html').innerHTML.replace(/^.*<section class="export"[\s\S]*?<\/section>/m, ''))}
  `;
}

function deleteStep(index = -1) {
  const step = document.querySelector(`[data-step-index="${index}"]`);
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

window.addEventListener('load', () => {
  document.getElementById('exportPdf').addEventListener('click', savePdf);
  document.getElementById('saveHtml').addEventListener('click', saveHtml);
});

const cursorPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJAAAACQCAYAAADnRuK4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAMWUlEQVR4nO2deVAU2RnAMRVzVTap2pjUbuXaSsxWrt1KgnSPeOA13QNCv0EcPFC80RUvPND1AERZRZEeFA88EJgGFJjG+4iuuhrvVZQVrxWZqt3s8ce6tYm6ru76Um+Mxmi/ftM42HN8v6rvT7qd936+97q/772OiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAILApKSlpX6TUDXW63Lucivqp7HLfdyoqfjLmF5fiwenTsZA8DHeJT7rHCVILJyIlSkSi2b8BMIllFVs7Ol3uBi1hHo8R0+dhi4gwTwkiUrQkvQAdGUYsq6l5UXa5r7HkGTV9HlWc/w+pISou7iWzfxfwnJAVNZclT16JC3eOTfRRIG9ctwgJHaETwwCnon7EEih18ptG5HkQgvSRJRa9ZvbvA9qQQpf7ZZY8JBJSxxoX6MF09jlvs3eFTgxRllfW/d4XgXr1G6wpyJFjx/GchfmMkQjd4q32WLN/K9AGFFbV/skXgXrYB2rK0XC+EXs8Hly0Zr2uRJyI7vEiGg6dGGL4SyASazZW4M42u55I93lRmmr2bwYCVCASyuY6HB2n/7TGidJi6MQQwd8CkXBv24m7xffXl0iQVkZkZ3/L7N8PBKBAJPYdPIR79xvEesyvioxMaw+dGMS0lUAkDh89jm0DUlkS7YfURxDTlgKROPXuGYyGjmY95p+KjI/vYHZbAAEoEIlzjY04edQbLImaOFviL6ATg4znIRCJpouX8LD0DNbCuiUq1v6q2W0CBKBAJK5cvYrHTpvFeuH4SWeb9FfoxCDheQpEorm5GWfm5LHeE/3bIkp9zG4bIAAFItHS0oJzlzoZ0xm6wwsoCToxwDFDoIfBzJ8J0tecDY0yu42AABWIxNpyhZk/40RpBnRigGK2QCQqa1Vf82ftzG4vIAAFIrF9z99xjJSs/65IRGUxMTHfhk4MIAJFIBJvHzqMrUkprBeOW2JiYr5ndrsBASgQiX8cP4HjBg5jjUQHOJvtR9CJAUCgCUTi9Jmz2M7Kn4nodFeb46dmt1/YE4gCkTjf+B4eMDqd9db6UicB/TLsO9FMAlUgEpcvX8Gjp2SyJPpnJ2vin0EiEEhTomvXruGJs7JYj/ifcbYEC0gEI5CmRNevX8dv5i5irYlucla7ABLBFEbNn+UtW854xJe+4mySAySCNZBu/syik/og+TNekMaARLCIpkpUXl2Do+P66ebPeBHlgERh/hSmF3Vbt+OuzK1DqAi2DoFAmCbRzr37cA80gLUuqoD8GYxAWC9/1idpMOsxf5vF4fg+TGkwhWEtiY6dOMnMn3GCdCiyj+PHIBGsgbCWRA3nzmPHyHGsNdGZztbEn4FEsIjGWhJdaLqIh4ybzHjhKDVH2+y/BYnC/CnMQ8ufXbmCx2RkMo/e420Jr4NEIBDWzJ81N+Mps3NY09mNzgKKBolgBMK0/Nls1tF7IrppERJsIBFMYZiWPysoXsPMn/FWaSBIBGsgTFsXrS4tZ28dEtAUkAgW0ZgmUcWmWlb+DI7eA4E8uk9o7q07mEfv8QIqhvxZGD/Gexixe9/buKedkT8TpUo4eg8EwjSJDh4+gq39mfvPdkTGx/8A1kUwAmEtiU6ePoOlIaMYayJ0Iqq3/ScgEUxhWEsiMv06RjKP3rtg6dv35yARrIGwlkRNFy/ioeOnsDL5LXyfvr8DiWARjWn5s7Sp+kfv8QL6OMqK/gIShflTmEcvfzZHP38Gn66CEQizUh/zlxSykrB3omxSIoxEMAJhmkhLlq9ijUR3owQ0GCSCKQzTJCopczHyZ9JdTpB6hr1EsAbyUCVyba5lHb13PezfWINAHt11kbp9J+6e4KBKFPZTGQjkYT6h7T/4Dn3rkCCtD+tpDATy+PSYX1Wr0tZCeyPCGRDI86gElrzTOnTkKK7fscu7/965Zh3OyS/0vh+ijUBk02JEOBPqAl19/31v4nTP/gPeeqD1FVXeMtc5efl4/IzZODU9A0tDRjKLzXTeUM+MCGeCWaBjJ056D1kgp917pViYj9Mz53r3hvUdNBx36ZvUOil8DO/3PET0SkQ4E8wClVfXtKkgbIESJkSEO8EsUHPzdV/OlPa/OCK6x4tontl9FxAEs0AejwevXF/2PMX5khdQTSdbfJTZ/RYwBJJA5Fhfsug1+je9WZ8X91kQ6TPvt1sF6SCpi+ZFSeZElMkJUio5wBNOxw9ggRovXMApYyfhUqXa8N8uXbFaT4wvOZu9hROlo7wo1ZNdF5wgZfGCPY0XJYkcD0wOK7fZbN99/v99Q4BAEOjdsw04cVia93rkiBZSVmFUvu60dAPZpgOErkBHjz99ONS2XXsMXyc7fxl13RIVF/cSOBSCAu0/pJ1jemP6bMPXOtNwjpo55wS0AAQKMYG27dpL/cAcqcM5fuq04WtOz1pAE+hGtCS9ABKFiEAkMdmFkTrIWlRg+LqHjx6jH0IuoGkgUAgIxK70exAxKBk3XbxkWCIy/WkLJH3wR4fjOyBREAvE+sz3k7FibWmr9r5T3/MI0kgQKAgFIo/luUtlQ/KQIAnR5uZmwxKRDDtlGrsMJ28EmUC+7LfqEkfPmm9ybzEsEMnQ064HW3KCSCBfdnzG2Afi7OXrcFyK9jdSh6VnGBaIjHjUM6MFdMrfbRjWtJVAvuw575WUghesLvNeP2Oh9otAXkTezxn4udSjh9ntHjK0hUC+nHohJA/Db61VHl1frqjDPftpl41Oz1rQqlIPsobSXEyLaLfZ7R4y+FsgUiVI67iHEZsyCudvqH7qHmmztNdK0XGJ3jfNRiVataGc+m+wiPF/M7vtQwJ/CuTLl3MSR6bjgvIazXssKa3GXfpqn2GYX7TKsEBkDWZNopxEJkhVZrd9SOAvgXz5dle/0RO+KKxw694nZcIMzb+1JqUYrhXSK/Ugn8a0CAkdzW7/oMcfAtVuYX89kBfRisJy90TWfXJXbaSmI0pbUSv03oUm71ttikQrzW7/oMdZXvMrXwQii16tThiTMZN9iLeIZpN7FdfU/NCpuD9n3cs+QnsB7mhFrRAJsreLItBt+PzTM1JSUtJedqlfszo1afRE1gijOU1wIhr7+P1kl7qUda+Z+Suo19y+e69/Sz1EtPBZ2zDscbrUPaxOnZSTb1AedIcXUNKTjVus1P3a6XLf07uX7HJja3Kq5nXHzzBeK0RiRvZC2r8TSj2eFdlV38OpqN/odSpZ/PZmna38v075F2dN6EW7n1NRa1nCTpi3iF4rdPKUYYGg1KONkV3qVNnlvq+7wF25kbqYfhQC+pgX7JF693JWql1ZAhWUbcbdErQXv9mLl7VqFCKjF0X4D6HUww84XfW9ZUU9rtexeWsq8IBxGU8/KQnoFieitRbB8aJP91LU0yyJRkyd49daId1SDxsa5Y82BP77ZFZU4bbJijqmqLI+TStyi8syxs7MkQeMn/KWxWaPMfpZbadLHcISKK/EhS2x2ovf4nUbWzUK0Uo9OBFdglKPYHv6U9QPWBI50ib7tVaInNBBG4Wg1CPIkBV1LkugufIav9YKQalHCFFQua2D06XeZkkU58daIVapB5y8GmTILvd6lkAZOrVCB9454tdSD15EZWa3CWCAZUr9a6zXB4UVbtzDPshvtUIkVm3QPtWDE9EnsJgOMmTFvZ81CqVRaoXI/rLW7E0jpR7UUz362P9gdpsABnAqajxLoPwN1dRzDI3WChF5yLlCvRK1X4pGiokvQwcGERjjdk7FfZklUcpE7VohUsTmS63QucZG71mKvRJ1zhMSpK9gCgtCnBXqBJZA84tL6bVClZt0v5E6bV4u67MFD6PW7LYAWoG/a4VaWlq8pR+0/BflEf522J+6GszILrWAJVCmTq2QsrnOO5WRs6AfHljlcwjoC84q9Te7DYBnQK6uf4VV3CaTWiGHdq0QCV8ObtAYeY506t3vN9B5IYBPtULZiw1LorFY/oYX0JYoq9Td7N8M+BFnVe3rsqLe1X+xWOdzcZvGVHWLF9DqqFj7q9BxIYqsuCexRqGsonXUPWSa05QofcqLKCcyPr6D2b8PeA7ISv1w2eW+oZupd5ZQt0M/NuJcIMVicIxvmD7ay4p7kuxSdzoV9UMticgu1/Hz8ry7RrpJyeQTBDc5AZ0lO095qz02IiKindm/AwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIgIJf4DDx8tGuPIYGgAAAAASUVORK5CYII=';