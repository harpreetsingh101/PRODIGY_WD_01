// Select the navbar
const navbar = document.querySelector('.navbar');

// Listen for scroll event
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.backgroundColor = '#121212';
    } else {
        navbar.style.backgroundColor = '#1e1e2f';
    }
});
