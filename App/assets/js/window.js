document.querySelector('.window-minimize')?.addEventListener('click', () => {
  window.soi.window.minimize();
});

document.querySelector('.window-close')?.addEventListener('click', () => {
  window.soi.window.close();
});
