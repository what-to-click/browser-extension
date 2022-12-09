const path = document.location.href;
const imgs = decodeURIComponent(path.split('imgs=')[1]);
console.debug({ imgs });
document.body.innerHTML = imgs;