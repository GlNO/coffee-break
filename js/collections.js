const COLLECTION_STORAGE_KEY = "coffee-break-collection";
const DEFAULT_DRINK = "cappucino";
const DRINK_LABELS = {
    cappucino: "Cappuccino",
    latte: "Latte",
    matcha: "Matcha",
    refresher: "Refresher"
};
const collectionGrid = document.querySelector("#collection-grid");

function renderCollection() {
    const collection = JSON.parse(localStorage.getItem(COLLECTION_STORAGE_KEY) || "[]");

    if (!collection.length) {
        collectionGrid.textContent = "Complete a focus session to earn your first cup.";
        return;
    }

    collectionGrid.replaceChildren();

    collection.forEach((cup, index) => {
        const item = document.createElement("article");
        item.className = "collection-item";

        const image = document.createElement("img");
        const drink = cup.drink || DEFAULT_DRINK;
        image.src = `../assets/images/${drink}.png`;
        image.alt = `${DRINK_LABELS[drink] || "Coffee"} ${index + 1}`;

        const label = document.createElement("span");
        label.textContent = DRINK_LABELS[drink] || `Cup ${index + 1}`;

        item.append(image, label);
        collectionGrid.appendChild(item);
    });
}

renderCollection();