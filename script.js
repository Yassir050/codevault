// ========================================
// CodeVault - Code Snippet Manager
// ========================================

// ----------------------------------------
// DOM Elements
// ----------------------------------------

const sidebar = document.querySelector("#sidebar");
const menuButton = document.querySelector("#menuButton");

const themeButton = document.querySelector("#themeButton");

const navItems = document.querySelectorAll(".nav-item");

const addSnippetButton =
    document.querySelector("#addSnippetButton");

const emptyAddButton =
    document.querySelector("#emptyAddButton");

const snippetModal =
    document.querySelector("#snippetModal");

const closeModalButton =
    document.querySelector("#closeModalButton");

const cancelModalButton =
    document.querySelector("#cancelModalButton");

const snippetForm =
    document.querySelector("#snippetForm");

const snippetTitle =
    document.querySelector("#snippetTitle");

const snippetLanguage =
    document.querySelector("#snippetLanguage");

const snippetCategory =
    document.querySelector("#snippetCategory");

const snippetDescription =
    document.querySelector("#snippetDescription");

const snippetCode =
    document.querySelector("#snippetCode");

const searchInput =
    document.querySelector("#searchInput");

const sortSelect =
    document.querySelector("#sortSelect");

const snippetGrid =
    document.querySelector("#snippetGrid");

const emptyState =
    document.querySelector("#emptyState");

const totalSnippets =
    document.querySelector("#totalSnippets");

const javascriptCount =
    document.querySelector("#javascriptCount");

const pythonCount =
    document.querySelector("#pythonCount");

const favoriteCount =
    document.querySelector("#favoriteCount");

const snippetCount =
    document.querySelector("#snippetCount");


// ----------------------------------------
// Storage
// ----------------------------------------

const SNIPPETS_KEY = "codevault-snippets";
const THEME_KEY = "codevault-theme";


// ----------------------------------------
// App State
// ----------------------------------------

let snippets = loadSnippets();

let currentFilter = "all";


// ----------------------------------------
// Storage Functions
// ----------------------------------------

function loadSnippets() {

    try {

        const saved =
            localStorage.getItem(SNIPPETS_KEY);

        if (!saved) {
            return [];
        }

        const parsed =
            JSON.parse(saved);

        return Array.isArray(parsed)
            ? parsed
            : [];

    } catch (error) {

        console.error(
            "Could not load snippets:",
            error
        );

        return [];
    }
}


function saveSnippets() {

    localStorage.setItem(
        SNIPPETS_KEY,
        JSON.stringify(snippets)
    );
}


// ----------------------------------------
// ID Generator
// ----------------------------------------

function generateId() {

    return Date.now().toString() +
        Math.random()
            .toString(36)
            .slice(2, 8);
}


// ----------------------------------------
// Modal
// ----------------------------------------

function openModal() {

    snippetModal.classList.add("open");

    snippetModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "modal-open"
    );

    setTimeout(
        () => snippetTitle.focus(),
        50
    );
}


function closeModal() {

    snippetModal.classList.remove(
        "open"
    );

    snippetModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "modal-open"
    );
}


// ----------------------------------------
// Add Snippet
// ----------------------------------------

function createSnippet(event) {

    event.preventDefault();

    const title =
        snippetTitle.value.trim();

    const language =
        snippetLanguage.value;

    const category =
        snippetCategory.value.trim();

    const description =
        snippetDescription.value.trim();

    const code =
        snippetCode.value.trim();


    if (!title || !code) {
        return;
    }


    const snippet = {

        id: generateId(),

        title,

        language,

        category,

        description,

        code,

        favorite: false,

        createdAt: Date.now()
    };


    snippets.unshift(snippet);

    saveSnippets();

    snippetForm.reset();

    closeModal();

    renderAll();
}


// ----------------------------------------
// Delete Snippet
// ----------------------------------------

function deleteSnippet(id) {

    const snippet =
        snippets.find(
            item => item.id === id
        );

    if (!snippet) {
        return;
    }


    const confirmed =
        window.confirm(
            `Delete "${snippet.title}"?`
        );

    if (!confirmed) {
        return;
    }


    snippets =
        snippets.filter(
            item => item.id !== id
        );


    saveSnippets();

    renderAll();
}


// ----------------------------------------
// Toggle Favorite
// ----------------------------------------

