const isSystemDark = window.matchMedia 
window.matchMedia('(prefers-color-scheme: dark)').matches;

let isDarkTheme = isSystemDark;

const MINUS = document.getElementById("minimize");
const CLOSE_APP = document.getElementById("close-app");
const THEME_TOGGLE = document.getElementById("theme-toggle");
const EXIT_BT = document.getElementById("exit_bt");

THEME_TOGGLE.addEventListener("click", toggleTheme);
MINUS.addEventListener("click", minimize);
CLOSE_APP.addEventListener("click", close_app);
EXIT_BT.addEventListener("click", exit_bt);

function applySystemTheme() {
    const isDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    THEME_TOGGLE.style.opacity = 0;
    setTimeout(() => {
        THEME_TOGGLE.src = isDarkTheme ? 'images/moon-icon.png' : 'images/sun-icon.png';
        THEME_TOGGLE.style.opacity = 1;
        document.body.classList.toggle('dark-theme', isDarkTheme);
        document.body.classList.toggle('light-theme', !isDarkTheme);
    }, 305);
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
    applySystemTheme();
});

applySystemTheme();

function toggleTheme() {
    THEME_TOGGLE.style.opacity = 0;
    setTimeout(() => {
        THEME_TOGGLE.src = isDarkTheme ? 'images/moon-icon.png' : 'images/sun-icon.png';
        THEME_TOGGLE.style.opacity = 1;
    }, 280);
    isDarkTheme = !isDarkTheme;
    document.body.classList.toggle("light-theme", !isDarkTheme);
    document.body.classList.toggle("dark-theme", isDarkTheme);
}

function minimize() {
    app.window.minimize();
}

function close_app() {
    app.window.close();
}

function exit_bt () {
    app.window.close();
}