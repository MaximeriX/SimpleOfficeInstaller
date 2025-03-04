const isSystemDark = window.matchMedia 
window.matchMedia('(prefers-color-scheme: dark)').matches;

let isDarkTheme = isSystemDark;

const MINUS = document.getElementById("minimize");
const CLOSE_APP = document.getElementById("close-app");
const THEME_TOGGLE = document.getElementById("theme-toggle");
const OFF_VER = document.getElementById("iconver");
const EDIT = document.getElementById("iconed");
const APPS = document.getElementById("iconapps");
const PR_LANG = document.getElementById("iconpr");
const AD_LANG = document.getElementById("iconad");
const iconadp = document.getElementById("iconadp");
const iconinf = document.getElementById("iconinf");
const iconinf2 = document.getElementById("iconinftwo");
const iconinf3 = document.getElementById("iconinfthr");

THEME_TOGGLE.addEventListener("click", toggleTheme);
MINUS.addEventListener("click", minimize);
CLOSE_APP.addEventListener("click", close_app);

document.getElementById('author').addEventListener('click', (event) => {
    event.preventDefault();
    window.electron.openExternal('https://linktr.ee/MaximeriX');
});

document.getElementById('appver').addEventListener('click', (event) => {
    event.preventDefault();
    window.electron.openExternal('https://github.com/MaximeriX/SimpleOfficeInstaller/releases/tag/v1.0.3');
});

document.getElementById('github').addEventListener('click', (event) => {
    event.preventDefault();
    window.electron.openExternal('https://github.com/MaximeriX/SimpleOfficeInstaller');
});

function applySystemTheme() {
    const isDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    THEME_TOGGLE.style.opacity = 0;
    setTimeout(() => {
        THEME_TOGGLE.src = isDarkTheme ? 'images/moon-icon.png' : 'images/sun-icon.png';
        OFF_VER.src = isDarkTheme ? 'images/ver-light.png' : 'images/ver.png';
        EDIT.src = isDarkTheme ? 'images/edit-light.png' : 'images/edit.png';
        APPS.src = isDarkTheme ? 'images/apps-light.png' : 'images/apps.png';
        PR_LANG.src = isDarkTheme ? 'images/lang-light.png' : 'images/lang.png';
        AD_LANG.src = isDarkTheme ? 'images/lang-light.png' : 'images/lang.png';
        iconadp.src = isDarkTheme ? 'images/addi-light.png' : 'images/addi.png';
        iconinf.src = isDarkTheme ? 'images/info-light.png' : 'images/info.png';
        iconinf2.src = isDarkTheme ? 'images/info-light.png' : 'images/info.png';
        iconinf3.src = isDarkTheme ? 'images/info-light.png' : 'images/info.png';
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
        OFF_VER.src = isDarkTheme ? 'images/ver-light.png' : 'images/ver.png';
        EDIT.src = isDarkTheme ? 'images/edit-light.png' : 'images/edit.png';
        APPS.src = isDarkTheme ? 'images/apps-light.png' : 'images/apps.png';
        PR_LANG.src = isDarkTheme ? 'images/lang-light.png' : 'images/lang.png';
        AD_LANG.src = isDarkTheme ? 'images/lang-light.png' : 'images/lang.png';
        iconadp.src = isDarkTheme ? 'images/addi-light.png' : 'images/addi.png';
        iconinf.src = isDarkTheme ? 'images/info-light.png' : 'images/info.png';
        iconinf2.src = isDarkTheme ? 'images/info-light.png' : 'images/info.png';
        iconinf3.src = isDarkTheme ? 'images/info-light.png' : 'images/info.png';
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