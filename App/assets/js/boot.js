(function () {
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDarkTheme = Boolean(prefersDark);
  const root = document.documentElement;

  root.classList.toggle('dark', isDarkTheme);
})();