function toggleFavorite(id) {

    const snippet =
        snippets.find(
            item => item.id === id
        );

    if (!snippet) {
        return;
    }


    snippet.favorite =
        !snippet.favorite;


    saveSnippets();

    renderAll();
}


// ----------------------------------------
// Copy Code
// ----------------------------------------

async function copyCode(code, button) {

    try {

        await navigator.clipboard.writeText(code);

        const oldText =
            button.textContent;

        button.textContent =
            "Copied ✓";


        setTimeout(
            () => {
                button.textContent =
                    oldText;
            },
            1200
        );

    } catch (error) {

        console.error(
            "Could not copy code:",
            error
        );

        window.prompt(
            "Copy this code:",
            code
        );
    }
}


// ----------------------------------------
// Escape HTML
// ----------------------------------------

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value;

    return div.innerHTML;
}


// ----------------------------------------
// Language Name
// ----------------------------------------

function getLanguageName(language) {

    const languages = {

        javascript: "JavaScript",

        python: "Python",

        html: "HTML",

        css: "CSS",

        other: "Other"
    };


    return languages[language]
        || "Other";
}


// ----------------------------------------
// Filter + Search
// ----------------------------------------

function getFilteredSnippets() {

    let result = [...snippets];


    // Category filter

    if (currentFilter !== "all") {

        result =
            result.filter(
                snippet =>
                    snippet.language ===
                    currentFilter
            );
    }


    // Search

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    if (search) {

        result =
            result.filter(
                snippet => {

                    return (

                        snippet.title
                            .toLowerCase()
                            .includes(search)

                        ||

                        snippet.description
                            .toLowerCase()
                            .includes(search)

                        ||

                        snippet.category
                            .toLowerCase()
                            .includes(search)

                        ||

                        snippet.code
                            .toLowerCase()
                            .includes(search)

                    );
                }
            );
    }


    // Sorting

    const sort =
        sortSelect.value;


    if (sort === "newest") {

        result.sort(
            (a, b) =>
                b.createdAt -
                a.createdAt
        );

    } else if (sort === "oldest") {

        result.sort(
            (a, b) =>
                a.createdAt -
                b.createdAt
        );

    } else if (sort === "name") {

        result.sort(
            (a, b) =>
                a.title.localeCompare(
                    b.title
                )
        );
    }


    return result;
}


// ----------------------------------------
// Render Snippets
// ----------------------------------------

function renderSnippets() {

    const filtered =
        getFilteredSnippets();


    snippetGrid.replaceChildren();


    snippetCount.textContent =
        `${filtered.length} ${
            filtered.length === 1
                ? "snippet"
                : "snippets"
        }`;


    if (filtered.length === 0) {

        emptyState.hidden = false;

        return;
    }


    emptyState.hidden = true;


    filtered.forEach(
        snippet => {

            const card =
                document.createElement("article");

            card.className =
                "snippet-card";


            // Header

            const header =
                document.createElement("div");

            header.className =
                "snippet-header";


            const title =
                document.createElement("h3");

            title.textContent =
                snippet.title;


            const favorite =
                document.createElement("button");

            favorite.type = "button";

            favorite.className =
                "favorite-button";

            favorite.textContent =
                snippet.favorite
                    ? "★"
                    : "☆";

            favorite.setAttribute(
                "aria-label",
                snippet.favorite
                    ? "Remove favorite"
                    : "Add favorite"
            );


            favorite.addEventListener(
                "click",
                () =>
                    toggleFavorite(
                        snippet.id
                    )
            );


            header.append(
                title,
                favorite
            );


            // Meta

            const meta =
                document.createElement("div");

            meta.className =
                "snippet-meta";


            const language =
                document.createElement("span");

            language.textContent =
                getLanguageName(
                    snippet.language
                );


            const category =
                document.createElement("span");

            category.textContent =
                snippet.category ||
                "General";


            meta.append(
                language,
                category
            );


            // Description

            const description =
                document.createElement("p");

            description.className =
                "snippet-description";

            description.textContent =
                snippet.description ||
                "No description provided.";


            // Code

            const pre =
                document.createElement("pre");


            const code =
                document.createElement("code");

            code.textContent =
                snippet.code;


            pre.appendChild(code);


            // Actions

            const actions =
                document.createElement("div");

            actions.className =
                "snippet-actions";


            const copyButton =
                document.createElement("button");

            copyButton.type =
                "button";

            copyButton.className =
                "secondary-button";

            copyButton.textContent =
                "Copy";


            copyButton.addEventListener(
                "click",
                () =>
                    copyCode(
                        snippet.code,
                        copyButton
                    )
            );


            const deleteButton =
                document.createElement("button");

            deleteButton.type =
                "button";

            deleteButton.className =
                "delete-button";

            deleteButton.textContent =
                "Delete";


            deleteButton.addEventListener(
                "click",
                () =>
                    deleteSnippet(
                        snippet.id
                    )
            );


            actions.append(
                copyButton,
                deleteButton
            );


            card.append(
                header,
                meta,
                description,
                pre,
                actions
            );


            snippetGrid.appendChild(card);
        }
    );
}


