

function loadComponent(id, file) {
    fetch(file)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Could not load ${file}`);
            }

            return response.text();
        })
        .then(data => {
            document.getElementById(id).innerHTML = data;

            const isCollectionsPage = window.location.pathname.includes("/pages/");
            const homePath = isCollectionsPage ? "../index.html" : "./index.html";
            const collectionsPath = isCollectionsPage ? "./collections.html" : "./pages/collections.html";
            const appNameLink = document.querySelector(".app-name");
            const navLinks = document.querySelectorAll(".nav-links a");

            if (appNameLink) appNameLink.href = homePath;
            if (navLinks[0]) navLinks[0].href = homePath;
            if (navLinks[1]) navLinks[1].href = collectionsPath;

            const currentPath = window.location.pathname.replace(/\\/g, "/");
            const currentPage = currentPath.endsWith("/") ? "/index.html" : currentPath;

            document.querySelectorAll(".nav-links a").forEach(link => {
                const linkPath = new URL(link.href, window.location.href).pathname.replace(/\\/g, "/");
                const normalizedLinkPath = linkPath.endsWith("/") ? "/index.html" : linkPath;
                const isCurrentPage = normalizedLinkPath === currentPage;

                link.classList.toggle("is-active", isCurrentPage);
                if (isCurrentPage) {
                    link.setAttribute("aria-current", "page");
                }
            });
        
            const savedName = localStorage.getItem("coffee-break-customer-name");
            const settingsButton = document.querySelector("#settings-button");
        
            if (savedName && settingsButton) {
                const displayName = savedName
                    .trim()
                    .toLowerCase()
                    .replace(/\b\w/g, letter => letter.toUpperCase());
        
                settingsButton.textContent = `Hi, ${displayName}`;
            }
        })
        .catch(error => {
            console.error(error);
        });
}

const navbarPath = window.location.pathname.includes("/pages/")
    ? "../components/navbar.html"
    : "components/navbar.html";

loadComponent("navbar", navbarPath);