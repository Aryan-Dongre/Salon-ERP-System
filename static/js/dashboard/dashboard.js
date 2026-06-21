const toggleBtn =
document.getElementById("toggle-btn");

const sidebar =
document.getElementById("sidebar");

const overlay =
document.getElementById("sidebar-overlay");

const mainContent =
document.querySelector(".main-content");

// Toggle Sidebar
toggleBtn.addEventListener("click", () => {

    // Mobile / Tablet
    if(window.innerWidth <= 1024){

        sidebar.classList.toggle("open");
        overlay.classList.toggle("active");
    }

    // Desktop
    else{

        sidebar.classList.toggle("closed");
        mainContent.classList.toggle("expand");
    }
});

// Close sidebar on overlay click
overlay.addEventListener("click", () => {

    sidebar.classList.remove("open");
    overlay.classList.remove("active");
});

// Auto close on resize
window.addEventListener("resize", () => {

    if(window.innerWidth > 1024){

        sidebar.classList.remove("open");
        overlay.classList.remove("active");
    }
});