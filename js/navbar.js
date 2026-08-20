

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
        })
        .catch(error => {
            console.error(error);
        });
}

const navbarPath = window.location.pathname.includes("/pages/")
    ? "../components/navbar.html"
    : "components/navbar.html";

loadComponent("navbar", navbarPath);