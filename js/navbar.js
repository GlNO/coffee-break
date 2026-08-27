

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