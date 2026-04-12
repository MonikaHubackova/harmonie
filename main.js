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

// --- SPOLEČNÁ LOGIKA LIGHTBOXU ---
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const closeBtn = document.querySelector(".close");
const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");

let currentIndex = 0;
let allImages = [];

// --- UPRAVENÁ FUNKCE V main.js ---
function updateImageListeners() {
  // Vybereme všechny obrázky z obou sekcí
  allImages = Array.from(
    document.querySelectorAll(".gallery-item img, .carousel-img"),
  );

  allImages.forEach((img, index) => {
    // Místo parentElement přidáme click přímo na obrázek (img)
    // To zajistí funkčnost pro galerii i carousel bez ohledu na HTML strukturu
    img.style.cursor = "pointer"; // Pro jistotu vynutíme kurzor ruky

    img.onclick = (e) => {
      // Kontrola, zda nejde o drag v carouselu
      if (typeof isDragging !== "undefined" && isDragging) return;

      e.preventDefault();
      e.stopPropagation();
      openLightbox(index);
    };
  });
}

function openLightbox(index) {
  currentIndex = index;
  lightbox.style.display = "flex";
  // Použijeme data-full pokud existuje, jinak src
  const source =
    allImages[currentIndex].getAttribute("data-full") ||
    allImages[currentIndex].src;
  lightboxImg.src = source;
}

function changeImage(step) {
  currentIndex = (currentIndex + step + allImages.length) % allImages.length;
  const source =
    allImages[currentIndex].getAttribute("data-full") ||
    allImages[currentIndex].src;
  lightboxImg.src = source;
}

// Ovládání lightboxu
closeBtn.onclick = () => (lightbox.style.display = "none");
lightbox.onclick = (e) => {
  if (e.target === lightbox) lightbox.style.display = "none";
};
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

// --- LOGIKA CAROUSELU ---
const track = document.getElementById("carouselTrack");
const viewport = document.getElementById("viewport");

if (track && viewport) {
  const content = track.innerHTML;
  track.innerHTML = content + content + content;

  updateImageListeners();

  let speed = 0.15;
  let scrollPos = 0;
  let isDragging = false;
  let startX, scrollLeft;
  let autoScroll = true;

  function animate() {
    if (autoScroll && !isDragging) {
      scrollPos -= speed;
      const trackWidth = track.scrollWidth / 3;
      if (Math.abs(scrollPos) >= trackWidth) {
        scrollPos = 0;
      }
      track.style.transform = `translateX(${scrollPos}px)`;
    }
    requestAnimationFrame(animate);
  }
  animate();

  // Pomocná funkce pro získání aktuální X pozice z CSS transformace
  function getCurrentTranslateX() {
    const style = window.getComputedStyle(track);
    const matrix = new WebKitCSSMatrix(style.transform);
    return matrix.m41;
  }

  // Mouse events
  viewport.addEventListener("mousedown", (e) => {
    isDragging = false;
    autoScroll = false; // Zastavíme auto-scroll
    startX = e.pageX - track.offsetLeft;
    scrollLeft = scrollPos;

    const onMouseMove = (moveEvent) => {
      const x = moveEvent.pageX - track.offsetLeft;
      const walk = x - startX;

      if (Math.abs(walk) > 5) {
        isDragging = true;
      }

      scrollPos = scrollLeft + walk;
      limitScroll();
      track.style.transform = `translateX(${scrollPos}px)`;
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);

      // KLÍČOVÁ OPRAVA: Synchronizace scrollPos s realitou po puštění
      scrollPos = getCurrentTranslateX();

      // Krátký timeout zajistí, že se nejdřív vyhodnotí kliknutí (pro lightbox)
      // a pak se teprve spustí animace
      setTimeout(() => {
        isDragging = false;
        autoScroll = true;
      }, 10);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  });

  // Touch events (mobily)
  viewport.addEventListener(
    "touchstart",
    (e) => {
      isDragging = false;
      autoScroll = false;
      startX = e.touches[0].pageX - track.offsetLeft;
      scrollLeft = scrollPos;
    },
    { passive: true },
  );

  viewport.addEventListener(
    "touchmove",
    (e) => {
      const x = e.touches[0].pageX - track.offsetLeft;
      const walk = x - startX;
      if (Math.abs(walk) > 5) isDragging = true;

      scrollPos = scrollLeft + walk;
      limitScroll();
      track.style.transform = `translateX(${scrollPos}px)`;
    },
    { passive: true },
  );

  viewport.addEventListener("touchend", () => {
    scrollPos = getCurrentTranslateX();
    setTimeout(() => {
      isDragging = false;
      autoScroll = true;
    }, 10);
  });

  function limitScroll() {
    const trackWidth = track.scrollWidth / 3;
    if (scrollPos > 0) scrollPos -= trackWidth;
    if (scrollPos < -trackWidth) scrollPos += trackWidth;
  }
} else {
  // Pokud na stránce není carousel, inicializujeme aspoň galerii
  updateImageListeners();
}
