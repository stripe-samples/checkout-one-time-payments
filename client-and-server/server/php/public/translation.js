// import i18next from 'i18next';

i18next
  .use(i18nextXHRBackend)
  .use(i18nextBrowserLanguageDetector)
  .init(
    {
      fallbackLng: "en",
      debug: false,
      load: "languageOnly",
      backend: {
        // load from locales folder.
        loadPath: "/locales/{{lng}}.json",
        crossDomain: false,
      },
    },
    function (err, t) {
      // init set content
      updateContent();
    }
  );

function updateContent(key) {
  if (key) {
    var elm = document.querySelectorAll(`[data-i18n='${key}']`)[0];
    var options = elm.getAttribute("i18n-options");
    options = JSON.parse(options);

    elm.innerHTML = i18next.t(key, options);
  } else {
    document.querySelectorAll("[data-i18n]").forEach(function (elm) {
      var key = elm.getAttribute("data-i18n");
      var options = elm.getAttribute("i18n-options");
      options = JSON.parse(options);

      elm.innerHTML = i18next.t(key, options);
    });
  }
}

function changeLng(lng) {
  i18next.changeLanguage(lng);
}

i18next.on("languageChanged", () => {
  updateContent();
});