// ----------------------------------------
// Statistics
// ----------------------------------------

function updateStatistics() {

    const total =
        snippets.length;


    const javascript =
        snippets.filter(
            snippet =>
                snippet.language ===
                "javascript"
        ).length;


    const python =
        snippets.filter(
            snippet =>
                snippet.language ===
                "python"
        ).length;


    const favorites =
        snippets.filter(
            snippet =>
                snippet.favorite
        ).length;


    totalSnippets.textContent =
        total;

    javascriptCount.textContent =
        javascript;

    pythonCount.textContent =
        python;

    favoriteCount.textContent =
        favorites;
}


// ----------------------------------------
// Navigation Filters
// ----------------------------------------

navItems.forEach(
    item => {

        item.addEventListener(
            "click",
            () => {

                navItems.forEach(
                    nav =>
                        nav.classList.remove(
                            "active"
                        )
                );


                item.classList.add(
                    "active"
                );


                currentFilter =
                    item.dataset.filter;


                renderSnippets();


                // Close mobile sidebar

                sidebar.classList.remove(
                    "open"
                );
            }
        );
    }
);


// ----------------------------------------
// Mobile Menu
// ----------------------------------------

menuButton.addEventListener(
    "click",
    () => {

        sidebar.classList.toggle(
            "open"
        );
    }
);


// ----------------------------------------
// Theme
// ----------------------------------------

function updateThemeButton() {

    const isDark =
        document.body.classList.contains(
            "dark"
        );


    const span =
        themeButton.querySelector(
            "span"
        );


    span.textContent =
        isDark
            ? "☀"
            : "◐";


    themeButton.title =
        isDark
            ? "Switch to light mode"
            : "Switch to dark mode";
}


function setTheme(isDark) {

    document.body.classList.toggle(
        "dark",
        isDark
    );


    localStorage.setItem(
        THEME_KEY,
        String(isDark)
    );


    updateThemeButton();
}


function toggleTheme() {

    const isDark =
        document.body.classList.contains(
            "dark"
        );


    setTheme(!isDark);
}


themeButton.addEventListener(
    "click",
    toggleTheme
);


// ----------------------------------------
// Search
// ----------------------------------------

searchInput.addEventListener(
    "input",
    renderSnippets
);


// ----------------------------------------
// Sort
// ----------------------------------------

sortSelect.addEventListener(
    "change",
    renderSnippets
);


// ----------------------------------------
// Modal Events
// ----------------------------------------

addSnippetButton.addEventListener(
    "click",
    openModal
);


emptyAddButton.addEventListener(
    "click",
    openModal
);


closeModalButton.addEventListener(
    "click",
    closeModal
);


cancelModalButton.addEventListener(
    "click",
    closeModal
);


snippetForm.addEventListener(
    "submit",
    createSnippet
);


document.querySelectorAll(
    "[data-close-modal]"
).forEach(
    element => {

        element.addEventListener(
            "click",
            closeModal
        );
    }
);


// ----------------------------------------
// Escape Key
// ----------------------------------------

document.addEventListener(
    "keydown",
    event => {

        if (event.key !== "Escape") {
            return;
        }


        closeModal();


        sidebar.classList.remove(
            "open"
        );
    }
);


// ----------------------------------------
// Initial Theme
// ----------------------------------------

const savedTheme =
    localStorage.getItem(
        THEME_KEY
    );


if (savedTheme === "true") {

    setTheme(true);

} else if (savedTheme === "false") {

    setTheme(false);

} else {

    const prefersDark =
        window.matchMedia &&
        window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches;


    setTheme(prefersDark);
}


// ----------------------------------------
// Initial Render
// ----------------------------------------

renderSnippets();

updateStatistics();
