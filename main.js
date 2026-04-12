async function inicializujWeb() {
  try {
    const [headerRes, footerRes] = await Promise.all([
      fetch("header.html"),
      fetch("footer.html"),
    ]);

    document.getElementById("header-placeholder").innerHTML =
      await headerRes.text();
    document.getElementById("footer-placeholder").innerHTML =
      await footerRes.text();

    const hamburger = document.getElementById("hamburger");
    const nav = document.getElementById("nav");
    if (hamburger && nav) {
      hamburger.addEventListener("click", () => nav.classList.toggle("open"));
    }
  } catch (error) {
    console.error("Chyba při načítání komponent:", error);
  }
}
window.addEventListener("DOMContentLoaded", inicializujWeb);

const gallery = document.getElementById("gallery");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const closeBtn = document.querySelector(".close");
const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");

let currentIndex = 0;
const images = Array.from(document.querySelectorAll(".gallery-item img"));

// Otevření lightboxu
images.forEach((img, index) => {
  img.parentElement.addEventListener("click", () => {
    openLightbox(index);
  });
});

function openLightbox(index) {
  currentIndex = index;
  lightbox.style.display = "flex";
  lightboxImg.src = images[currentIndex].getAttribute("data-full");
}

// Funkce pro změnu obrázku
function changeImage(step) {
  currentIndex = (currentIndex + step + images.length) % images.length;
  lightboxImg.src = images[currentIndex].getAttribute("data-full");
}

// Zavření
closeBtn.onclick = () => (lightbox.style.display = "none");
lightbox.onclick = (e) => {
  if (e.target === lightbox) lightbox.style.display = "none";
};

// Ovládání šipkami a klávesnicí
prevBtn.onclick = (e) => {
  e.stopPropagation();
  changeImage(-1);
};
nextBtn.onclick = (e) => {
  e.stopPropagation();
  changeImage(1);
};

document.addEventListener("keydown", (e) => {
  if (lightbox.style.display === "flex") {
    if (e.key === "ArrowLeft") changeImage(-1);
    if (e.key === "ArrowRight") changeImage(1);
    if (e.key === "Escape") lightbox.style.display = "none";
  }
});
