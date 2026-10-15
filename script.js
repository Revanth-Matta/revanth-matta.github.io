function activateSkillBars(){document.querySelectorAll(".skill").forEach(skill=>skill.classList.add("visible"))}
const filterButtons=document.querySelectorAll(".filter-btn");const projectCards=document.querySelectorAll(".project-card");
filterButtons.forEach(button=>{button.addEventListener("click",()=>{filterButtons.forEach(item=>item.classList.remove("active"));button.classList.add("active");const filter=button.dataset.filter;projectCards.forEach(card=>{const categories=card.dataset.category.split(" ");const show=filter==="all"||categories.includes(filter);card.style.display=show?"block":"none"})})});
document.addEventListener("DOMContentLoaded",activateSkillBars);

/* Achievement image lightbox */
const achievementImages=document.querySelectorAll(".achievement-image");
const achievementLightbox=document.getElementById("achievementLightbox");
const lightboxImage=document.getElementById("lightboxImage");
const lightboxCaption=document.getElementById("lightboxCaption");
const lightboxClose=document.getElementById("lightboxClose");

function openLightbox(image){
  lightboxImage.src=image.dataset.full||image.src;
  lightboxImage.alt=image.alt;
  lightboxCaption.textContent=image.alt;
  achievementLightbox.classList.add("open");
  document.body.style.overflow="hidden";
}

function closeLightbox(){
  achievementLightbox.classList.remove("open");
  lightboxImage.src="";
  lightboxCaption.textContent="";
  document.body.style.overflow="";
}

achievementImages.forEach(image=>{
  image.addEventListener("click",()=>openLightbox(image));
});

lightboxClose.addEventListener("click",closeLightbox);

achievementLightbox.addEventListener("click",event=>{
  if(event.target===achievementLightbox){
    closeLightbox();
  }
});

document.addEventListener("keydown",event=>{
  if(event.key==="Escape"&&achievementLightbox.classList.contains("open")){
    closeLightbox();
  }
});
