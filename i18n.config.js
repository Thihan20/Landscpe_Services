
const i18n = require("i18n");
const path = require("path");

i18n.configure({
    locales: ["EN", "MM"],
    defaultLocale: "EN",
    directory: path.join(__dirname, "locales"),
    objectNotation: true,
    api: {
        __: "translate",
        __n: "translateN"
    }
});

module.exports = i18n;
