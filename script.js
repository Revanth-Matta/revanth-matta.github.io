function activateSkillBars(){document.querySelectorAll(".skill").forEach(skill=>skill.classList.add("visible"))}
const filterButtons=document.querySelectorAll(".filter-btn");const projectCards=document.querySelectorAll(".project-card");
filterButtons.forEach(button=>{button.addEventListener("click",()=>{filterButtons.forEach(item=>item.classList.remove("active"));button.classList.add("active");const filter=button.dataset.filter;projectCards.forEach(card=>{const categories=card.dataset.category.split(" ");const show=filter==="all"||categories.includes(filter);card.style.display=show?"block":"none"})})});
document.addEventListener("DOMContentLoaded",activateSkillBars);
