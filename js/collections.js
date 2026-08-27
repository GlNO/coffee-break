const COLLECTION_STORAGE_KEY = "coffee-break-collection";
const DEFAULT_DRINK = "cappucino";
const DRINK_LABELS = {
    cappucino: "Cappuccino",
    latte: "Latte",
    matcha: "Matcha",
    refresher: "Refresher"
};
const collectionGrid = document.querySelector("#collection-grid");
const totalDrinks = document.querySelector("#total-drinks");
const favoriteDrink = document.querySelector("#favorite-drink");
const latestDrink = document.querySelector("#latest-drink");

function getDrinkLabel(drink) {
    return DRINK_LABELS[drink] || "Coffee";
}

function updateSummary(collection) {
    totalDrinks.textContent = collection.length;

    const drinkCounts = collection.reduce((counts, cup) => {
        const drink = cup.drink || DEFAULT_DRINK;
        counts[drink] = (counts[drink] || 0) + 1;
        return counts;
    }, {});

    const mostCollectedDrink = Object.entries(drinkCounts)
        .sort((first, second) => second[1] - first[1])[0]?.[0];
    favoriteDrink.textContent = mostCollectedDrink ? getDrinkLabel(mostCollectedDrink) : "-";

    const latestCup = collection[collection.length - 1];
    latestDrink.textContent = latestCup ? getDrinkLabel(latestCup.drink || DEFAULT_DRINK) : "-";
}

function renderCollection() {
    const collection = JSON.parse(localStorage.getItem(COLLECTION_STORAGE_KEY) || "[]");
    updateSummary(collection);

    if (!collection.length) {
        collectionGrid.textContent = "Complete a focus session to earn your first drink.";
        return;
    }

    collectionGrid.replaceChildren();

    collection.forEach((cup, index) => {
        const item = document.createElement("article");
        item.className = "collection-item";

        const number = document.createElement("span");
        number.className = "collection-number";
        number.textContent = String(index + 1).padStart(2, "0");

        const image = document.createElement("img");
        const drink = cup.drink || DEFAULT_DRINK;
        image.src = `../assets/images/${drink}.png`;
        image.alt = `${getDrinkLabel(drink)} ${index + 1}`;

        const label = document.createElement("span");
        label.textContent = getDrinkLabel(drink);

        const task = document.createElement("span");
        task.className = "collection-task";
        task.textContent = cup.task || "No task specified";

        const date = document.createElement("time");
        date.className = "collection-date";
        date.dateTime = cup.earnedAt || "";
        date.textContent = cup.earnedAt
            ? new Date(cup.earnedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric"
            })
            : "Date unavailable";

        item.append(number, image, label, task, date);
        collectionGrid.appendChild(item);
    });
}

renderCollection();