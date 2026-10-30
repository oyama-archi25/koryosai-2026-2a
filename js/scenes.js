(()=>{
const scene=document.querySelector('#hero-scene');
[2,1,3].forEach(pose=>{const figure=createCharacterFigure(masterCharacters[pose]);figure.classList.add('cover-person');scene.append(figure)});
document.querySelectorAll('[data-step-art]').forEach(el=>{const n=Number(el.dataset.stepArt),pose=n===0?2:n===1?1:9;const figure=createCharacterFigure(masterCharacters[pose]);figure.querySelector('img').loading='lazy';el.replaceChildren(figure)});
})();
