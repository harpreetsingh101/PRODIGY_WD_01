// Elements
const entryScreen = document.getElementById("entry-screen");
const app = document.getElementById("app");
const enterBtn = document.getElementById("enter-btn");
const navLinks = document.querySelectorAll(".nav-link");

// Switch from entry screen to app
enterBtn.addEventListener("click", () => {
    entryScreen.classList.add("hidden");
    app.classList.remove("hidden");
});

// Active nav link on scroll
window.addEventListener("scroll", () => {
    let current = "";

    document.querySelectorAll("section").forEach(section => {
        const sectionTop = section.offsetTop - 140;
        if (scrollY >= sectionTop) {
            current = section.getAttribute("id");
        }
    });

    navLinks.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${current}`) {
            link.classList.add("active");
        }
    });
});
