"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target22, all) => {
  for (var name in all)
    __defProp(target22, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target22) => (target22 = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target22, "default", { value: mod, enumerable: true }) : target22,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../../node_modules/.pnpm/tsup@8.4.0_@microsoft+api-extractor@7.51.1_@types+node@22.13.14__jiti@2.4.2_postcss@8.5_96eb05a9d65343021e53791dd83f3773/node_modules/tsup/assets/cjs_shims.js
var init_cjs_shims = __esm({
  "../../node_modules/.pnpm/tsup@8.4.0_@microsoft+api-extractor@7.51.1_@types+node@22.13.14__jiti@2.4.2_postcss@8.5_96eb05a9d65343021e53791dd83f3773/node_modules/tsup/assets/cjs_shims.js"() {
    "use strict";
  }
});

// ../../node_modules/.pnpm/speakingurl@14.0.1/node_modules/speakingurl/lib/speakingurl.js
var require_speakingurl = __commonJS({
  "../../node_modules/.pnpm/speakingurl@14.0.1/node_modules/speakingurl/lib/speakingurl.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    (function(root) {
      "use strict";
      var charMap = {
        // latin
        "\xC0": "A",
        "\xC1": "A",
        "\xC2": "A",
        "\xC3": "A",
        "\xC4": "Ae",
        "\xC5": "A",
        "\xC6": "AE",
        "\xC7": "C",
        "\xC8": "E",
        "\xC9": "E",
        "\xCA": "E",
        "\xCB": "E",
        "\xCC": "I",
        "\xCD": "I",
        "\xCE": "I",
        "\xCF": "I",
        "\xD0": "D",
        "\xD1": "N",
        "\xD2": "O",
        "\xD3": "O",
        "\xD4": "O",
        "\xD5": "O",
        "\xD6": "Oe",
        "\u0150": "O",
        "\xD8": "O",
        "\xD9": "U",
        "\xDA": "U",
        "\xDB": "U",
        "\xDC": "Ue",
        "\u0170": "U",
        "\xDD": "Y",
        "\xDE": "TH",
        "\xDF": "ss",
        "\xE0": "a",
        "\xE1": "a",
        "\xE2": "a",
        "\xE3": "a",
        "\xE4": "ae",
        "\xE5": "a",
        "\xE6": "ae",
        "\xE7": "c",
        "\xE8": "e",
        "\xE9": "e",
        "\xEA": "e",
        "\xEB": "e",
        "\xEC": "i",
        "\xED": "i",
        "\xEE": "i",
        "\xEF": "i",
        "\xF0": "d",
        "\xF1": "n",
        "\xF2": "o",
        "\xF3": "o",
        "\xF4": "o",
        "\xF5": "o",
        "\xF6": "oe",
        "\u0151": "o",
        "\xF8": "o",
        "\xF9": "u",
        "\xFA": "u",
        "\xFB": "u",
        "\xFC": "ue",
        "\u0171": "u",
        "\xFD": "y",
        "\xFE": "th",
        "\xFF": "y",
        "\u1E9E": "SS",
        // language specific
        // Arabic
        "\u0627": "a",
        "\u0623": "a",
        "\u0625": "i",
        "\u0622": "aa",
        "\u0624": "u",
        "\u0626": "e",
        "\u0621": "a",
        "\u0628": "b",
        "\u062A": "t",
        "\u062B": "th",
        "\u062C": "j",
        "\u062D": "h",
        "\u062E": "kh",
        "\u062F": "d",
        "\u0630": "th",
        "\u0631": "r",
        "\u0632": "z",
        "\u0633": "s",
        "\u0634": "sh",
        "\u0635": "s",
        "\u0636": "dh",
        "\u0637": "t",
        "\u0638": "z",
        "\u0639": "a",
        "\u063A": "gh",
        "\u0641": "f",
        "\u0642": "q",
        "\u0643": "k",
        "\u0644": "l",
        "\u0645": "m",
        "\u0646": "n",
        "\u0647": "h",
        "\u0648": "w",
        "\u064A": "y",
        "\u0649": "a",
        "\u0629": "h",
        "\uFEFB": "la",
        "\uFEF7": "laa",
        "\uFEF9": "lai",
        "\uFEF5": "laa",
        // Persian additional characters than Arabic
        "\u06AF": "g",
        "\u0686": "ch",
        "\u067E": "p",
        "\u0698": "zh",
        "\u06A9": "k",
        "\u06CC": "y",
        // Arabic diactrics
        "\u064E": "a",
        "\u064B": "an",
        "\u0650": "e",
        "\u064D": "en",
        "\u064F": "u",
        "\u064C": "on",
        "\u0652": "",
        // Arabic numbers
        "\u0660": "0",
        "\u0661": "1",
        "\u0662": "2",
        "\u0663": "3",
        "\u0664": "4",
        "\u0665": "5",
        "\u0666": "6",
        "\u0667": "7",
        "\u0668": "8",
        "\u0669": "9",
        // Persian numbers
        "\u06F0": "0",
        "\u06F1": "1",
        "\u06F2": "2",
        "\u06F3": "3",
        "\u06F4": "4",
        "\u06F5": "5",
        "\u06F6": "6",
        "\u06F7": "7",
        "\u06F8": "8",
        "\u06F9": "9",
        // Burmese consonants
        "\u1000": "k",
        "\u1001": "kh",
        "\u1002": "g",
        "\u1003": "ga",
        "\u1004": "ng",
        "\u1005": "s",
        "\u1006": "sa",
        "\u1007": "z",
        "\u1005\u103B": "za",
        "\u100A": "ny",
        "\u100B": "t",
        "\u100C": "ta",
        "\u100D": "d",
        "\u100E": "da",
        "\u100F": "na",
        "\u1010": "t",
        "\u1011": "ta",
        "\u1012": "d",
        "\u1013": "da",
        "\u1014": "n",
        "\u1015": "p",
        "\u1016": "pa",
        "\u1017": "b",
        "\u1018": "ba",
        "\u1019": "m",
        "\u101A": "y",
        "\u101B": "ya",
        "\u101C": "l",
        "\u101D": "w",
        "\u101E": "th",
        "\u101F": "h",
        "\u1020": "la",
        "\u1021": "a",
        // consonant character combos
        "\u103C": "y",
        "\u103B": "ya",
        "\u103D": "w",
        "\u103C\u103D": "yw",
        "\u103B\u103D": "ywa",
        "\u103E": "h",
        // independent vowels
        "\u1027": "e",
        "\u104F": "-e",
        "\u1023": "i",
        "\u1024": "-i",
        "\u1009": "u",
        "\u1026": "-u",
        "\u1029": "aw",
        "\u101E\u103C\u1031\u102C": "aw",
        "\u102A": "aw",
        // numbers
        "\u1040": "0",
        "\u1041": "1",
        "\u1042": "2",
        "\u1043": "3",
        "\u1044": "4",
        "\u1045": "5",
        "\u1046": "6",
        "\u1047": "7",
        "\u1048": "8",
        "\u1049": "9",
        // virama and tone marks which are silent in transliteration
        "\u1039": "",
        "\u1037": "",
        "\u1038": "",
        // Czech
        "\u010D": "c",
        "\u010F": "d",
        "\u011B": "e",
        "\u0148": "n",
        "\u0159": "r",
        "\u0161": "s",
        "\u0165": "t",
        "\u016F": "u",
        "\u017E": "z",
        "\u010C": "C",
        "\u010E": "D",
        "\u011A": "E",
        "\u0147": "N",
        "\u0158": "R",
        "\u0160": "S",
        "\u0164": "T",
        "\u016E": "U",
        "\u017D": "Z",
        // Dhivehi
        "\u0780": "h",
        "\u0781": "sh",
        "\u0782": "n",
        "\u0783": "r",
        "\u0784": "b",
        "\u0785": "lh",
        "\u0786": "k",
        "\u0787": "a",
        "\u0788": "v",
        "\u0789": "m",
        "\u078A": "f",
        "\u078B": "dh",
        "\u078C": "th",
        "\u078D": "l",
        "\u078E": "g",
        "\u078F": "gn",
        "\u0790": "s",
        "\u0791": "d",
        "\u0792": "z",
        "\u0793": "t",
        "\u0794": "y",
        "\u0795": "p",
        "\u0796": "j",
        "\u0797": "ch",
        "\u0798": "tt",
        "\u0799": "hh",
        "\u079A": "kh",
        "\u079B": "th",
        "\u079C": "z",
        "\u079D": "sh",
        "\u079E": "s",
        "\u079F": "d",
        "\u07A0": "t",
        "\u07A1": "z",
        "\u07A2": "a",
        "\u07A3": "gh",
        "\u07A4": "q",
        "\u07A5": "w",
        "\u07A6": "a",
        "\u07A7": "aa",
        "\u07A8": "i",
        "\u07A9": "ee",
        "\u07AA": "u",
        "\u07AB": "oo",
        "\u07AC": "e",
        "\u07AD": "ey",
        "\u07AE": "o",
        "\u07AF": "oa",
        "\u07B0": "",
        // Georgian https://en.wikipedia.org/wiki/Romanization_of_Georgian
        // National system (2002)
        "\u10D0": "a",
        "\u10D1": "b",
        "\u10D2": "g",
        "\u10D3": "d",
        "\u10D4": "e",
        "\u10D5": "v",
        "\u10D6": "z",
        "\u10D7": "t",
        "\u10D8": "i",
        "\u10D9": "k",
        "\u10DA": "l",
        "\u10DB": "m",
        "\u10DC": "n",
        "\u10DD": "o",
        "\u10DE": "p",
        "\u10DF": "zh",
        "\u10E0": "r",
        "\u10E1": "s",
        "\u10E2": "t",
        "\u10E3": "u",
        "\u10E4": "p",
        "\u10E5": "k",
        "\u10E6": "gh",
        "\u10E7": "q",
        "\u10E8": "sh",
        "\u10E9": "ch",
        "\u10EA": "ts",
        "\u10EB": "dz",
        "\u10EC": "ts",
        "\u10ED": "ch",
        "\u10EE": "kh",
        "\u10EF": "j",
        "\u10F0": "h",
        // Greek
        "\u03B1": "a",
        "\u03B2": "v",
        "\u03B3": "g",
        "\u03B4": "d",
        "\u03B5": "e",
        "\u03B6": "z",
        "\u03B7": "i",
        "\u03B8": "th",
        "\u03B9": "i",
        "\u03BA": "k",
        "\u03BB": "l",
        "\u03BC": "m",
        "\u03BD": "n",
        "\u03BE": "ks",
        "\u03BF": "o",
        "\u03C0": "p",
        "\u03C1": "r",
        "\u03C3": "s",
        "\u03C4": "t",
        "\u03C5": "y",
        "\u03C6": "f",
        "\u03C7": "x",
        "\u03C8": "ps",
        "\u03C9": "o",
        "\u03AC": "a",
        "\u03AD": "e",
        "\u03AF": "i",
        "\u03CC": "o",
        "\u03CD": "y",
        "\u03AE": "i",
        "\u03CE": "o",
        "\u03C2": "s",
        "\u03CA": "i",
        "\u03B0": "y",
        "\u03CB": "y",
        "\u0390": "i",
        "\u0391": "A",
        "\u0392": "B",
        "\u0393": "G",
        "\u0394": "D",
        "\u0395": "E",
        "\u0396": "Z",
        "\u0397": "I",
        "\u0398": "TH",
        "\u0399": "I",
        "\u039A": "K",
        "\u039B": "L",
        "\u039C": "M",
        "\u039D": "N",
        "\u039E": "KS",
        "\u039F": "O",
        "\u03A0": "P",
        "\u03A1": "R",
        "\u03A3": "S",
        "\u03A4": "T",
        "\u03A5": "Y",
        "\u03A6": "F",
        "\u03A7": "X",
        "\u03A8": "PS",
        "\u03A9": "O",
        "\u0386": "A",
        "\u0388": "E",
        "\u038A": "I",
        "\u038C": "O",
        "\u038E": "Y",
        "\u0389": "I",
        "\u038F": "O",
        "\u03AA": "I",
        "\u03AB": "Y",
        // Latvian
        "\u0101": "a",
        // 'č': 'c', // duplicate
        "\u0113": "e",
        "\u0123": "g",
        "\u012B": "i",
        "\u0137": "k",
        "\u013C": "l",
        "\u0146": "n",
        // 'š': 's', // duplicate
        "\u016B": "u",
        // 'ž': 'z', // duplicate
        "\u0100": "A",
        // 'Č': 'C', // duplicate
        "\u0112": "E",
        "\u0122": "G",
        "\u012A": "I",
        "\u0136": "k",
        "\u013B": "L",
        "\u0145": "N",
        // 'Š': 'S', // duplicate
        "\u016A": "U",
        // 'Ž': 'Z', // duplicate
        // Macedonian
        "\u040C": "Kj",
        "\u045C": "kj",
        "\u0409": "Lj",
        "\u0459": "lj",
        "\u040A": "Nj",
        "\u045A": "nj",
        "\u0422\u0441": "Ts",
        "\u0442\u0441": "ts",
        // Polish
        "\u0105": "a",
        "\u0107": "c",
        "\u0119": "e",
        "\u0142": "l",
        "\u0144": "n",
        // 'ó': 'o', // duplicate
        "\u015B": "s",
        "\u017A": "z",
        "\u017C": "z",
        "\u0104": "A",
        "\u0106": "C",
        "\u0118": "E",
        "\u0141": "L",
        "\u0143": "N",
        "\u015A": "S",
        "\u0179": "Z",
        "\u017B": "Z",
        // Ukranian
        "\u0404": "Ye",
        "\u0406": "I",
        "\u0407": "Yi",
        "\u0490": "G",
        "\u0454": "ye",
        "\u0456": "i",
        "\u0457": "yi",
        "\u0491": "g",
        // Romanian
        "\u0103": "a",
        "\u0102": "A",
        "\u0219": "s",
        "\u0218": "S",
        // 'ş': 's', // duplicate
        // 'Ş': 'S', // duplicate
        "\u021B": "t",
        "\u021A": "T",
        "\u0163": "t",
        "\u0162": "T",
        // Russian https://en.wikipedia.org/wiki/Romanization_of_Russian
        // ICAO
        "\u0430": "a",
        "\u0431": "b",
        "\u0432": "v",
        "\u0433": "g",
        "\u0434": "d",
        "\u0435": "e",
        "\u0451": "yo",
        "\u0436": "zh",
        "\u0437": "z",
        "\u0438": "i",
        "\u0439": "i",
        "\u043A": "k",
        "\u043B": "l",
        "\u043C": "m",
        "\u043D": "n",
        "\u043E": "o",
        "\u043F": "p",
        "\u0440": "r",
        "\u0441": "s",
        "\u0442": "t",
        "\u0443": "u",
        "\u0444": "f",
        "\u0445": "kh",
        "\u0446": "c",
        "\u0447": "ch",
        "\u0448": "sh",
        "\u0449": "sh",
        "\u044A": "",
        "\u044B": "y",
        "\u044C": "",
        "\u044D": "e",
        "\u044E": "yu",
        "\u044F": "ya",
        "\u0410": "A",
        "\u0411": "B",
        "\u0412": "V",
        "\u0413": "G",
        "\u0414": "D",
        "\u0415": "E",
        "\u0401": "Yo",
        "\u0416": "Zh",
        "\u0417": "Z",
        "\u0418": "I",
        "\u0419": "I",
        "\u041A": "K",
        "\u041B": "L",
        "\u041C": "M",
        "\u041D": "N",
        "\u041E": "O",
        "\u041F": "P",
        "\u0420": "R",
        "\u0421": "S",
        "\u0422": "T",
        "\u0423": "U",
        "\u0424": "F",
        "\u0425": "Kh",
        "\u0426": "C",
        "\u0427": "Ch",
        "\u0428": "Sh",
        "\u0429": "Sh",
        "\u042A": "",
        "\u042B": "Y",
        "\u042C": "",
        "\u042D": "E",
        "\u042E": "Yu",
        "\u042F": "Ya",
        // Serbian
        "\u0452": "dj",
        "\u0458": "j",
        // 'љ': 'lj',  // duplicate
        // 'њ': 'nj', // duplicate
        "\u045B": "c",
        "\u045F": "dz",
        "\u0402": "Dj",
        "\u0408": "j",
        // 'Љ': 'Lj', // duplicate
        // 'Њ': 'Nj', // duplicate
        "\u040B": "C",
        "\u040F": "Dz",
        // Slovak
        "\u013E": "l",
        "\u013A": "l",
        "\u0155": "r",
        "\u013D": "L",
        "\u0139": "L",
        "\u0154": "R",
        // Turkish
        "\u015F": "s",
        "\u015E": "S",
        "\u0131": "i",
        "\u0130": "I",
        // 'ç': 'c', // duplicate
        // 'Ç': 'C', // duplicate
        // 'ü': 'u', // duplicate, see langCharMap
        // 'Ü': 'U', // duplicate, see langCharMap
        // 'ö': 'o', // duplicate, see langCharMap
        // 'Ö': 'O', // duplicate, see langCharMap
        "\u011F": "g",
        "\u011E": "G",
        // Vietnamese
        "\u1EA3": "a",
        "\u1EA2": "A",
        "\u1EB3": "a",
        "\u1EB2": "A",
        "\u1EA9": "a",
        "\u1EA8": "A",
        "\u0111": "d",
        "\u0110": "D",
        "\u1EB9": "e",
        "\u1EB8": "E",
        "\u1EBD": "e",
        "\u1EBC": "E",
        "\u1EBB": "e",
        "\u1EBA": "E",
        "\u1EBF": "e",
        "\u1EBE": "E",
        "\u1EC1": "e",
        "\u1EC0": "E",
        "\u1EC7": "e",
        "\u1EC6": "E",
        "\u1EC5": "e",
        "\u1EC4": "E",
        "\u1EC3": "e",
        "\u1EC2": "E",
        "\u1ECF": "o",
        "\u1ECD": "o",
        "\u1ECC": "o",
        "\u1ED1": "o",
        "\u1ED0": "O",
        "\u1ED3": "o",
        "\u1ED2": "O",
        "\u1ED5": "o",
        "\u1ED4": "O",
        "\u1ED9": "o",
        "\u1ED8": "O",
        "\u1ED7": "o",
        "\u1ED6": "O",
        "\u01A1": "o",
        "\u01A0": "O",
        "\u1EDB": "o",
        "\u1EDA": "O",
        "\u1EDD": "o",
        "\u1EDC": "O",
        "\u1EE3": "o",
        "\u1EE2": "O",
        "\u1EE1": "o",
        "\u1EE0": "O",
        "\u1EDE": "o",
        "\u1EDF": "o",
        "\u1ECB": "i",
        "\u1ECA": "I",
        "\u0129": "i",
        "\u0128": "I",
        "\u1EC9": "i",
        "\u1EC8": "i",
        "\u1EE7": "u",
        "\u1EE6": "U",
        "\u1EE5": "u",
        "\u1EE4": "U",
        "\u0169": "u",
        "\u0168": "U",
        "\u01B0": "u",
        "\u01AF": "U",
        "\u1EE9": "u",
        "\u1EE8": "U",
        "\u1EEB": "u",
        "\u1EEA": "U",
        "\u1EF1": "u",
        "\u1EF0": "U",
        "\u1EEF": "u",
        "\u1EEE": "U",
        "\u1EED": "u",
        "\u1EEC": "\u01B0",
        "\u1EF7": "y",
        "\u1EF6": "y",
        "\u1EF3": "y",
        "\u1EF2": "Y",
        "\u1EF5": "y",
        "\u1EF4": "Y",
        "\u1EF9": "y",
        "\u1EF8": "Y",
        "\u1EA1": "a",
        "\u1EA0": "A",
        "\u1EA5": "a",
        "\u1EA4": "A",
        "\u1EA7": "a",
        "\u1EA6": "A",
        "\u1EAD": "a",
        "\u1EAC": "A",
        "\u1EAB": "a",
        "\u1EAA": "A",
        // 'ă': 'a', // duplicate
        // 'Ă': 'A', // duplicate
        "\u1EAF": "a",
        "\u1EAE": "A",
        "\u1EB1": "a",
        "\u1EB0": "A",
        "\u1EB7": "a",
        "\u1EB6": "A",
        "\u1EB5": "a",
        "\u1EB4": "A",
        "\u24EA": "0",
        "\u2460": "1",
        "\u2461": "2",
        "\u2462": "3",
        "\u2463": "4",
        "\u2464": "5",
        "\u2465": "6",
        "\u2466": "7",
        "\u2467": "8",
        "\u2468": "9",
        "\u2469": "10",
        "\u246A": "11",
        "\u246B": "12",
        "\u246C": "13",
        "\u246D": "14",
        "\u246E": "15",
        "\u246F": "16",
        "\u2470": "17",
        "\u2471": "18",
        "\u2472": "18",
        "\u2473": "18",
        "\u24F5": "1",
        "\u24F6": "2",
        "\u24F7": "3",
        "\u24F8": "4",
        "\u24F9": "5",
        "\u24FA": "6",
        "\u24FB": "7",
        "\u24FC": "8",
        "\u24FD": "9",
        "\u24FE": "10",
        "\u24FF": "0",
        "\u24EB": "11",
        "\u24EC": "12",
        "\u24ED": "13",
        "\u24EE": "14",
        "\u24EF": "15",
        "\u24F0": "16",
        "\u24F1": "17",
        "\u24F2": "18",
        "\u24F3": "19",
        "\u24F4": "20",
        "\u24B6": "A",
        "\u24B7": "B",
        "\u24B8": "C",
        "\u24B9": "D",
        "\u24BA": "E",
        "\u24BB": "F",
        "\u24BC": "G",
        "\u24BD": "H",
        "\u24BE": "I",
        "\u24BF": "J",
        "\u24C0": "K",
        "\u24C1": "L",
        "\u24C2": "M",
        "\u24C3": "N",
        "\u24C4": "O",
        "\u24C5": "P",
        "\u24C6": "Q",
        "\u24C7": "R",
        "\u24C8": "S",
        "\u24C9": "T",
        "\u24CA": "U",
        "\u24CB": "V",
        "\u24CC": "W",
        "\u24CD": "X",
        "\u24CE": "Y",
        "\u24CF": "Z",
        "\u24D0": "a",
        "\u24D1": "b",
        "\u24D2": "c",
        "\u24D3": "d",
        "\u24D4": "e",
        "\u24D5": "f",
        "\u24D6": "g",
        "\u24D7": "h",
        "\u24D8": "i",
        "\u24D9": "j",
        "\u24DA": "k",
        "\u24DB": "l",
        "\u24DC": "m",
        "\u24DD": "n",
        "\u24DE": "o",
        "\u24DF": "p",
        "\u24E0": "q",
        "\u24E1": "r",
        "\u24E2": "s",
        "\u24E3": "t",
        "\u24E4": "u",
        "\u24E6": "v",
        "\u24E5": "w",
        "\u24E7": "x",
        "\u24E8": "y",
        "\u24E9": "z",
        // symbols
        "\u201C": '"',
        "\u201D": '"',
        "\u2018": "'",
        "\u2019": "'",
        "\u2202": "d",
        "\u0192": "f",
        "\u2122": "(TM)",
        "\xA9": "(C)",
        "\u0153": "oe",
        "\u0152": "OE",
        "\xAE": "(R)",
        "\u2020": "+",
        "\u2120": "(SM)",
        "\u2026": "...",
        "\u02DA": "o",
        "\xBA": "o",
        "\xAA": "a",
        "\u2022": "*",
        "\u104A": ",",
        "\u104B": ".",
        // currency
        "$": "USD",
        "\u20AC": "EUR",
        "\u20A2": "BRN",
        "\u20A3": "FRF",
        "\xA3": "GBP",
        "\u20A4": "ITL",
        "\u20A6": "NGN",
        "\u20A7": "ESP",
        "\u20A9": "KRW",
        "\u20AA": "ILS",
        "\u20AB": "VND",
        "\u20AD": "LAK",
        "\u20AE": "MNT",
        "\u20AF": "GRD",
        "\u20B1": "ARS",
        "\u20B2": "PYG",
        "\u20B3": "ARA",
        "\u20B4": "UAH",
        "\u20B5": "GHS",
        "\xA2": "cent",
        "\xA5": "CNY",
        "\u5143": "CNY",
        "\u5186": "YEN",
        "\uFDFC": "IRR",
        "\u20A0": "EWE",
        "\u0E3F": "THB",
        "\u20A8": "INR",
        "\u20B9": "INR",
        "\u20B0": "PF",
        "\u20BA": "TRY",
        "\u060B": "AFN",
        "\u20BC": "AZN",
        "\u043B\u0432": "BGN",
        "\u17DB": "KHR",
        "\u20A1": "CRC",
        "\u20B8": "KZT",
        "\u0434\u0435\u043D": "MKD",
        "z\u0142": "PLN",
        "\u20BD": "RUB",
        "\u20BE": "GEL"
      };
      var lookAheadCharArray = [
        // burmese
        "\u103A",
        // Dhivehi
        "\u07B0"
      ];
      var diatricMap = {
        // Burmese
        // dependent vowels
        "\u102C": "a",
        "\u102B": "a",
        "\u1031": "e",
        "\u1032": "e",
        "\u102D": "i",
        "\u102E": "i",
        "\u102D\u102F": "o",
        "\u102F": "u",
        "\u1030": "u",
        "\u1031\u102B\u1004\u103A": "aung",
        "\u1031\u102C": "aw",
        "\u1031\u102C\u103A": "aw",
        "\u1031\u102B": "aw",
        "\u1031\u102B\u103A": "aw",
        "\u103A": "\u103A",
        // this is special case but the character will be converted to latin in the code
        "\u1000\u103A": "et",
        "\u102D\u102F\u1000\u103A": "aik",
        "\u1031\u102C\u1000\u103A": "auk",
        "\u1004\u103A": "in",
        "\u102D\u102F\u1004\u103A": "aing",
        "\u1031\u102C\u1004\u103A": "aung",
        "\u1005\u103A": "it",
        "\u100A\u103A": "i",
        "\u1010\u103A": "at",
        "\u102D\u1010\u103A": "eik",
        "\u102F\u1010\u103A": "ok",
        "\u103D\u1010\u103A": "ut",
        "\u1031\u1010\u103A": "it",
        "\u1012\u103A": "d",
        "\u102D\u102F\u1012\u103A": "ok",
        "\u102F\u1012\u103A": "ait",
        "\u1014\u103A": "an",
        "\u102C\u1014\u103A": "an",
        "\u102D\u1014\u103A": "ein",
        "\u102F\u1014\u103A": "on",
        "\u103D\u1014\u103A": "un",
        "\u1015\u103A": "at",
        "\u102D\u1015\u103A": "eik",
        "\u102F\u1015\u103A": "ok",
        "\u103D\u1015\u103A": "ut",
        "\u1014\u103A\u102F\u1015\u103A": "nub",
        "\u1019\u103A": "an",
        "\u102D\u1019\u103A": "ein",
        "\u102F\u1019\u103A": "on",
        "\u103D\u1019\u103A": "un",
        "\u101A\u103A": "e",
        "\u102D\u102F\u101C\u103A": "ol",
        "\u1009\u103A": "in",
        "\u1036": "an",
        "\u102D\u1036": "ein",
        "\u102F\u1036": "on",
        // Dhivehi
        "\u07A6\u0787\u07B0": "ah",
        "\u07A6\u0781\u07B0": "ah"
      };
      var langCharMap = {
        "en": {},
        // default language
        "az": {
          // Azerbaijani
          "\xE7": "c",
          "\u0259": "e",
          "\u011F": "g",
          "\u0131": "i",
          "\xF6": "o",
          "\u015F": "s",
          "\xFC": "u",
          "\xC7": "C",
          "\u018F": "E",
          "\u011E": "G",
          "\u0130": "I",
          "\xD6": "O",
          "\u015E": "S",
          "\xDC": "U"
        },
        "cs": {
          // Czech
          "\u010D": "c",
          "\u010F": "d",
          "\u011B": "e",
          "\u0148": "n",
          "\u0159": "r",
          "\u0161": "s",
          "\u0165": "t",
          "\u016F": "u",
          "\u017E": "z",
          "\u010C": "C",
          "\u010E": "D",
          "\u011A": "E",
          "\u0147": "N",
          "\u0158": "R",
          "\u0160": "S",
          "\u0164": "T",
          "\u016E": "U",
          "\u017D": "Z"
        },
        "fi": {
          // Finnish
          // 'å': 'a', duplicate see charMap/latin
          // 'Å': 'A', duplicate see charMap/latin
          "\xE4": "a",
          // ok
          "\xC4": "A",
          // ok
          "\xF6": "o",
          // ok
          "\xD6": "O"
          // ok
        },
        "hu": {
          // Hungarian
          "\xE4": "a",
          // ok
          "\xC4": "A",
          // ok
          // 'á': 'a', duplicate see charMap/latin
          // 'Á': 'A', duplicate see charMap/latin
          "\xF6": "o",
          // ok
          "\xD6": "O",
          // ok
          // 'ő': 'o', duplicate see charMap/latin
          // 'Ő': 'O', duplicate see charMap/latin
          "\xFC": "u",
          "\xDC": "U",
          "\u0171": "u",
          "\u0170": "U"
        },
        "lt": {
          // Lithuanian
          "\u0105": "a",
          "\u010D": "c",
          "\u0119": "e",
          "\u0117": "e",
          "\u012F": "i",
          "\u0161": "s",
          "\u0173": "u",
          "\u016B": "u",
          "\u017E": "z",
          "\u0104": "A",
          "\u010C": "C",
          "\u0118": "E",
          "\u0116": "E",
          "\u012E": "I",
          "\u0160": "S",
          "\u0172": "U",
          "\u016A": "U"
        },
        "lv": {
          // Latvian
          "\u0101": "a",
          "\u010D": "c",
          "\u0113": "e",
          "\u0123": "g",
          "\u012B": "i",
          "\u0137": "k",
          "\u013C": "l",
          "\u0146": "n",
          "\u0161": "s",
          "\u016B": "u",
          "\u017E": "z",
          "\u0100": "A",
          "\u010C": "C",
          "\u0112": "E",
          "\u0122": "G",
          "\u012A": "i",
          "\u0136": "k",
          "\u013B": "L",
          "\u0145": "N",
          "\u0160": "S",
          "\u016A": "u",
          "\u017D": "Z"
        },
        "pl": {
          // Polish
          "\u0105": "a",
          "\u0107": "c",
          "\u0119": "e",
          "\u0142": "l",
          "\u0144": "n",
          "\xF3": "o",
          "\u015B": "s",
          "\u017A": "z",
          "\u017C": "z",
          "\u0104": "A",
          "\u0106": "C",
          "\u0118": "e",
          "\u0141": "L",
          "\u0143": "N",
          "\xD3": "O",
          "\u015A": "S",
          "\u0179": "Z",
          "\u017B": "Z"
        },
        "sv": {
          // Swedish
          // 'å': 'a', duplicate see charMap/latin
          // 'Å': 'A', duplicate see charMap/latin
          "\xE4": "a",
          // ok
          "\xC4": "A",
          // ok
          "\xF6": "o",
          // ok
          "\xD6": "O"
          // ok
        },
        "sk": {
          // Slovak
          "\xE4": "a",
          "\xC4": "A"
        },
        "sr": {
          // Serbian
          "\u0459": "lj",
          "\u045A": "nj",
          "\u0409": "Lj",
          "\u040A": "Nj",
          "\u0111": "dj",
          "\u0110": "Dj"
        },
        "tr": {
          // Turkish
          "\xDC": "U",
          "\xD6": "O",
          "\xFC": "u",
          "\xF6": "o"
        }
      };
      var symbolMap = {
        "ar": {
          "\u2206": "delta",
          "\u221E": "la-nihaya",
          "\u2665": "hob",
          "&": "wa",
          "|": "aw",
          "<": "aqal-men",
          ">": "akbar-men",
          "\u2211": "majmou",
          "\xA4": "omla"
        },
        "az": {},
        "ca": {
          "\u2206": "delta",
          "\u221E": "infinit",
          "\u2665": "amor",
          "&": "i",
          "|": "o",
          "<": "menys que",
          ">": "mes que",
          "\u2211": "suma dels",
          "\xA4": "moneda"
        },
        "cs": {
          "\u2206": "delta",
          "\u221E": "nekonecno",
          "\u2665": "laska",
          "&": "a",
          "|": "nebo",
          "<": "mensi nez",
          ">": "vetsi nez",
          "\u2211": "soucet",
          "\xA4": "mena"
        },
        "de": {
          "\u2206": "delta",
          "\u221E": "unendlich",
          "\u2665": "Liebe",
          "&": "und",
          "|": "oder",
          "<": "kleiner als",
          ">": "groesser als",
          "\u2211": "Summe von",
          "\xA4": "Waehrung"
        },
        "dv": {
          "\u2206": "delta",
          "\u221E": "kolunulaa",
          "\u2665": "loabi",
          "&": "aai",
          "|": "noonee",
          "<": "ah vure kuda",
          ">": "ah vure bodu",
          "\u2211": "jumula",
          "\xA4": "faisaa"
        },
        "en": {
          "\u2206": "delta",
          "\u221E": "infinity",
          "\u2665": "love",
          "&": "and",
          "|": "or",
          "<": "less than",
          ">": "greater than",
          "\u2211": "sum",
          "\xA4": "currency"
        },
        "es": {
          "\u2206": "delta",
          "\u221E": "infinito",
          "\u2665": "amor",
          "&": "y",
          "|": "u",
          "<": "menos que",
          ">": "mas que",
          "\u2211": "suma de los",
          "\xA4": "moneda"
        },
        "fa": {
          "\u2206": "delta",
          "\u221E": "bi-nahayat",
          "\u2665": "eshgh",
          "&": "va",
          "|": "ya",
          "<": "kamtar-az",
          ">": "bishtar-az",
          "\u2211": "majmooe",
          "\xA4": "vahed"
        },
        "fi": {
          "\u2206": "delta",
          "\u221E": "aarettomyys",
          "\u2665": "rakkaus",
          "&": "ja",
          "|": "tai",
          "<": "pienempi kuin",
          ">": "suurempi kuin",
          "\u2211": "summa",
          "\xA4": "valuutta"
        },
        "fr": {
          "\u2206": "delta",
          "\u221E": "infiniment",
          "\u2665": "Amour",
          "&": "et",
          "|": "ou",
          "<": "moins que",
          ">": "superieure a",
          "\u2211": "somme des",
          "\xA4": "monnaie"
        },
        "ge": {
          "\u2206": "delta",
          "\u221E": "usasruloba",
          "\u2665": "siqvaruli",
          "&": "da",
          "|": "an",
          "<": "naklebi",
          ">": "meti",
          "\u2211": "jami",
          "\xA4": "valuta"
        },
        "gr": {},
        "hu": {
          "\u2206": "delta",
          "\u221E": "vegtelen",
          "\u2665": "szerelem",
          "&": "es",
          "|": "vagy",
          "<": "kisebb mint",
          ">": "nagyobb mint",
          "\u2211": "szumma",
          "\xA4": "penznem"
        },
        "it": {
          "\u2206": "delta",
          "\u221E": "infinito",
          "\u2665": "amore",
          "&": "e",
          "|": "o",
          "<": "minore di",
          ">": "maggiore di",
          "\u2211": "somma",
          "\xA4": "moneta"
        },
        "lt": {
          "\u2206": "delta",
          "\u221E": "begalybe",
          "\u2665": "meile",
          "&": "ir",
          "|": "ar",
          "<": "maziau nei",
          ">": "daugiau nei",
          "\u2211": "suma",
          "\xA4": "valiuta"
        },
        "lv": {
          "\u2206": "delta",
          "\u221E": "bezgaliba",
          "\u2665": "milestiba",
          "&": "un",
          "|": "vai",
          "<": "mazak neka",
          ">": "lielaks neka",
          "\u2211": "summa",
          "\xA4": "valuta"
        },
        "my": {
          "\u2206": "kwahkhyaet",
          "\u221E": "asaonasme",
          "\u2665": "akhyait",
          "&": "nhin",
          "|": "tho",
          "<": "ngethaw",
          ">": "kyithaw",
          "\u2211": "paungld",
          "\xA4": "ngwekye"
        },
        "mk": {},
        "nl": {
          "\u2206": "delta",
          "\u221E": "oneindig",
          "\u2665": "liefde",
          "&": "en",
          "|": "of",
          "<": "kleiner dan",
          ">": "groter dan",
          "\u2211": "som",
          "\xA4": "valuta"
        },
        "pl": {
          "\u2206": "delta",
          "\u221E": "nieskonczonosc",
          "\u2665": "milosc",
          "&": "i",
          "|": "lub",
          "<": "mniejsze niz",
          ">": "wieksze niz",
          "\u2211": "suma",
          "\xA4": "waluta"
        },
        "pt": {
          "\u2206": "delta",
          "\u221E": "infinito",
          "\u2665": "amor",
          "&": "e",
          "|": "ou",
          "<": "menor que",
          ">": "maior que",
          "\u2211": "soma",
          "\xA4": "moeda"
        },
        "ro": {
          "\u2206": "delta",
          "\u221E": "infinit",
          "\u2665": "dragoste",
          "&": "si",
          "|": "sau",
          "<": "mai mic ca",
          ">": "mai mare ca",
          "\u2211": "suma",
          "\xA4": "valuta"
        },
        "ru": {
          "\u2206": "delta",
          "\u221E": "beskonechno",
          "\u2665": "lubov",
          "&": "i",
          "|": "ili",
          "<": "menshe",
          ">": "bolshe",
          "\u2211": "summa",
          "\xA4": "valjuta"
        },
        "sk": {
          "\u2206": "delta",
          "\u221E": "nekonecno",
          "\u2665": "laska",
          "&": "a",
          "|": "alebo",
          "<": "menej ako",
          ">": "viac ako",
          "\u2211": "sucet",
          "\xA4": "mena"
        },
        "sr": {},
        "tr": {
          "\u2206": "delta",
          "\u221E": "sonsuzluk",
          "\u2665": "ask",
          "&": "ve",
          "|": "veya",
          "<": "kucuktur",
          ">": "buyuktur",
          "\u2211": "toplam",
          "\xA4": "para birimi"
        },
        "uk": {
          "\u2206": "delta",
          "\u221E": "bezkinechnist",
          "\u2665": "lubov",
          "&": "i",
          "|": "abo",
          "<": "menshe",
          ">": "bilshe",
          "\u2211": "suma",
          "\xA4": "valjuta"
        },
        "vn": {
          "\u2206": "delta",
          "\u221E": "vo cuc",
          "\u2665": "yeu",
          "&": "va",
          "|": "hoac",
          "<": "nho hon",
          ">": "lon hon",
          "\u2211": "tong",
          "\xA4": "tien te"
        }
      };
      var uricChars = [";", "?", ":", "@", "&", "=", "+", "$", ",", "/"].join("");
      var uricNoSlashChars = [";", "?", ":", "@", "&", "=", "+", "$", ","].join("");
      var markChars = [".", "!", "~", "*", "'", "(", ")"].join("");
      var getSlug = function getSlug2(input, opts) {
        var separator = "-";
        var result = "";
        var diatricString = "";
        var convertSymbols = true;
        var customReplacements = {};
        var maintainCase;
        var titleCase;
        var truncate;
        var uricFlag;
        var uricNoSlashFlag;
        var markFlag;
        var symbol;
        var langChar;
        var lucky;
        var i;
        var ch;
        var l;
        var lastCharWasSymbol;
        var lastCharWasDiatric;
        var allowedChars = "";
        if (typeof input !== "string") {
          return "";
        }
        if (typeof opts === "string") {
          separator = opts;
        }
        symbol = symbolMap.en;
        langChar = langCharMap.en;
        if (typeof opts === "object") {
          maintainCase = opts.maintainCase || false;
          customReplacements = opts.custom && typeof opts.custom === "object" ? opts.custom : customReplacements;
          truncate = +opts.truncate > 1 && opts.truncate || false;
          uricFlag = opts.uric || false;
          uricNoSlashFlag = opts.uricNoSlash || false;
          markFlag = opts.mark || false;
          convertSymbols = opts.symbols === false || opts.lang === false ? false : true;
          separator = opts.separator || separator;
          if (uricFlag) {
            allowedChars += uricChars;
          }
          if (uricNoSlashFlag) {
            allowedChars += uricNoSlashChars;
          }
          if (markFlag) {
            allowedChars += markChars;
          }
          symbol = opts.lang && symbolMap[opts.lang] && convertSymbols ? symbolMap[opts.lang] : convertSymbols ? symbolMap.en : {};
          langChar = opts.lang && langCharMap[opts.lang] ? langCharMap[opts.lang] : opts.lang === false || opts.lang === true ? {} : langCharMap.en;
          if (opts.titleCase && typeof opts.titleCase.length === "number" && Array.prototype.toString.call(opts.titleCase)) {
            opts.titleCase.forEach(function(v) {
              customReplacements[v + ""] = v + "";
            });
            titleCase = true;
          } else {
            titleCase = !!opts.titleCase;
          }
          if (opts.custom && typeof opts.custom.length === "number" && Array.prototype.toString.call(opts.custom)) {
            opts.custom.forEach(function(v) {
              customReplacements[v + ""] = v + "";
            });
          }
          Object.keys(customReplacements).forEach(function(v) {
            var r;
            if (v.length > 1) {
              r = new RegExp("\\b" + escapeChars(v) + "\\b", "gi");
            } else {
              r = new RegExp(escapeChars(v), "gi");
            }
            input = input.replace(r, customReplacements[v]);
          });
          for (ch in customReplacements) {
            allowedChars += ch;
          }
        }
        allowedChars += separator;
        allowedChars = escapeChars(allowedChars);
        input = input.replace(/(^\s+|\s+$)/g, "");
        lastCharWasSymbol = false;
        lastCharWasDiatric = false;
        for (i = 0, l = input.length; i < l; i++) {
          ch = input[i];
          if (isReplacedCustomChar(ch, customReplacements)) {
            lastCharWasSymbol = false;
          } else if (langChar[ch]) {
            ch = lastCharWasSymbol && langChar[ch].match(/[A-Za-z0-9]/) ? " " + langChar[ch] : langChar[ch];
            lastCharWasSymbol = false;
          } else if (ch in charMap) {
            if (i + 1 < l && lookAheadCharArray.indexOf(input[i + 1]) >= 0) {
              diatricString += ch;
              ch = "";
            } else if (lastCharWasDiatric === true) {
              ch = diatricMap[diatricString] + charMap[ch];
              diatricString = "";
            } else {
              ch = lastCharWasSymbol && charMap[ch].match(/[A-Za-z0-9]/) ? " " + charMap[ch] : charMap[ch];
            }
            lastCharWasSymbol = false;
            lastCharWasDiatric = false;
          } else if (ch in diatricMap) {
            diatricString += ch;
            ch = "";
            if (i === l - 1) {
              ch = diatricMap[diatricString];
            }
            lastCharWasDiatric = true;
          } else if (
            // process symbol chars
            symbol[ch] && !(uricFlag && uricChars.indexOf(ch) !== -1) && !(uricNoSlashFlag && uricNoSlashChars.indexOf(ch) !== -1)
          ) {
            ch = lastCharWasSymbol || result.substr(-1).match(/[A-Za-z0-9]/) ? separator + symbol[ch] : symbol[ch];
            ch += input[i + 1] !== void 0 && input[i + 1].match(/[A-Za-z0-9]/) ? separator : "";
            lastCharWasSymbol = true;
          } else {
            if (lastCharWasDiatric === true) {
              ch = diatricMap[diatricString] + ch;
              diatricString = "";
              lastCharWasDiatric = false;
            } else if (lastCharWasSymbol && (/[A-Za-z0-9]/.test(ch) || result.substr(-1).match(/A-Za-z0-9]/))) {
              ch = " " + ch;
            }
            lastCharWasSymbol = false;
          }
          result += ch.replace(new RegExp("[^\\w\\s" + allowedChars + "_-]", "g"), separator);
        }
        if (titleCase) {
          result = result.replace(/(\w)(\S*)/g, function(_, i2, r) {
            var j = i2.toUpperCase() + (r !== null ? r : "");
            return Object.keys(customReplacements).indexOf(j.toLowerCase()) < 0 ? j : j.toLowerCase();
          });
        }
        result = result.replace(/\s+/g, separator).replace(new RegExp("\\" + separator + "+", "g"), separator).replace(new RegExp("(^\\" + separator + "+|\\" + separator + "+$)", "g"), "");
        if (truncate && result.length > truncate) {
          lucky = result.charAt(truncate) === separator;
          result = result.slice(0, truncate);
          if (!lucky) {
            result = result.slice(0, result.lastIndexOf(separator));
          }
        }
        if (!maintainCase && !titleCase) {
          result = result.toLowerCase();
        }
        return result;
      };
      var createSlug = function createSlug2(opts) {
        return function getSlugWithConfig(input) {
          return getSlug(input, opts);
        };
      };
      var escapeChars = function escapeChars2(input) {
        return input.replace(/[-\\^$*+?.()|[\]{}\/]/g, "\\$&");
      };
      var isReplacedCustomChar = function(ch, customReplacements) {
        for (var c in customReplacements) {
          if (customReplacements[c] === ch) {
            return true;
          }
        }
      };
      if (typeof module2 !== "undefined" && module2.exports) {
        module2.exports = getSlug;
        module2.exports.createSlug = createSlug;
      } else if (typeof define !== "undefined" && define.amd) {
        define([], function() {
          return getSlug;
        });
      } else {
        try {
          if (root.getSlug || root.createSlug) {
            throw "speakingurl: globals exists /(getSlug|createSlug)/";
          } else {
            root.getSlug = getSlug;
            root.createSlug = createSlug;
          }
        } catch (e) {
        }
      }
    })(exports2);
  }
});

// ../../node_modules/.pnpm/speakingurl@14.0.1/node_modules/speakingurl/index.js
var require_speakingurl2 = __commonJS({
  "../../node_modules/.pnpm/speakingurl@14.0.1/node_modules/speakingurl/index.js"(exports2, module2) {
    "use strict";
    init_cjs_shims();
    module2.exports = require_speakingurl();
  }
});

// src/index.ts
var index_exports = {};
__export(index_exports, {
  DevToolsContextHookKeys: () => DevToolsContextHookKeys,
  DevToolsMessagingHookKeys: () => DevToolsMessagingHookKeys,
  DevToolsV6PluginAPIHookKeys: () => DevToolsV6PluginAPIHookKeys,
  INFINITY: () => INFINITY,
  NAN: () => NAN,
  NEGATIVE_INFINITY: () => NEGATIVE_INFINITY,
  ROUTER_INFO_KEY: () => ROUTER_INFO_KEY,
  ROUTER_KEY: () => ROUTER_KEY,
  UNDEFINED: () => UNDEFINED,
  activeAppRecord: () => activeAppRecord,
  addCustomCommand: () => addCustomCommand,
  addCustomTab: () => addCustomTab,
  addDevToolsAppRecord: () => addDevToolsAppRecord,
  addDevToolsPluginToBuffer: () => addDevToolsPluginToBuffer,
  addInspector: () => addInspector,
  callConnectedUpdatedHook: () => callConnectedUpdatedHook,
  callDevToolsPluginSetupFn: () => callDevToolsPluginSetupFn,
  callInspectorUpdatedHook: () => callInspectorUpdatedHook,
  callStateUpdatedHook: () => callStateUpdatedHook,
  createComponentsDevToolsPlugin: () => createComponentsDevToolsPlugin,
  createDevToolsApi: () => createDevToolsApi,
  createDevToolsCtxHooks: () => createDevToolsCtxHooks,
  createRpcClient: () => createRpcClient,
  createRpcProxy: () => createRpcProxy,
  createRpcServer: () => createRpcServer,
  devtools: () => devtools,
  devtoolsAppRecords: () => devtoolsAppRecords,
  devtoolsContext: () => devtoolsContext,
  devtoolsInspector: () => devtoolsInspector,
  devtoolsPluginBuffer: () => devtoolsPluginBuffer,
  devtoolsRouter: () => devtoolsRouter,
  devtoolsRouterInfo: () => devtoolsRouterInfo,
  devtoolsState: () => devtoolsState,
  escape: () => escape,
  formatInspectorStateValue: () => formatInspectorStateValue,
  getActiveInspectors: () => getActiveInspectors,
  getDevToolsEnv: () => getDevToolsEnv,
  getExtensionClientContext: () => getExtensionClientContext,
  getInspector: () => getInspector,
  getInspectorActions: () => getInspectorActions,
  getInspectorInfo: () => getInspectorInfo,
  getInspectorNodeActions: () => getInspectorNodeActions,
  getInspectorStateValueType: () => getInspectorStateValueType,
  getRaw: () => getRaw,
  getRpcClient: () => getRpcClient,
  getRpcServer: () => getRpcServer,
  getViteRpcClient: () => getViteRpcClient,
  getViteRpcServer: () => getViteRpcServer,
  initDevTools: () => initDevTools,
  isPlainObject: () => isPlainObject,
  onDevToolsClientConnected: () => onDevToolsClientConnected,
  onDevToolsConnected: () => onDevToolsConnected,
  parse: () => parse2,
  registerDevToolsPlugin: () => registerDevToolsPlugin,
  removeCustomCommand: () => removeCustomCommand,
  removeDevToolsAppRecord: () => removeDevToolsAppRecord,
  removeRegisteredPluginApp: () => removeRegisteredPluginApp,
  resetDevToolsState: () => resetDevToolsState,
  setActiveAppRecord: () => setActiveAppRecord,
  setActiveAppRecordId: () => setActiveAppRecordId,
  setDevToolsEnv: () => setDevToolsEnv,
  setElectronClientContext: () => setElectronClientContext,
  setElectronProxyContext: () => setElectronProxyContext,
  setElectronServerContext: () => setElectronServerContext,
  setExtensionClientContext: () => setExtensionClientContext,
  setIframeServerContext: () => setIframeServerContext,
  setOpenInEditorBaseUrl: () => setOpenInEditorBaseUrl,
  setRpcServerToGlobal: () => setRpcServerToGlobal,
  setViteClientContext: () => setViteClientContext,
  setViteRpcClientToGlobal: () => setViteRpcClientToGlobal,
  setViteRpcServerToGlobal: () => setViteRpcServerToGlobal,
  setViteServerContext: () => setViteServerContext,
  setupDevToolsPlugin: () => setupDevToolsPlugin,
  stringify: () => stringify2,
  toEdit: () => toEdit,
  toSubmit: () => toSubmit,
  toggleClientConnected: () => toggleClientConnected,
  toggleComponentInspectorEnabled: () => toggleComponentInspectorEnabled,
  toggleHighPerfMode: () => toggleHighPerfMode,
  updateDevToolsClientDetected: () => updateDevToolsClientDetected,
  updateDevToolsState: () => updateDevToolsState,
  updateTimelineLayersState: () => updateTimelineLayersState
});
module.exports = __toCommonJS(index_exports);
init_cjs_shims();

// src/core/index.ts
init_cjs_shims();
var import_devtools_shared21 = require("@vue/devtools-shared");

// src/compat/index.ts
init_cjs_shims();
var import_devtools_shared = require("@vue/devtools-shared");
function onLegacyDevToolsPluginApiAvailable(cb) {
  if (import_devtools_shared.target.__VUE_DEVTOOLS_PLUGIN_API_AVAILABLE__) {
    cb();
    return;
  }
  Object.defineProperty(import_devtools_shared.target, "__VUE_DEVTOOLS_PLUGIN_API_AVAILABLE__", {
    set(value) {
      if (value)
        cb();
    },
    configurable: true
  });
}

// src/ctx/index.ts
init_cjs_shims();
var import_devtools_shared19 = require("@vue/devtools-shared");

// src/ctx/api.ts
init_cjs_shims();
var import_devtools_shared17 = require("@vue/devtools-shared");

// src/core/component-highlighter/index.ts
init_cjs_shims();

// src/core/component/state/bounding-rect.ts
init_cjs_shims();

// src/core/component/utils/index.ts
init_cjs_shims();
var import_devtools_shared2 = require("@vue/devtools-shared");
function getComponentTypeName(options) {
  var _a25;
  const name = options.name || options._componentTag || options.__VUE_DEVTOOLS_COMPONENT_GUSSED_NAME__ || options.__name;
  if (name === "index" && ((_a25 = options.__file) == null ? void 0 : _a25.endsWith("index.vue"))) {
    return "";
  }
  return name;
}
function getComponentFileName(options) {
  const file = options.__file;
  if (file)
    return (0, import_devtools_shared2.classify)((0, import_devtools_shared2.basename)(file, ".vue"));
}
function getComponentName(options) {
  const name = options.displayName || options.name || options._componentTag;
  if (name)
    return name;
  return getComponentFileName(options);
}
function saveComponentGussedName(instance, name) {
  instance.type.__VUE_DEVTOOLS_COMPONENT_GUSSED_NAME__ = name;
  return name;
}
function getAppRecord(instance) {
  if (instance.__VUE_DEVTOOLS_NEXT_APP_RECORD__)
    return instance.__VUE_DEVTOOLS_NEXT_APP_RECORD__;
  else if (instance.root)
    return instance.appContext.app.__VUE_DEVTOOLS_NEXT_APP_RECORD__;
}
async function getComponentId(options) {
  const { app, uid, instance } = options;
  try {
    if (instance.__VUE_DEVTOOLS_NEXT_UID__)
      return instance.__VUE_DEVTOOLS_NEXT_UID__;
    const appRecord = await getAppRecord(app);
    if (!appRecord)
      return null;
    const isRoot = appRecord.rootInstance === instance;
    return `${appRecord.id}:${isRoot ? "root" : uid}`;
  } catch (e) {
  }
}
function isFragment(instance) {
  var _a25, _b25;
  const subTreeType = (_a25 = instance.subTree) == null ? void 0 : _a25.type;
  const appRecord = getAppRecord(instance);
  if (appRecord) {
    return ((_b25 = appRecord == null ? void 0 : appRecord.types) == null ? void 0 : _b25.Fragment) === subTreeType;
  }
  return false;
}
function isBeingDestroyed(instance) {
  return instance._isBeingDestroyed || instance.isUnmounted;
}
function getInstanceName(instance) {
  var _a25, _b25, _c;
  const name = getComponentTypeName((instance == null ? void 0 : instance.type) || {});
  if (name)
    return name;
  if ((instance == null ? void 0 : instance.root) === instance)
    return "Root";
  for (const key in (_b25 = (_a25 = instance.parent) == null ? void 0 : _a25.type) == null ? void 0 : _b25.components) {
    if (instance.parent.type.components[key] === (instance == null ? void 0 : instance.type))
      return saveComponentGussedName(instance, key);
  }
  for (const key in (_c = instance.appContext) == null ? void 0 : _c.components) {
    if (instance.appContext.components[key] === (instance == null ? void 0 : instance.type))
      return saveComponentGussedName(instance, key);
  }
  const fileName = getComponentFileName((instance == null ? void 0 : instance.type) || {});
  if (fileName)
    return fileName;
  return "Anonymous Component";
}
function getUniqueComponentId(instance) {
  var _a25, _b25, _c;
  const appId = (_c = (_b25 = (_a25 = instance == null ? void 0 : instance.appContext) == null ? void 0 : _a25.app) == null ? void 0 : _b25.__VUE_DEVTOOLS_NEXT_APP_RECORD_ID__) != null ? _c : 0;
  const instanceId = instance === (instance == null ? void 0 : instance.root) ? "root" : instance.uid;
  return `${appId}:${instanceId}`;
}
function getRenderKey(value) {
  if (value == null)
    return "";
  if (typeof value === "number")
    return value;
  else if (typeof value === "string")
    return `'${value}'`;
  else if (Array.isArray(value))
    return "Array";
  else
    return "Object";
}
function returnError(cb) {
  try {
    return cb();
  } catch (e) {
    return e;
  }
}
function getComponentInstance(appRecord, instanceId) {
  instanceId = instanceId || `${appRecord.id}:root`;
  const instance = appRecord.instanceMap.get(instanceId);
  return instance || appRecord.instanceMap.get(":root");
}
function ensurePropertyExists(obj, key, skipObjCheck = false) {
  return skipObjCheck ? key in obj : typeof obj === "object" && obj !== null ? key in obj : false;
}

// src/core/component/state/bounding-rect.ts
function createRect() {
  const rect = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    get width() {
      return rect.right - rect.left;
    },
    get height() {
      return rect.bottom - rect.top;
    }
  };
  return rect;
}
var range;
function getTextRect(node) {
  if (!range)
    range = document.createRange();
  range.selectNode(node);
  return range.getBoundingClientRect();
}
function getFragmentRect(vnode) {
  const rect = createRect();
  if (!vnode.children)
    return rect;
  for (let i = 0, l = vnode.children.length; i < l; i++) {
    const childVnode = vnode.children[i];
    let childRect;
    if (childVnode.component) {
      childRect = getComponentBoundingRect(childVnode.component);
    } else if (childVnode.el) {
      const el = childVnode.el;
      if (el.nodeType === 1 || el.getBoundingClientRect)
        childRect = el.getBoundingClientRect();
      else if (el.nodeType === 3 && el.data.trim())
        childRect = getTextRect(el);
    }
    if (childRect)
      mergeRects(rect, childRect);
  }
  return rect;
}
function mergeRects(a, b) {
  if (!a.top || b.top < a.top)
    a.top = b.top;
  if (!a.bottom || b.bottom > a.bottom)
    a.bottom = b.bottom;
  if (!a.left || b.left < a.left)
    a.left = b.left;
  if (!a.right || b.right > a.right)
    a.right = b.right;
  return a;
}
var DEFAULT_RECT = {
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: 0,
  height: 0
};
function getComponentBoundingRect(instance) {
  const el = instance.subTree.el;
  if (typeof window === "undefined") {
    return DEFAULT_RECT;
  }
  if (isFragment(instance))
    return getFragmentRect(instance.subTree);
  else if ((el == null ? void 0 : el.nodeType) === 1)
    return el == null ? void 0 : el.getBoundingClientRect();
  else if (instance.subTree.component)
    return getComponentBoundingRect(instance.subTree.component);
  else
    return DEFAULT_RECT;
}

// src/core/component/tree/el.ts
init_cjs_shims();
function getRootElementsFromComponentInstance(instance) {
  if (isFragment(instance))
    return getFragmentRootElements(instance.subTree);
  if (!instance.subTree)
    return [];
  return [instance.subTree.el];
}
function getFragmentRootElements(vnode) {
  if (!vnode.children)
    return [];
  const list = [];
  vnode.children.forEach((childVnode) => {
    if (childVnode.component)
      list.push(...getRootElementsFromComponentInstance(childVnode.component));
    else if (childVnode == null ? void 0 : childVnode.el)
      list.push(childVnode.el);
  });
  return list;
}

// src/core/component-highlighter/index.ts
var CONTAINER_ELEMENT_ID = "__vue-devtools-component-inspector__";
var CARD_ELEMENT_ID = "__vue-devtools-component-inspector__card__";
var COMPONENT_NAME_ELEMENT_ID = "__vue-devtools-component-inspector__name__";
var INDICATOR_ELEMENT_ID = "__vue-devtools-component-inspector__indicator__";
var containerStyles = {
  display: "block",
  zIndex: 2147483640,
  position: "fixed",
  backgroundColor: "#42b88325",
  border: "1px solid #42b88350",
  borderRadius: "5px",
  transition: "all 0.1s ease-in",
  pointerEvents: "none"
};
var cardStyles = {
  fontFamily: "Arial, Helvetica, sans-serif",
  padding: "5px 8px",
  borderRadius: "4px",
  textAlign: "left",
  position: "absolute",
  left: 0,
  color: "#e9e9e9",
  fontSize: "14px",
  fontWeight: 600,
  lineHeight: "24px",
  backgroundColor: "#42b883",
  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)"
};
var indicatorStyles = {
  display: "inline-block",
  fontWeight: 400,
  fontStyle: "normal",
  fontSize: "12px",
  opacity: 0.7
};
function getContainerElement() {
  return document.getElementById(CONTAINER_ELEMENT_ID);
}
function getCardElement() {
  return document.getElementById(CARD_ELEMENT_ID);
}
function getIndicatorElement() {
  return document.getElementById(INDICATOR_ELEMENT_ID);
}
function getNameElement() {
  return document.getElementById(COMPONENT_NAME_ELEMENT_ID);
}
function getStyles(bounds) {
  return {
    left: `${Math.round(bounds.left * 100) / 100}px`,
    top: `${Math.round(bounds.top * 100) / 100}px`,
    width: `${Math.round(bounds.width * 100) / 100}px`,
    height: `${Math.round(bounds.height * 100) / 100}px`
  };
}
function create(options) {
  var _a25;
  const containerEl = document.createElement("div");
  containerEl.id = (_a25 = options.elementId) != null ? _a25 : CONTAINER_ELEMENT_ID;
  Object.assign(containerEl.style, {
    ...containerStyles,
    ...getStyles(options.bounds),
    ...options.style
  });
  const cardEl = document.createElement("span");
  cardEl.id = CARD_ELEMENT_ID;
  Object.assign(cardEl.style, {
    ...cardStyles,
    top: options.bounds.top < 35 ? 0 : "-35px"
  });
  const nameEl = document.createElement("span");
  nameEl.id = COMPONENT_NAME_ELEMENT_ID;
  nameEl.innerHTML = `&lt;${options.name}&gt;&nbsp;&nbsp;`;
  const indicatorEl = document.createElement("i");
  indicatorEl.id = INDICATOR_ELEMENT_ID;
  indicatorEl.innerHTML = `${Math.round(options.bounds.width * 100) / 100} x ${Math.round(options.bounds.height * 100) / 100}`;
  Object.assign(indicatorEl.style, indicatorStyles);
  cardEl.appendChild(nameEl);
  cardEl.appendChild(indicatorEl);
  containerEl.appendChild(cardEl);
  document.body.appendChild(containerEl);
  return containerEl;
}
function update(options) {
  const containerEl = getContainerElement();
  const cardEl = getCardElement();
  const nameEl = getNameElement();
  const indicatorEl = getIndicatorElement();
  if (containerEl) {
    Object.assign(containerEl.style, {
      ...containerStyles,
      ...getStyles(options.bounds)
    });
    Object.assign(cardEl.style, {
      top: options.bounds.top < 35 ? 0 : "-35px"
    });
    nameEl.innerHTML = `&lt;${options.name}&gt;&nbsp;&nbsp;`;
    indicatorEl.innerHTML = `${Math.round(options.bounds.width * 100) / 100} x ${Math.round(options.bounds.height * 100) / 100}`;
  }
}
function highlight(instance) {
  const bounds = getComponentBoundingRect(instance);
  if (!bounds.width && !bounds.height)
    return;
  const name = getInstanceName(instance);
  const container = getContainerElement();
  container ? update({ bounds, name }) : create({ bounds, name });
}
function unhighlight() {
  const el = getContainerElement();
  if (el)
    el.style.display = "none";
}
var inspectInstance = null;
function inspectFn(e) {
  const target22 = e.target;
  if (target22) {
    const instance = target22.__vueParentComponent;
    if (instance) {
      inspectInstance = instance;
      const el = instance.vnode.el;
      if (el) {
        const bounds = getComponentBoundingRect(instance);
        const name = getInstanceName(instance);
        const container = getContainerElement();
        container ? update({ bounds, name }) : create({ bounds, name });
      }
    }
  }
}
function selectComponentFn(e, cb) {
  e.preventDefault();
  e.stopPropagation();
  if (inspectInstance) {
    const uniqueComponentId = getUniqueComponentId(inspectInstance);
    cb(uniqueComponentId);
  }
}
var inspectComponentHighLighterSelectFn = null;
function cancelInspectComponentHighLighter() {
  unhighlight();
  window.removeEventListener("mouseover", inspectFn);
  window.removeEventListener("click", inspectComponentHighLighterSelectFn, true);
  inspectComponentHighLighterSelectFn = null;
}
function inspectComponentHighLighter() {
  window.addEventListener("mouseover", inspectFn);
  return new Promise((resolve) => {
    function onSelect(e) {
      e.preventDefault();
      e.stopPropagation();
      selectComponentFn(e, (id) => {
        window.removeEventListener("click", onSelect, true);
        inspectComponentHighLighterSelectFn = null;
        window.removeEventListener("mouseover", inspectFn);
        const el = getContainerElement();
        if (el)
          el.style.display = "none";
        resolve(JSON.stringify({ id }));
      });
    }
    inspectComponentHighLighterSelectFn = onSelect;
    window.addEventListener("click", onSelect, true);
  });
}
function scrollToComponent(options) {
  const instance = getComponentInstance(activeAppRecord.value, options.id);
  if (instance) {
    const [el] = getRootElementsFromComponentInstance(instance);
    if (typeof el.scrollIntoView === "function") {
      el.scrollIntoView({
        behavior: "smooth"
      });
    } else {
      const bounds = getComponentBoundingRect(instance);
      const scrollTarget = document.createElement("div");
      const styles = {
        ...getStyles(bounds),
        position: "absolute"
      };
      Object.assign(scrollTarget.style, styles);
      document.body.appendChild(scrollTarget);
      scrollTarget.scrollIntoView({
        behavior: "smooth"
      });
      setTimeout(() => {
        document.body.removeChild(scrollTarget);
      }, 2e3);
    }
    setTimeout(() => {
      const bounds = getComponentBoundingRect(instance);
      if (bounds.width || bounds.height) {
        const name = getInstanceName(instance);
        const el2 = getContainerElement();
        el2 ? update({ ...options, name, bounds }) : create({ ...options, name, bounds });
        setTimeout(() => {
          if (el2)
            el2.style.display = "none";
        }, 1500);
      }
    }, 1200);
  }
}

// src/core/component-inspector/index.ts
init_cjs_shims();
var import_devtools_shared3 = require("@vue/devtools-shared");
var _a, _b;
(_b = (_a = import_devtools_shared3.target).__VUE_DEVTOOLS_COMPONENT_INSPECTOR_ENABLED__) != null ? _b : _a.__VUE_DEVTOOLS_COMPONENT_INSPECTOR_ENABLED__ = true;
function toggleComponentInspectorEnabled(enabled) {
  import_devtools_shared3.target.__VUE_DEVTOOLS_COMPONENT_INSPECTOR_ENABLED__ = enabled;
}
function waitForInspectorInit(cb) {
  let total = 0;
  const timer = setInterval(() => {
    if (import_devtools_shared3.target.__VUE_INSPECTOR__) {
      clearInterval(timer);
      total += 30;
      cb();
    }
    if (total >= /* 5s */
    5e3)
      clearInterval(timer);
  }, 30);
}
function setupInspector() {
  const inspector = import_devtools_shared3.target.__VUE_INSPECTOR__;
  const _openInEditor = inspector.openInEditor;
  inspector.openInEditor = async (...params) => {
    inspector.disable();
    _openInEditor(...params);
  };
}
function getComponentInspector() {
  return new Promise((resolve) => {
    function setup() {
      setupInspector();
      resolve(import_devtools_shared3.target.__VUE_INSPECTOR__);
    }
    if (!import_devtools_shared3.target.__VUE_INSPECTOR__) {
      waitForInspectorInit(() => {
        setup();
      });
    } else {
      setup();
    }
  });
}

// src/core/component/state/editor.ts
init_cjs_shims();

// src/shared/stub-vue.ts
init_cjs_shims();
function isReadonly(value) {
  return !!(value && value["__v_isReadonly" /* IS_READONLY */]);
}
function isReactive(value) {
  if (isReadonly(value)) {
    return isReactive(value["__v_raw" /* RAW */]);
  }
  return !!(value && value["__v_isReactive" /* IS_REACTIVE */]);
}
function isRef(r) {
  return !!(r && r.__v_isRef === true);
}
function toRaw(observed) {
  const raw = observed && observed["__v_raw" /* RAW */];
  return raw ? toRaw(raw) : observed;
}
var Fragment = Symbol.for("v-fgt");

// src/core/component/state/editor.ts
var StateEditor = class {
  constructor() {
    this.refEditor = new RefStateEditor();
  }
  set(object, path, value, cb) {
    const sections = Array.isArray(path) ? path : path.split(".");
    const markRef = false;
    while (sections.length > 1) {
      const section = sections.shift();
      if (object instanceof Map)
        object = object.get(section);
      else if (object instanceof Set)
        object = Array.from(object.values())[section];
      else object = object[section];
      if (this.refEditor.isRef(object))
        object = this.refEditor.get(object);
    }
    const field = sections[0];
    const item = this.refEditor.get(object)[field];
    if (cb) {
      cb(object, field, value);
    } else {
      if (this.refEditor.isRef(item))
        this.refEditor.set(item, value);
      else if (markRef)
        object[field] = value;
      else
        object[field] = value;
    }
  }
  get(object, path) {
    const sections = Array.isArray(path) ? path : path.split(".");
    for (let i = 0; i < sections.length; i++) {
      if (object instanceof Map)
        object = object.get(sections[i]);
      else
        object = object[sections[i]];
      if (this.refEditor.isRef(object))
        object = this.refEditor.get(object);
      if (!object)
        return void 0;
    }
    return object;
  }
  has(object, path, parent = false) {
    if (typeof object === "undefined")
      return false;
    const sections = Array.isArray(path) ? path.slice() : path.split(".");
    const size = !parent ? 1 : 2;
    while (object && sections.length > size) {
      const section = sections.shift();
      object = object[section];
      if (this.refEditor.isRef(object))
        object = this.refEditor.get(object);
    }
    return object != null && Object.prototype.hasOwnProperty.call(object, sections[0]);
  }
  createDefaultSetCallback(state) {
    return (object, field, value) => {
      if (state.remove || state.newKey) {
        if (Array.isArray(object))
          object.splice(field, 1);
        else if (toRaw(object) instanceof Map)
          object.delete(field);
        else if (toRaw(object) instanceof Set)
          object.delete(Array.from(object.values())[field]);
        else Reflect.deleteProperty(object, field);
      }
      if (!state.remove) {
        const target22 = object[state.newKey || field];
        if (this.refEditor.isRef(target22))
          this.refEditor.set(target22, value);
        else if (toRaw(object) instanceof Map)
          object.set(state.newKey || field, value);
        else if (toRaw(object) instanceof Set)
          object.add(value);
        else
          object[state.newKey || field] = value;
      }
    };
  }
};
var RefStateEditor = class {
  set(ref, value) {
    if (isRef(ref)) {
      ref.value = value;
    } else {
      if (ref instanceof Set && Array.isArray(value)) {
        ref.clear();
        value.forEach((v) => ref.add(v));
        return;
      }
      const currentKeys = Object.keys(value);
      if (ref instanceof Map) {
        const previousKeysSet2 = new Set(ref.keys());
        currentKeys.forEach((key) => {
          ref.set(key, Reflect.get(value, key));
          previousKeysSet2.delete(key);
        });
        previousKeysSet2.forEach((key) => ref.delete(key));
        return;
      }
      const previousKeysSet = new Set(Object.keys(ref));
      currentKeys.forEach((key) => {
        Reflect.set(ref, key, Reflect.get(value, key));
        previousKeysSet.delete(key);
      });
      previousKeysSet.forEach((key) => Reflect.deleteProperty(ref, key));
    }
  }
  get(ref) {
    return isRef(ref) ? ref.value : ref;
  }
  isRef(ref) {
    return isRef(ref) || isReactive(ref);
  }
};
async function editComponentState(payload, stateEditor2) {
  const { path, nodeId, state, type } = payload;
  const instance = getComponentInstance(activeAppRecord.value, nodeId);
  if (!instance)
    return;
  const targetPath = path.slice();
  let target22;
  if (Object.keys(instance.props).includes(path[0])) {
    target22 = instance.props;
  } else if (instance.devtoolsRawSetupState && Object.keys(instance.devtoolsRawSetupState).includes(path[0])) {
    target22 = instance.devtoolsRawSetupState;
  } else if (instance.data && Object.keys(instance.data).includes(path[0])) {
    target22 = instance.data;
  } else {
    target22 = instance.proxy;
  }
  if (target22 && targetPath) {
    if (state.type === "object" && type === "reactive") {
    }
    stateEditor2.set(target22, targetPath, state.value, stateEditor2.createDefaultSetCallback(state));
  }
}
var stateEditor = new StateEditor();
async function editState(payload) {
  editComponentState(payload, stateEditor);
}

// src/core/open-in-editor/index.ts
init_cjs_shims();
var import_devtools_shared8 = require("@vue/devtools-shared");

// src/ctx/state.ts
init_cjs_shims();
var import_devtools_shared7 = require("@vue/devtools-shared");
var import_perfect_debounce3 = require("perfect-debounce");

// src/core/timeline/storage.ts
init_cjs_shims();
var import_devtools_shared4 = require("@vue/devtools-shared");
var TIMELINE_LAYERS_STATE_STORAGE_ID = "__VUE_DEVTOOLS_KIT_TIMELINE_LAYERS_STATE__";
function addTimelineLayersStateToStorage(state) {
  if (!import_devtools_shared4.isBrowser || typeof localStorage === "undefined" || localStorage === null) {
    return;
  }
  localStorage.setItem(TIMELINE_LAYERS_STATE_STORAGE_ID, JSON.stringify(state));
}
function getTimelineLayersStateFromStorage() {
  if (!import_devtools_shared4.isBrowser || typeof localStorage === "undefined" || localStorage === null) {
    return {
      recordingState: false,
      mouseEventEnabled: false,
      keyboardEventEnabled: false,
      componentEventEnabled: false,
      performanceEventEnabled: false,
      selected: ""
    };
  }
  const state = localStorage.getItem(TIMELINE_LAYERS_STATE_STORAGE_ID);
  return state ? JSON.parse(state) : {
    recordingState: false,
    mouseEventEnabled: false,
    keyboardEventEnabled: false,
    componentEventEnabled: false,
    performanceEventEnabled: false,
    selected: ""
  };
}

// src/ctx/hook.ts
init_cjs_shims();
var import_hookable = require("hookable");
var import_perfect_debounce2 = require("perfect-debounce");

// src/ctx/inspector.ts
init_cjs_shims();
var import_devtools_shared6 = require("@vue/devtools-shared");
var import_perfect_debounce = require("perfect-debounce");

// src/ctx/timeline.ts
init_cjs_shims();
var import_devtools_shared5 = require("@vue/devtools-shared");
var _a2, _b2;
(_b2 = (_a2 = import_devtools_shared5.target).__VUE_DEVTOOLS_KIT_TIMELINE_LAYERS) != null ? _b2 : _a2.__VUE_DEVTOOLS_KIT_TIMELINE_LAYERS = [];
var devtoolsTimelineLayers = new Proxy(import_devtools_shared5.target.__VUE_DEVTOOLS_KIT_TIMELINE_LAYERS, {
  get(target22, prop, receiver) {
    return Reflect.get(target22, prop, receiver);
  }
});
function addTimelineLayer(options, descriptor) {
  devtoolsState.timelineLayersState[descriptor.id] = false;
  devtoolsTimelineLayers.push({
    ...options,
    descriptorId: descriptor.id,
    appRecord: getAppRecord(descriptor.app)
  });
}
function updateTimelineLayersState(state) {
  const updatedState = {
    ...devtoolsState.timelineLayersState,
    ...state
  };
  addTimelineLayersStateToStorage(updatedState);
  updateDevToolsState({
    timelineLayersState: updatedState
  });
}

// src/ctx/inspector.ts
var _a3, _b3;
(_b3 = (_a3 = import_devtools_shared6.target).__VUE_DEVTOOLS_KIT_INSPECTOR__) != null ? _b3 : _a3.__VUE_DEVTOOLS_KIT_INSPECTOR__ = [];
var devtoolsInspector = new Proxy(import_devtools_shared6.target.__VUE_DEVTOOLS_KIT_INSPECTOR__, {
  get(target22, prop, receiver) {
    return Reflect.get(target22, prop, receiver);
  }
});
var callInspectorUpdatedHook = (0, import_perfect_debounce.debounce)(() => {
  devtoolsContext.hooks.callHook("sendInspectorToClient" /* SEND_INSPECTOR_TO_CLIENT */, getActiveInspectors());
});
function addInspector(inspector, descriptor) {
  var _a25, _b25;
  devtoolsInspector.push({
    options: inspector,
    descriptor,
    treeFilterPlaceholder: (_a25 = inspector.treeFilterPlaceholder) != null ? _a25 : "Search tree...",
    stateFilterPlaceholder: (_b25 = inspector.stateFilterPlaceholder) != null ? _b25 : "Search state...",
    treeFilter: "",
    selectedNodeId: "",
    appRecord: getAppRecord(descriptor.app)
  });
  callInspectorUpdatedHook();
}
function getActiveInspectors() {
  return devtoolsInspector.filter((inspector) => inspector.descriptor.app === activeAppRecord.value.app).filter((inspector) => inspector.descriptor.id !== "components").map((inspector) => {
    var _a25;
    const descriptor = inspector.descriptor;
    const options = inspector.options;
    return {
      id: options.id,
      label: options.label,
      logo: descriptor.logo,
      icon: `custom-ic-baseline-${(_a25 = options == null ? void 0 : options.icon) == null ? void 0 : _a25.replace(/_/g, "-")}`,
      packageName: descriptor.packageName,
      homepage: descriptor.homepage,
      pluginId: descriptor.id
    };
  });
}
function getInspectorInfo(id) {
  const inspector = getInspector(id, activeAppRecord.value.app);
  if (!inspector)
    return;
  const descriptor = inspector.descriptor;
  const options = inspector.options;
  const timelineLayers = devtoolsTimelineLayers.filter((layer) => layer.descriptorId === descriptor.id).map((item) => ({
    id: item.id,
    label: item.label,
    color: item.color
  }));
  return {
    id: options.id,
    label: options.label,
    logo: descriptor.logo,
    packageName: descriptor.packageName,
    homepage: descriptor.homepage,
    timelineLayers,
    treeFilterPlaceholder: inspector.treeFilterPlaceholder,
    stateFilterPlaceholder: inspector.stateFilterPlaceholder
  };
}
function getInspector(id, app) {
  return devtoolsInspector.find((inspector) => inspector.options.id === id && (app ? inspector.descriptor.app === app : true));
}
function getInspectorActions(id) {
  const inspector = getInspector(id);
  return inspector == null ? void 0 : inspector.options.actions;
}
function getInspectorNodeActions(id) {
  const inspector = getInspector(id);
  return inspector == null ? void 0 : inspector.options.nodeActions;
}

// src/ctx/hook.ts
var DevToolsV6PluginAPIHookKeys = /* @__PURE__ */ ((DevToolsV6PluginAPIHookKeys2) => {
  DevToolsV6PluginAPIHookKeys2["VISIT_COMPONENT_TREE"] = "visitComponentTree";
  DevToolsV6PluginAPIHookKeys2["INSPECT_COMPONENT"] = "inspectComponent";
  DevToolsV6PluginAPIHookKeys2["EDIT_COMPONENT_STATE"] = "editComponentState";
  DevToolsV6PluginAPIHookKeys2["GET_INSPECTOR_TREE"] = "getInspectorTree";
  DevToolsV6PluginAPIHookKeys2["GET_INSPECTOR_STATE"] = "getInspectorState";
  DevToolsV6PluginAPIHookKeys2["EDIT_INSPECTOR_STATE"] = "editInspectorState";
  DevToolsV6PluginAPIHookKeys2["INSPECT_TIMELINE_EVENT"] = "inspectTimelineEvent";
  DevToolsV6PluginAPIHookKeys2["TIMELINE_CLEARED"] = "timelineCleared";
  DevToolsV6PluginAPIHookKeys2["SET_PLUGIN_SETTINGS"] = "setPluginSettings";
  return DevToolsV6PluginAPIHookKeys2;
})(DevToolsV6PluginAPIHookKeys || {});
var DevToolsContextHookKeys = /* @__PURE__ */ ((DevToolsContextHookKeys2) => {
  DevToolsContextHookKeys2["ADD_INSPECTOR"] = "addInspector";
  DevToolsContextHookKeys2["SEND_INSPECTOR_TREE"] = "sendInspectorTree";
  DevToolsContextHookKeys2["SEND_INSPECTOR_STATE"] = "sendInspectorState";
  DevToolsContextHookKeys2["CUSTOM_INSPECTOR_SELECT_NODE"] = "customInspectorSelectNode";
  DevToolsContextHookKeys2["TIMELINE_LAYER_ADDED"] = "timelineLayerAdded";
  DevToolsContextHookKeys2["TIMELINE_EVENT_ADDED"] = "timelineEventAdded";
  DevToolsContextHookKeys2["GET_COMPONENT_INSTANCES"] = "getComponentInstances";
  DevToolsContextHookKeys2["GET_COMPONENT_BOUNDS"] = "getComponentBounds";
  DevToolsContextHookKeys2["GET_COMPONENT_NAME"] = "getComponentName";
  DevToolsContextHookKeys2["COMPONENT_HIGHLIGHT"] = "componentHighlight";
  DevToolsContextHookKeys2["COMPONENT_UNHIGHLIGHT"] = "componentUnhighlight";
  return DevToolsContextHookKeys2;
})(DevToolsContextHookKeys || {});
var DevToolsMessagingHookKeys = /* @__PURE__ */ ((DevToolsMessagingHookKeys2) => {
  DevToolsMessagingHookKeys2["SEND_INSPECTOR_TREE_TO_CLIENT"] = "sendInspectorTreeToClient";
  DevToolsMessagingHookKeys2["SEND_INSPECTOR_STATE_TO_CLIENT"] = "sendInspectorStateToClient";
  DevToolsMessagingHookKeys2["SEND_TIMELINE_EVENT_TO_CLIENT"] = "sendTimelineEventToClient";
  DevToolsMessagingHookKeys2["SEND_INSPECTOR_TO_CLIENT"] = "sendInspectorToClient";
  DevToolsMessagingHookKeys2["SEND_ACTIVE_APP_UNMOUNTED_TO_CLIENT"] = "sendActiveAppUpdatedToClient";
  DevToolsMessagingHookKeys2["DEVTOOLS_STATE_UPDATED"] = "devtoolsStateUpdated";
  DevToolsMessagingHookKeys2["DEVTOOLS_CONNECTED_UPDATED"] = "devtoolsConnectedUpdated";
  DevToolsMessagingHookKeys2["ROUTER_INFO_UPDATED"] = "routerInfoUpdated";
  return DevToolsMessagingHookKeys2;
})(DevToolsMessagingHookKeys || {});
function createDevToolsCtxHooks() {
  const hooks2 = (0, import_hookable.createHooks)();
  hooks2.hook("addInspector" /* ADD_INSPECTOR */, ({ inspector, plugin }) => {
    addInspector(inspector, plugin.descriptor);
  });
  const debounceSendInspectorTree = (0, import_perfect_debounce2.debounce)(async ({ inspectorId, plugin }) => {
    var _a25;
    if (!inspectorId || !((_a25 = plugin == null ? void 0 : plugin.descriptor) == null ? void 0 : _a25.app) || devtoolsState.highPerfModeEnabled)
      return;
    const inspector = getInspector(inspectorId, plugin.descriptor.app);
    const _payload = {
      app: plugin.descriptor.app,
      inspectorId,
      filter: (inspector == null ? void 0 : inspector.treeFilter) || "",
      rootNodes: []
    };
    await new Promise((resolve) => {
      hooks2.callHookWith(async (callbacks) => {
        await Promise.all(callbacks.map((cb) => cb(_payload)));
        resolve();
      }, "getInspectorTree" /* GET_INSPECTOR_TREE */);
    });
    hooks2.callHookWith(async (callbacks) => {
      await Promise.all(callbacks.map((cb) => cb({
        inspectorId,
        rootNodes: _payload.rootNodes
      })));
    }, "sendInspectorTreeToClient" /* SEND_INSPECTOR_TREE_TO_CLIENT */);
  }, 120);
  hooks2.hook("sendInspectorTree" /* SEND_INSPECTOR_TREE */, debounceSendInspectorTree);
  const debounceSendInspectorState = (0, import_perfect_debounce2.debounce)(async ({ inspectorId, plugin }) => {
    var _a25;
    if (!inspectorId || !((_a25 = plugin == null ? void 0 : plugin.descriptor) == null ? void 0 : _a25.app) || devtoolsState.highPerfModeEnabled)
      return;
    const inspector = getInspector(inspectorId, plugin.descriptor.app);
    const _payload = {
      app: plugin.descriptor.app,
      inspectorId,
      nodeId: (inspector == null ? void 0 : inspector.selectedNodeId) || "",
      state: null
    };
    const ctx = {
      currentTab: `custom-inspector:${inspectorId}`
    };
    if (_payload.nodeId) {
      await new Promise((resolve) => {
        hooks2.callHookWith(async (callbacks) => {
          await Promise.all(callbacks.map((cb) => cb(_payload, ctx)));
          resolve();
        }, "getInspectorState" /* GET_INSPECTOR_STATE */);
      });
    }
    hooks2.callHookWith(async (callbacks) => {
      await Promise.all(callbacks.map((cb) => cb({
        inspectorId,
        nodeId: _payload.nodeId,
        state: _payload.state
      })));
    }, "sendInspectorStateToClient" /* SEND_INSPECTOR_STATE_TO_CLIENT */);
  }, 120);
  hooks2.hook("sendInspectorState" /* SEND_INSPECTOR_STATE */, debounceSendInspectorState);
  hooks2.hook("customInspectorSelectNode" /* CUSTOM_INSPECTOR_SELECT_NODE */, ({ inspectorId, nodeId, plugin }) => {
    const inspector = getInspector(inspectorId, plugin.descriptor.app);
    if (!inspector)
      return;
    inspector.selectedNodeId = nodeId;
  });
  hooks2.hook("timelineLayerAdded" /* TIMELINE_LAYER_ADDED */, ({ options, plugin }) => {
    addTimelineLayer(options, plugin.descriptor);
  });
  hooks2.hook("timelineEventAdded" /* TIMELINE_EVENT_ADDED */, ({ options, plugin }) => {
    var _a25;
    const internalLayerIds = ["performance", "component-event", "keyboard", "mouse"];
    if (devtoolsState.highPerfModeEnabled || !((_a25 = devtoolsState.timelineLayersState) == null ? void 0 : _a25[plugin.descriptor.id]) && !internalLayerIds.includes(options.layerId))
      return;
    hooks2.callHookWith(async (callbacks) => {
      await Promise.all(callbacks.map((cb) => cb(options)));
    }, "sendTimelineEventToClient" /* SEND_TIMELINE_EVENT_TO_CLIENT */);
  });
  hooks2.hook("getComponentInstances" /* GET_COMPONENT_INSTANCES */, async ({ app }) => {
    const appRecord = app.__VUE_DEVTOOLS_NEXT_APP_RECORD__;
    if (!appRecord)
      return null;
    const appId = appRecord.id.toString();
    const instances = [...appRecord.instanceMap].filter(([key]) => key.split(":")[0] === appId).map(([, instance]) => instance);
    return instances;
  });
  hooks2.hook("getComponentBounds" /* GET_COMPONENT_BOUNDS */, async ({ instance }) => {
    const bounds = getComponentBoundingRect(instance);
    return bounds;
  });
  hooks2.hook("getComponentName" /* GET_COMPONENT_NAME */, ({ instance }) => {
    const name = getInstanceName(instance);
    return name;
  });
  hooks2.hook("componentHighlight" /* COMPONENT_HIGHLIGHT */, ({ uid }) => {
    const instance = activeAppRecord.value.instanceMap.get(uid);
    if (instance) {
      highlight(instance);
    }
  });
  hooks2.hook("componentUnhighlight" /* COMPONENT_UNHIGHLIGHT */, () => {
    unhighlight();
  });
  return hooks2;
}

// src/ctx/state.ts
var _a4, _b4;
(_b4 = (_a4 = import_devtools_shared7.target).__VUE_DEVTOOLS_KIT_APP_RECORDS__) != null ? _b4 : _a4.__VUE_DEVTOOLS_KIT_APP_RECORDS__ = [];
var _a5, _b5;
(_b5 = (_a5 = import_devtools_shared7.target).__VUE_DEVTOOLS_KIT_ACTIVE_APP_RECORD__) != null ? _b5 : _a5.__VUE_DEVTOOLS_KIT_ACTIVE_APP_RECORD__ = {};
var _a6, _b6;
(_b6 = (_a6 = import_devtools_shared7.target).__VUE_DEVTOOLS_KIT_ACTIVE_APP_RECORD_ID__) != null ? _b6 : _a6.__VUE_DEVTOOLS_KIT_ACTIVE_APP_RECORD_ID__ = "";
var _a7, _b7;
(_b7 = (_a7 = import_devtools_shared7.target).__VUE_DEVTOOLS_KIT_CUSTOM_TABS__) != null ? _b7 : _a7.__VUE_DEVTOOLS_KIT_CUSTOM_TABS__ = [];
var _a8, _b8;
(_b8 = (_a8 = import_devtools_shared7.target).__VUE_DEVTOOLS_KIT_CUSTOM_COMMANDS__) != null ? _b8 : _a8.__VUE_DEVTOOLS_KIT_CUSTOM_COMMANDS__ = [];
var STATE_KEY = "__VUE_DEVTOOLS_KIT_GLOBAL_STATE__";
function initStateFactory() {
  return {
    connected: false,
    clientConnected: false,
    vitePluginDetected: true,
    appRecords: [],
    activeAppRecordId: "",
    tabs: [],
    commands: [],
    highPerfModeEnabled: true,
    devtoolsClientDetected: {},
    perfUniqueGroupId: 0,
    timelineLayersState: getTimelineLayersStateFromStorage()
  };
}
var _a9, _b9;
(_b9 = (_a9 = import_devtools_shared7.target)[STATE_KEY]) != null ? _b9 : _a9[STATE_KEY] = initStateFactory();
var callStateUpdatedHook = (0, import_perfect_debounce3.debounce)((state) => {
  devtoolsContext.hooks.callHook("devtoolsStateUpdated" /* DEVTOOLS_STATE_UPDATED */, { state });
});
var callConnectedUpdatedHook = (0, import_perfect_debounce3.debounce)((state, oldState) => {
  devtoolsContext.hooks.callHook("devtoolsConnectedUpdated" /* DEVTOOLS_CONNECTED_UPDATED */, { state, oldState });
});
var devtoolsAppRecords = new Proxy(import_devtools_shared7.target.__VUE_DEVTOOLS_KIT_APP_RECORDS__, {
  get(_target, prop, receiver) {
    if (prop === "value")
      return import_devtools_shared7.target.__VUE_DEVTOOLS_KIT_APP_RECORDS__;
    return import_devtools_shared7.target.__VUE_DEVTOOLS_KIT_APP_RECORDS__[prop];
  }
});
var addDevToolsAppRecord = (app) => {
  import_devtools_shared7.target.__VUE_DEVTOOLS_KIT_APP_RECORDS__ = [
    ...import_devtools_shared7.target.__VUE_DEVTOOLS_KIT_APP_RECORDS__,
    app
  ];
};
var removeDevToolsAppRecord = (app) => {
  import_devtools_shared7.target.__VUE_DEVTOOLS_KIT_APP_RECORDS__ = devtoolsAppRecords.value.filter((record) => record.app !== app);
};
var activeAppRecord = new Proxy(import_devtools_shared7.target.__VUE_DEVTOOLS_KIT_ACTIVE_APP_RECORD__, {
  get(_target, prop, receiver) {
    if (prop === "value")
      return import_devtools_shared7.target.__VUE_DEVTOOLS_KIT_ACTIVE_APP_RECORD__;
    else if (prop === "id")
      return import_devtools_shared7.target.__VUE_DEVTOOLS_KIT_ACTIVE_APP_RECORD_ID__;
    return import_devtools_shared7.target.__VUE_DEVTOOLS_KIT_ACTIVE_APP_RECORD__[prop];
  }
});
function updateAllStates() {
  callStateUpdatedHook({
    ...import_devtools_shared7.target[STATE_KEY],
    appRecords: devtoolsAppRecords.value,
    activeAppRecordId: activeAppRecord.id,
    tabs: import_devtools_shared7.target.__VUE_DEVTOOLS_KIT_CUSTOM_TABS__,
    commands: import_devtools_shared7.target.__VUE_DEVTOOLS_KIT_CUSTOM_COMMANDS__
  });
}
function setActiveAppRecord(app) {
  import_devtools_shared7.target.__VUE_DEVTOOLS_KIT_ACTIVE_APP_RECORD__ = app;
  updateAllStates();
}
function setActiveAppRecordId(id) {
  import_devtools_shared7.target.__VUE_DEVTOOLS_KIT_ACTIVE_APP_RECORD_ID__ = id;
  updateAllStates();
}
var devtoolsState = new Proxy(import_devtools_shared7.target[STATE_KEY], {
  get(target22, property) {
    if (property === "appRecords") {
      return devtoolsAppRecords;
    } else if (property === "activeAppRecordId") {
      return activeAppRecord.id;
    } else if (property === "tabs") {
      return import_devtools_shared7.target.__VUE_DEVTOOLS_KIT_CUSTOM_TABS__;
    } else if (property === "commands") {
      return import_devtools_shared7.target.__VUE_DEVTOOLS_KIT_CUSTOM_COMMANDS__;
    }
    return import_devtools_shared7.target[STATE_KEY][property];
  },
  deleteProperty(target22, property) {
    delete target22[property];
    return true;
  },
  set(target22, property, value) {
    const oldState = { ...import_devtools_shared7.target[STATE_KEY] };
    target22[property] = value;
    import_devtools_shared7.target[STATE_KEY][property] = value;
    return true;
  }
});
function resetDevToolsState() {
  Object.assign(import_devtools_shared7.target[STATE_KEY], initStateFactory());
}
function updateDevToolsState(state) {
  const oldState = {
    ...import_devtools_shared7.target[STATE_KEY],
    appRecords: devtoolsAppRecords.value,
    activeAppRecordId: activeAppRecord.id
  };
  if (oldState.connected !== state.connected && state.connected || oldState.clientConnected !== state.clientConnected && state.clientConnected) {
    callConnectedUpdatedHook(import_devtools_shared7.target[STATE_KEY], oldState);
  }
  Object.assign(import_devtools_shared7.target[STATE_KEY], state);
  updateAllStates();
}
function onDevToolsConnected(fn) {
  return new Promise((resolve) => {
    if (devtoolsState.connected) {
      fn();
      resolve();
    }
    devtoolsContext.hooks.hook("devtoolsConnectedUpdated" /* DEVTOOLS_CONNECTED_UPDATED */, ({ state }) => {
      if (state.connected) {
        fn();
        resolve();
      }
    });
  });
}
var resolveIcon = (icon) => {
  if (!icon)
    return;
  if (icon.startsWith("baseline-")) {
    return `custom-ic-${icon}`;
  }
  if (icon.startsWith("i-") || (0, import_devtools_shared7.isUrlString)(icon))
    return icon;
  return `custom-ic-baseline-${icon}`;
};
function addCustomTab(tab) {
  const tabs = import_devtools_shared7.target.__VUE_DEVTOOLS_KIT_CUSTOM_TABS__;
  if (tabs.some((t) => t.name === tab.name))
    return;
  tabs.push({
    ...tab,
    icon: resolveIcon(tab.icon)
  });
  updateAllStates();
}
function addCustomCommand(action) {
  const commands = import_devtools_shared7.target.__VUE_DEVTOOLS_KIT_CUSTOM_COMMANDS__;
  if (commands.some((t) => t.id === action.id))
    return;
  commands.push({
    ...action,
    icon: resolveIcon(action.icon),
    children: action.children ? action.children.map((child) => ({
      ...child,
      icon: resolveIcon(child.icon)
    })) : void 0
  });
  updateAllStates();
}
function removeCustomCommand(actionId) {
  const commands = import_devtools_shared7.target.__VUE_DEVTOOLS_KIT_CUSTOM_COMMANDS__;
  const index = commands.findIndex((t) => t.id === actionId);
  if (index === -1)
    return;
  commands.splice(index, 1);
  updateAllStates();
}
function toggleClientConnected(state) {
  updateDevToolsState({ clientConnected: state });
}

// src/core/open-in-editor/index.ts
function setOpenInEditorBaseUrl(url) {
  import_devtools_shared8.target.__VUE_DEVTOOLS_OPEN_IN_EDITOR_BASE_URL__ = url;
}
function openInEditor(options = {}) {
  var _a25, _b25, _c;
  const { file, host, baseUrl = window.location.origin, line = 0, column = 0 } = options;
  if (file) {
    if (host === "chrome-extension") {
      const fileName = file.replace(/\\/g, "\\\\");
      const _baseUrl = (_b25 = (_a25 = window.VUE_DEVTOOLS_CONFIG) == null ? void 0 : _a25.openInEditorHost) != null ? _b25 : "/";
      fetch(`${_baseUrl}__open-in-editor?file=${encodeURI(file)}`).then((response) => {
        if (!response.ok) {
          const msg = `Opening component ${fileName} failed`;
          console.log(`%c${msg}`, "color:red");
        }
      });
    } else if (devtoolsState.vitePluginDetected) {
      const _baseUrl = (_c = import_devtools_shared8.target.__VUE_DEVTOOLS_OPEN_IN_EDITOR_BASE_URL__) != null ? _c : baseUrl;
      import_devtools_shared8.target.__VUE_INSPECTOR__.openInEditor(_baseUrl, file, line, column);
    }
  }
}

// src/core/plugin/index.ts
init_cjs_shims();
var import_devtools_shared14 = require("@vue/devtools-shared");

// src/api/index.ts
init_cjs_shims();

// src/api/v6/index.ts
init_cjs_shims();

// src/core/plugin/plugin-settings.ts
init_cjs_shims();

// src/ctx/plugin.ts
init_cjs_shims();
var import_devtools_shared9 = require("@vue/devtools-shared");
var _a10, _b10;
(_b10 = (_a10 = import_devtools_shared9.target).__VUE_DEVTOOLS_KIT_PLUGIN_BUFFER__) != null ? _b10 : _a10.__VUE_DEVTOOLS_KIT_PLUGIN_BUFFER__ = [];
var devtoolsPluginBuffer = new Proxy(import_devtools_shared9.target.__VUE_DEVTOOLS_KIT_PLUGIN_BUFFER__, {
  get(target22, prop, receiver) {
    return Reflect.get(target22, prop, receiver);
  }
});
function addDevToolsPluginToBuffer(pluginDescriptor, setupFn) {
  devtoolsPluginBuffer.push([pluginDescriptor, setupFn]);
}

// src/core/plugin/plugin-settings.ts
function _getSettings(settings) {
  const _settings = {};
  Object.keys(settings).forEach((key) => {
    _settings[key] = settings[key].defaultValue;
  });
  return _settings;
}
function getPluginLocalKey(pluginId) {
  return `__VUE_DEVTOOLS_NEXT_PLUGIN_SETTINGS__${pluginId}__`;
}
function getPluginSettingsOptions(pluginId) {
  var _a25, _b25, _c;
  const item = (_b25 = (_a25 = devtoolsPluginBuffer.find((item2) => {
    var _a26;
    return item2[0].id === pluginId && !!((_a26 = item2[0]) == null ? void 0 : _a26.settings);
  })) == null ? void 0 : _a25[0]) != null ? _b25 : null;
  return (_c = item == null ? void 0 : item.settings) != null ? _c : null;
}
function getPluginSettings(pluginId, fallbackValue) {
  var _a25, _b25, _c;
  const localKey = getPluginLocalKey(pluginId);
  if (localKey) {
    const localSettings = localStorage.getItem(localKey);
    if (localSettings) {
      return JSON.parse(localSettings);
    }
  }
  if (pluginId) {
    const item = (_b25 = (_a25 = devtoolsPluginBuffer.find((item2) => item2[0].id === pluginId)) == null ? void 0 : _a25[0]) != null ? _b25 : null;
    return _getSettings((_c = item == null ? void 0 : item.settings) != null ? _c : {});
  }
  return _getSettings(fallbackValue);
}
function initPluginSettings(pluginId, settings) {
  const localKey = getPluginLocalKey(pluginId);
  const localSettings = localStorage.getItem(localKey);
  if (!localSettings) {
    localStorage.setItem(localKey, JSON.stringify(_getSettings(settings)));
  }
}
function setPluginSettings(pluginId, key, value) {
  const localKey = getPluginLocalKey(pluginId);
  const localSettings = localStorage.getItem(localKey);
  const parsedLocalSettings = JSON.parse(localSettings || "{}");
  const updated = {
    ...parsedLocalSettings,
    [key]: value
  };
  localStorage.setItem(localKey, JSON.stringify(updated));
  devtoolsContext.hooks.callHookWith((callbacks) => {
    callbacks.forEach((cb) => cb({
      pluginId,
      key,
      oldValue: parsedLocalSettings[key],
      newValue: value,
      settings: updated
    }));
  }, "setPluginSettings" /* SET_PLUGIN_SETTINGS */);
}

// src/hook/index.ts
init_cjs_shims();
var import_devtools_shared10 = require("@vue/devtools-shared");
var import_hookable2 = require("hookable");

// src/types/index.ts
init_cjs_shims();

// src/types/app.ts
init_cjs_shims();

// src/types/command.ts
init_cjs_shims();

// src/types/component.ts
init_cjs_shims();

// src/types/hook.ts
init_cjs_shims();

// src/types/inspector.ts
init_cjs_shims();

// src/types/plugin.ts
init_cjs_shims();

// src/types/router.ts
init_cjs_shims();

// src/types/tab.ts
init_cjs_shims();

// src/types/timeline.ts
init_cjs_shims();

// src/hook/index.ts
var _a11, _b11;
var devtoolsHooks = (_b11 = (_a11 = import_devtools_shared10.target).__VUE_DEVTOOLS_HOOK) != null ? _b11 : _a11.__VUE_DEVTOOLS_HOOK = (0, import_hookable2.createHooks)();
var on = {
  vueAppInit(fn) {
    devtoolsHooks.hook("app:init" /* APP_INIT */, fn);
  },
  vueAppUnmount(fn) {
    devtoolsHooks.hook("app:unmount" /* APP_UNMOUNT */, fn);
  },
  vueAppConnected(fn) {
    devtoolsHooks.hook("app:connected" /* APP_CONNECTED */, fn);
  },
  componentAdded(fn) {
    return devtoolsHooks.hook("component:added" /* COMPONENT_ADDED */, fn);
  },
  componentEmit(fn) {
    return devtoolsHooks.hook("component:emit" /* COMPONENT_EMIT */, fn);
  },
  componentUpdated(fn) {
    return devtoolsHooks.hook("component:updated" /* COMPONENT_UPDATED */, fn);
  },
  componentRemoved(fn) {
    return devtoolsHooks.hook("component:removed" /* COMPONENT_REMOVED */, fn);
  },
  setupDevtoolsPlugin(fn) {
    devtoolsHooks.hook("devtools-plugin:setup" /* SETUP_DEVTOOLS_PLUGIN */, fn);
  },
  perfStart(fn) {
    return devtoolsHooks.hook("perf:start" /* PERFORMANCE_START */, fn);
  },
  perfEnd(fn) {
    return devtoolsHooks.hook("perf:end" /* PERFORMANCE_END */, fn);
  }
};
function createDevToolsHook() {
  return {
    id: "vue-devtools-next",
    devtoolsVersion: "7.0",
    enabled: false,
    appRecords: [],
    apps: [],
    events: /* @__PURE__ */ new Map(),
    on(event, fn) {
      var _a25;
      if (!this.events.has(event))
        this.events.set(event, []);
      (_a25 = this.events.get(event)) == null ? void 0 : _a25.push(fn);
      return () => this.off(event, fn);
    },
    once(event, fn) {
      const onceFn = (...args) => {
        this.off(event, onceFn);
        fn(...args);
      };
      this.on(event, onceFn);
      return [event, onceFn];
    },
    off(event, fn) {
      if (this.events.has(event)) {
        const eventCallbacks = this.events.get(event);
        const index = eventCallbacks.indexOf(fn);
        if (index !== -1)
          eventCallbacks.splice(index, 1);
      }
    },
    emit(event, ...payload) {
      if (this.events.has(event))
        this.events.get(event).forEach((fn) => fn(...payload));
    }
  };
}
function subscribeDevToolsHook(hook2) {
  hook2.on("app:init" /* APP_INIT */, (app, version, types) => {
    var _a25, _b25, _c;
    if ((_c = (_b25 = (_a25 = app == null ? void 0 : app._instance) == null ? void 0 : _a25.type) == null ? void 0 : _b25.devtools) == null ? void 0 : _c.hide)
      return;
    devtoolsHooks.callHook("app:init" /* APP_INIT */, app, version, types);
  });
  hook2.on("app:unmount" /* APP_UNMOUNT */, (app) => {
    devtoolsHooks.callHook("app:unmount" /* APP_UNMOUNT */, app);
  });
  hook2.on("component:added" /* COMPONENT_ADDED */, async (app, uid, parentUid, component) => {
    var _a25, _b25, _c;
    if (((_c = (_b25 = (_a25 = app == null ? void 0 : app._instance) == null ? void 0 : _a25.type) == null ? void 0 : _b25.devtools) == null ? void 0 : _c.hide) || devtoolsState.highPerfModeEnabled)
      return;
    if (!app || typeof uid !== "number" && !uid || !component)
      return;
    devtoolsHooks.callHook("component:added" /* COMPONENT_ADDED */, app, uid, parentUid, component);
  });
  hook2.on("component:updated" /* COMPONENT_UPDATED */, (app, uid, parentUid, component) => {
    if (!app || typeof uid !== "number" && !uid || !component || devtoolsState.highPerfModeEnabled)
      return;
    devtoolsHooks.callHook("component:updated" /* COMPONENT_UPDATED */, app, uid, parentUid, component);
  });
  hook2.on("component:removed" /* COMPONENT_REMOVED */, async (app, uid, parentUid, component) => {
    if (!app || typeof uid !== "number" && !uid || !component || devtoolsState.highPerfModeEnabled)
      return;
    devtoolsHooks.callHook("component:removed" /* COMPONENT_REMOVED */, app, uid, parentUid, component);
  });
  hook2.on("component:emit" /* COMPONENT_EMIT */, async (app, instance, event, params) => {
    if (!app || !instance || devtoolsState.highPerfModeEnabled)
      return;
    devtoolsHooks.callHook("component:emit" /* COMPONENT_EMIT */, app, instance, event, params);
  });
  hook2.on("perf:start" /* PERFORMANCE_START */, (app, uid, vm, type, time) => {
    if (!app || devtoolsState.highPerfModeEnabled)
      return;
    devtoolsHooks.callHook("perf:start" /* PERFORMANCE_START */, app, uid, vm, type, time);
  });
  hook2.on("perf:end" /* PERFORMANCE_END */, (app, uid, vm, type, time) => {
    if (!app || devtoolsState.highPerfModeEnabled)
      return;
    devtoolsHooks.callHook("perf:end" /* PERFORMANCE_END */, app, uid, vm, type, time);
  });
  hook2.on("devtools-plugin:setup" /* SETUP_DEVTOOLS_PLUGIN */, (pluginDescriptor, setupFn, options) => {
    if ((options == null ? void 0 : options.target) === "legacy")
      return;
    devtoolsHooks.callHook("devtools-plugin:setup" /* SETUP_DEVTOOLS_PLUGIN */, pluginDescriptor, setupFn);
  });
}
var hook = {
  on,
  setupDevToolsPlugin(pluginDescriptor, setupFn) {
    return devtoolsHooks.callHook("devtools-plugin:setup" /* SETUP_DEVTOOLS_PLUGIN */, pluginDescriptor, setupFn);
  }
};

// src/api/v6/index.ts
var DevToolsV6PluginAPI = class {
  constructor({ plugin, ctx }) {
    this.hooks = ctx.hooks;
    this.plugin = plugin;
  }
  get on() {
    return {
      // component inspector
      visitComponentTree: (handler) => {
        this.hooks.hook("visitComponentTree" /* VISIT_COMPONENT_TREE */, handler);
      },
      inspectComponent: (handler) => {
        this.hooks.hook("inspectComponent" /* INSPECT_COMPONENT */, handler);
      },
      editComponentState: (handler) => {
        this.hooks.hook("editComponentState" /* EDIT_COMPONENT_STATE */, handler);
      },
      // custom inspector
      getInspectorTree: (handler) => {
        this.hooks.hook("getInspectorTree" /* GET_INSPECTOR_TREE */, handler);
      },
      getInspectorState: (handler) => {
        this.hooks.hook("getInspectorState" /* GET_INSPECTOR_STATE */, handler);
      },
      editInspectorState: (handler) => {
        this.hooks.hook("editInspectorState" /* EDIT_INSPECTOR_STATE */, handler);
      },
      // timeline
      inspectTimelineEvent: (handler) => {
        this.hooks.hook("inspectTimelineEvent" /* INSPECT_TIMELINE_EVENT */, handler);
      },
      timelineCleared: (handler) => {
        this.hooks.hook("timelineCleared" /* TIMELINE_CLEARED */, handler);
      },
      // settings
      setPluginSettings: (handler) => {
        this.hooks.hook("setPluginSettings" /* SET_PLUGIN_SETTINGS */, handler);
      }
    };
  }
  // component inspector
  notifyComponentUpdate(instance) {
    var _a25;
    if (devtoolsState.highPerfModeEnabled) {
      return;
    }
    const inspector = getActiveInspectors().find((i) => i.packageName === this.plugin.descriptor.packageName);
    if (inspector == null ? void 0 : inspector.id) {
      if (instance) {
        const args = [
          instance.appContext.app,
          instance.uid,
          (_a25 = instance.parent) == null ? void 0 : _a25.uid,
          instance
        ];
        devtoolsHooks.callHook("component:updated" /* COMPONENT_UPDATED */, ...args);
      } else {
        devtoolsHooks.callHook("component:updated" /* COMPONENT_UPDATED */);
      }
      this.hooks.callHook("sendInspectorState" /* SEND_INSPECTOR_STATE */, { inspectorId: inspector.id, plugin: this.plugin });
    }
  }
  // custom inspector
  addInspector(options) {
    this.hooks.callHook("addInspector" /* ADD_INSPECTOR */, { inspector: options, plugin: this.plugin });
    if (this.plugin.descriptor.settings) {
      initPluginSettings(options.id, this.plugin.descriptor.settings);
    }
  }
  sendInspectorTree(inspectorId) {
    if (devtoolsState.highPerfModeEnabled) {
      return;
    }
    this.hooks.callHook("sendInspectorTree" /* SEND_INSPECTOR_TREE */, { inspectorId, plugin: this.plugin });
  }
  sendInspectorState(inspectorId) {
    if (devtoolsState.highPerfModeEnabled) {
      return;
    }
    this.hooks.callHook("sendInspectorState" /* SEND_INSPECTOR_STATE */, { inspectorId, plugin: this.plugin });
  }
  selectInspectorNode(inspectorId, nodeId) {
    this.hooks.callHook("customInspectorSelectNode" /* CUSTOM_INSPECTOR_SELECT_NODE */, { inspectorId, nodeId, plugin: this.plugin });
  }
  visitComponentTree(payload) {
    return this.hooks.callHook("visitComponentTree" /* VISIT_COMPONENT_TREE */, payload);
  }
  // timeline
  now() {
    if (devtoolsState.highPerfModeEnabled) {
      return 0;
    }
    return Date.now();
  }
  addTimelineLayer(options) {
    this.hooks.callHook("timelineLayerAdded" /* TIMELINE_LAYER_ADDED */, { options, plugin: this.plugin });
  }
  addTimelineEvent(options) {
    if (devtoolsState.highPerfModeEnabled) {
      return;
    }
    this.hooks.callHook("timelineEventAdded" /* TIMELINE_EVENT_ADDED */, { options, plugin: this.plugin });
  }
  // settings
  getSettings(pluginId) {
    return getPluginSettings(pluginId != null ? pluginId : this.plugin.descriptor.id, this.plugin.descriptor.settings);
  }
  // utilities
  getComponentInstances(app) {
    return this.hooks.callHook("getComponentInstances" /* GET_COMPONENT_INSTANCES */, { app });
  }
  getComponentBounds(instance) {
    return this.hooks.callHook("getComponentBounds" /* GET_COMPONENT_BOUNDS */, { instance });
  }
  getComponentName(instance) {
    return this.hooks.callHook("getComponentName" /* GET_COMPONENT_NAME */, { instance });
  }
  highlightElement(instance) {
    const uid = instance.__VUE_DEVTOOLS_NEXT_UID__;
    return this.hooks.callHook("componentHighlight" /* COMPONENT_HIGHLIGHT */, { uid });
  }
  unhighlightElement() {
    return this.hooks.callHook("componentUnhighlight" /* COMPONENT_UNHIGHLIGHT */);
  }
};

// src/api/index.ts
var DevToolsPluginAPI = DevToolsV6PluginAPI;

// src/core/plugin/components.ts
init_cjs_shims();
var import_perfect_debounce4 = require("perfect-debounce");

// src/core/component/state/index.ts
init_cjs_shims();

// src/core/component/state/process.ts
init_cjs_shims();
var import_devtools_shared11 = require("@vue/devtools-shared");

// src/core/component/state/constants.ts
init_cjs_shims();
var vueBuiltins = /* @__PURE__ */ new Set([
  "nextTick",
  "defineComponent",
  "defineAsyncComponent",
  "defineCustomElement",
  "ref",
  "computed",
  "reactive",
  "readonly",
  "watchEffect",
  "watchPostEffect",
  "watchSyncEffect",
  "watch",
  "isRef",
  "unref",
  "toRef",
  "toRefs",
  "isProxy",
  "isReactive",
  "isReadonly",
  "shallowRef",
  "triggerRef",
  "customRef",
  "shallowReactive",
  "shallowReadonly",
  "toRaw",
  "markRaw",
  "effectScope",
  "getCurrentScope",
  "onScopeDispose",
  "onMounted",
  "onUpdated",
  "onUnmounted",
  "onBeforeMount",
  "onBeforeUpdate",
  "onBeforeUnmount",
  "onErrorCaptured",
  "onRenderTracked",
  "onRenderTriggered",
  "onActivated",
  "onDeactivated",
  "onServerPrefetch",
  "provide",
  "inject",
  "h",
  "mergeProps",
  "cloneVNode",
  "isVNode",
  "resolveComponent",
  "resolveDirective",
  "withDirectives",
  "withModifiers"
]);
var symbolRE = /^\[native Symbol Symbol\((.*)\)\]$/;
var rawTypeRE = /^\[object (\w+)\]$/;
var specialTypeRE = /^\[native (\w+) (.*?)(<>(([\s\S])*))?\]$/;
var fnTypeRE = /^(?:function|class) (\w+)/;
var MAX_STRING_SIZE = 1e4;
var MAX_ARRAY_SIZE = 5e3;
var UNDEFINED = "__vue_devtool_undefined__";
var INFINITY = "__vue_devtool_infinity__";
var NEGATIVE_INFINITY = "__vue_devtool_negative_infinity__";
var NAN = "__vue_devtool_nan__";
var ESC = {
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "&": "&amp;"
};

// src/core/component/state/util.ts
init_cjs_shims();

// src/core/component/state/is.ts
init_cjs_shims();
function isVueInstance(value) {
  if (!ensurePropertyExists(value, "_")) {
    return false;
  }
  if (!isPlainObject(value._)) {
    return false;
  }
  return Object.keys(value._).includes("vnode");
}
function isPlainObject(obj) {
  return Object.prototype.toString.call(obj) === "[object Object]";
}
function isPrimitive(data) {
  if (data == null)
    return true;
  const type = typeof data;
  return type === "string" || type === "number" || type === "boolean";
}
function isRef2(raw) {
  return !!raw.__v_isRef;
}
function isComputed(raw) {
  return isRef2(raw) && !!raw.effect;
}
function isReactive2(raw) {
  return !!raw.__v_isReactive;
}
function isReadOnly(raw) {
  return !!raw.__v_isReadonly;
}

// src/core/component/state/util.ts
var tokenMap = {
  [UNDEFINED]: "undefined",
  [NAN]: "NaN",
  [INFINITY]: "Infinity",
  [NEGATIVE_INFINITY]: "-Infinity"
};
var reversedTokenMap = Object.entries(tokenMap).reduce((acc, [key, value]) => {
  acc[value] = key;
  return acc;
}, {});
function internalStateTokenToString(value) {
  if (value === null)
    return "null";
  return typeof value === "string" && tokenMap[value] || false;
}
function replaceTokenToString(value) {
  const replaceRegex = new RegExp(`"(${Object.keys(tokenMap).join("|")})"`, "g");
  return value.replace(replaceRegex, (_, g1) => tokenMap[g1]);
}
function replaceStringToToken(value) {
  const literalValue = reversedTokenMap[value.trim()];
  if (literalValue)
    return `"${literalValue}"`;
  const replaceRegex = new RegExp(`:\\s*(${Object.keys(reversedTokenMap).join("|")})`, "g");
  return value.replace(replaceRegex, (_, g1) => `:"${reversedTokenMap[g1]}"`);
}
function getPropType(type) {
  if (Array.isArray(type))
    return type.map((t) => getPropType(t)).join(" or ");
  if (type == null)
    return "null";
  const match = type.toString().match(fnTypeRE);
  return typeof type === "function" ? match && match[1] || "any" : "any";
}
function sanitize(data) {
  if (!isPrimitive(data) && !Array.isArray(data) && !isPlainObject(data)) {
    return Object.prototype.toString.call(data);
  } else {
    return data;
  }
}
function getSetupStateType(raw) {
  try {
    return {
      ref: isRef2(raw),
      computed: isComputed(raw),
      reactive: isReactive2(raw),
      readonly: isReadOnly(raw)
    };
  } catch (e) {
    return {
      ref: false,
      computed: false,
      reactive: false,
      readonly: false
    };
  }
}
function toRaw2(value) {
  if (value == null ? void 0 : value.__v_raw)
    return value.__v_raw;
  return value;
}
function escape(s) {
  return s.replace(/[<>"&]/g, (s2) => {
    return ESC[s2] || s2;
  });
}

// src/core/component/state/process.ts
function mergeOptions(to, from, instance) {
  if (typeof from === "function")
    from = from.options;
  if (!from)
    return to;
  const { mixins, extends: extendsOptions } = from;
  extendsOptions && mergeOptions(to, extendsOptions, instance);
  mixins && mixins.forEach(
    (m) => mergeOptions(to, m, instance)
  );
  for (const key of ["computed", "inject"]) {
    if (Object.prototype.hasOwnProperty.call(from, key)) {
      if (!to[key])
        to[key] = from[key];
      else
        Object.assign(to[key], from[key]);
    }
  }
  return to;
}
function resolveMergedOptions(instance) {
  const raw = instance == null ? void 0 : instance.type;
  if (!raw)
    return {};
  const { mixins, extends: extendsOptions } = raw;
  const globalMixins = instance.appContext.mixins;
  if (!globalMixins.length && !mixins && !extendsOptions)
    return raw;
  const options = {};
  globalMixins.forEach((m) => mergeOptions(options, m, instance));
  mergeOptions(options, raw, instance);
  return options;
}
function processProps(instance) {
  var _a25;
  const props = [];
  const propDefinitions = (_a25 = instance == null ? void 0 : instance.type) == null ? void 0 : _a25.props;
  for (const key in instance == null ? void 0 : instance.props) {
    const propDefinition = propDefinitions ? propDefinitions[key] : null;
    const camelizeKey = (0, import_devtools_shared11.camelize)(key);
    props.push({
      type: "props",
      key: camelizeKey,
      value: returnError(() => instance.props[key]),
      editable: true,
      meta: propDefinition ? {
        type: propDefinition.type ? getPropType(propDefinition.type) : "any",
        required: !!propDefinition.required,
        ...propDefinition.default ? {
          default: propDefinition.default.toString()
        } : {}
      } : { type: "invalid" }
    });
  }
  return props;
}
function processState(instance) {
  const type = instance.type;
  const props = type == null ? void 0 : type.props;
  const getters = type.vuex && type.vuex.getters;
  const computedDefs = type.computed;
  const data = {
    ...instance.data,
    ...instance.renderContext
  };
  return Object.keys(data).filter((key) => !(props && key in props) && !(getters && key in getters) && !(computedDefs && key in computedDefs)).map((key) => ({
    key,
    type: "data",
    value: returnError(() => data[key]),
    editable: true
  }));
}
function getStateTypeAndName(info) {
  const stateType = info.computed ? "computed" : info.ref ? "ref" : info.reactive ? "reactive" : null;
  const stateTypeName = stateType ? `${stateType.charAt(0).toUpperCase()}${stateType.slice(1)}` : null;
  return {
    stateType,
    stateTypeName
  };
}
function processSetupState(instance) {
  const raw = instance.devtoolsRawSetupState || {};
  return Object.keys(instance.setupState).filter((key) => !vueBuiltins.has(key) && key.split(/(?=[A-Z])/)[0] !== "use").map((key) => {
    var _a25, _b25, _c, _d;
    const value = returnError(() => toRaw2(instance.setupState[key]));
    const accessError = value instanceof Error;
    const rawData = raw[key];
    let result;
    let isOtherType = accessError || typeof value === "function" || ensurePropertyExists(value, "render") && typeof value.render === "function" || ensurePropertyExists(value, "__asyncLoader") && typeof value.__asyncLoader === "function" || typeof value === "object" && value && ("setup" in value || "props" in value) || /^v[A-Z]/.test(key);
    if (rawData && !accessError) {
      const info = getSetupStateType(rawData);
      const { stateType, stateTypeName } = getStateTypeAndName(info);
      const isState = info.ref || info.computed || info.reactive;
      const raw2 = ensurePropertyExists(rawData, "effect") ? ((_b25 = (_a25 = rawData.effect) == null ? void 0 : _a25.raw) == null ? void 0 : _b25.toString()) || ((_d = (_c = rawData.effect) == null ? void 0 : _c.fn) == null ? void 0 : _d.toString()) : null;
      if (stateType)
        isOtherType = false;
      result = {
        ...stateType ? { stateType, stateTypeName } : {},
        ...raw2 ? { raw: raw2 } : {},
        editable: isState && !info.readonly
      };
    }
    const type = isOtherType ? "setup (other)" : "setup";
    return {
      key,
      value,
      type,
      // @ts-expect-error ignore
      ...result
    };
  });
}
function processComputed(instance, mergedType) {
  const type = mergedType;
  const computed = [];
  const defs = type.computed || {};
  for (const key in defs) {
    const def = defs[key];
    const type2 = typeof def === "function" && def.vuex ? "vuex bindings" : "computed";
    computed.push({
      type: type2,
      key,
      value: returnError(() => {
        var _a25;
        return (_a25 = instance == null ? void 0 : instance.proxy) == null ? void 0 : _a25[key];
      }),
      editable: typeof def.set === "function"
    });
  }
  return computed;
}
function processAttrs(instance) {
  return Object.keys(instance.attrs).map((key) => ({
    type: "attrs",
    key,
    value: returnError(() => instance.attrs[key])
  }));
}
function processProvide(instance) {
  return Reflect.ownKeys(instance.provides).map((key) => ({
    type: "provided",
    key: key.toString(),
    value: returnError(() => instance.provides[key])
  }));
}
function processInject(instance, mergedType) {
  if (!(mergedType == null ? void 0 : mergedType.inject))
    return [];
  let keys = [];
  let defaultValue;
  if (Array.isArray(mergedType.inject)) {
    keys = mergedType.inject.map((key) => ({
      key,
      originalKey: key
    }));
  } else {
    keys = Reflect.ownKeys(mergedType.inject).map((key) => {
      const value = mergedType.inject[key];
      let originalKey;
      if (typeof value === "string" || typeof value === "symbol") {
        originalKey = value;
      } else {
        originalKey = value.from;
        defaultValue = value.default;
      }
      return {
        key,
        originalKey
      };
    });
  }
  return keys.map(({ key, originalKey }) => ({
    type: "injected",
    key: originalKey && key !== originalKey ? `${originalKey.toString()} \u279E ${key.toString()}` : key.toString(),
    // eslint-disable-next-line no-prototype-builtins
    value: returnError(() => instance.ctx.hasOwnProperty(key) ? instance.ctx[key] : instance.provides.hasOwnProperty(originalKey) ? instance.provides[originalKey] : defaultValue)
  }));
}
function processRefs(instance) {
  return Object.keys(instance.refs).map((key) => ({
    type: "template refs",
    key,
    value: returnError(() => instance.refs[key])
  }));
}
function processEventListeners(instance) {
  var _a25, _b25;
  const emitsDefinition = instance.type.emits;
  const declaredEmits = Array.isArray(emitsDefinition) ? emitsDefinition : Object.keys(emitsDefinition != null ? emitsDefinition : {});
  const keys = Object.keys((_b25 = (_a25 = instance == null ? void 0 : instance.vnode) == null ? void 0 : _a25.props) != null ? _b25 : {});
  const result = [];
  for (const key of keys) {
    const [prefix, ...eventNameParts] = key.split(/(?=[A-Z])/);
    if (prefix === "on") {
      const eventName = eventNameParts.join("-").toLowerCase();
      const isDeclared = declaredEmits.includes(eventName);
      result.push({
        type: "event listeners",
        key: eventName,
        value: {
          _custom: {
            displayText: isDeclared ? "\u2705 Declared" : "\u26A0\uFE0F Not declared",
            key: isDeclared ? "\u2705 Declared" : "\u26A0\uFE0F Not declared",
            value: isDeclared ? "\u2705 Declared" : "\u26A0\uFE0F Not declared",
            tooltipText: !isDeclared ? `The event <code>${eventName}</code> is not declared in the <code>emits</code> option. It will leak into the component's attributes (<code>$attrs</code>).` : null
          }
        }
      });
    }
  }
  return result;
}
function processInstanceState(instance) {
  const mergedType = resolveMergedOptions(instance);
  return processProps(instance).concat(
    processState(instance),
    processSetupState(instance),
    processComputed(instance, mergedType),
    processAttrs(instance),
    processProvide(instance),
    processInject(instance, mergedType),
    processRefs(instance),
    processEventListeners(instance)
  );
}

// src/core/component/state/index.ts
function getInstanceState(params) {
  var _a25;
  const instance = getComponentInstance(activeAppRecord.value, params.instanceId);
  const id = getUniqueComponentId(instance);
  const name = getInstanceName(instance);
  const file = (_a25 = instance == null ? void 0 : instance.type) == null ? void 0 : _a25.__file;
  const state = processInstanceState(instance);
  return {
    id,
    name,
    file,
    state,
    instance
  };
}

// src/core/component/tree/walker.ts
init_cjs_shims();

// src/core/component/tree/filter.ts
init_cjs_shims();
var import_devtools_shared12 = require("@vue/devtools-shared");
var ComponentFilter = class {
  constructor(filter) {
    this.filter = filter || "";
  }
  /**
   * Check if an instance is qualified.
   *
   * @param {Vue|Vnode} instance
   * @return {boolean}
   */
  isQualified(instance) {
    const name = getInstanceName(instance);
    return (0, import_devtools_shared12.classify)(name).toLowerCase().includes(this.filter) || (0, import_devtools_shared12.kebabize)(name).toLowerCase().includes(this.filter);
  }
};
function createComponentFilter(filterText) {
  return new ComponentFilter(filterText);
}

// src/core/component/tree/walker.ts
var ComponentWalker = class {
  constructor(options) {
    // Dedupe instances (Some instances may be both on a component and on a child abstract/functional component)
    this.captureIds = /* @__PURE__ */ new Map();
    const { filterText = "", maxDepth, recursively, api } = options;
    this.componentFilter = createComponentFilter(filterText);
    this.maxDepth = maxDepth;
    this.recursively = recursively;
    this.api = api;
  }
  getComponentTree(instance) {
    this.captureIds = /* @__PURE__ */ new Map();
    return this.findQualifiedChildren(instance, 0);
  }
  getComponentParents(instance) {
    this.captureIds = /* @__PURE__ */ new Map();
    const parents = [];
    this.captureId(instance);
    let parent = instance;
    while (parent = parent.parent) {
      this.captureId(parent);
      parents.push(parent);
    }
    return parents;
  }
  captureId(instance) {
    if (!instance)
      return null;
    const id = instance.__VUE_DEVTOOLS_NEXT_UID__ != null ? instance.__VUE_DEVTOOLS_NEXT_UID__ : getUniqueComponentId(instance);
    instance.__VUE_DEVTOOLS_NEXT_UID__ = id;
    if (this.captureIds.has(id))
      return null;
    else
      this.captureIds.set(id, void 0);
    this.mark(instance);
    return id;
  }
  /**
   * Capture the meta information of an instance. (recursive)
   *
   * @param {Vue} instance
   * @return {object}
   */
  async capture(instance, depth) {
    var _a25;
    if (!instance)
      return null;
    const id = this.captureId(instance);
    const name = getInstanceName(instance);
    const children = this.getInternalInstanceChildren(instance.subTree).filter((child) => !isBeingDestroyed(child));
    const parents = this.getComponentParents(instance) || [];
    const inactive = !!instance.isDeactivated || parents.some((parent) => parent.isDeactivated);
    const treeNode = {
      uid: instance.uid,
      id,
      name,
      renderKey: getRenderKey(instance.vnode ? instance.vnode.key : null),
      inactive,
      children: [],
      isFragment: isFragment(instance),
      tags: typeof instance.type !== "function" ? [] : [
        {
          label: "functional",
          textColor: 5592405,
          backgroundColor: 15658734
        }
      ],
      autoOpen: this.recursively,
      file: instance.type.__file || ""
    };
    if (depth < this.maxDepth || instance.type.__isKeepAlive || parents.some((parent) => parent.type.__isKeepAlive)) {
      treeNode.children = await Promise.all(children.map((child) => this.capture(child, depth + 1)).filter(Boolean));
    }
    if (this.isKeepAlive(instance)) {
      const cachedComponents = this.getKeepAliveCachedInstances(instance);
      const childrenIds = children.map((child) => child.__VUE_DEVTOOLS_NEXT_UID__);
      for (const cachedChild of cachedComponents) {
        if (!childrenIds.includes(cachedChild.__VUE_DEVTOOLS_NEXT_UID__)) {
          const node = await this.capture({ ...cachedChild, isDeactivated: true }, depth + 1);
          if (node)
            treeNode.children.push(node);
        }
      }
    }
    const rootElements = getRootElementsFromComponentInstance(instance);
    const firstElement = rootElements[0];
    if (firstElement == null ? void 0 : firstElement.parentElement) {
      const parentInstance = instance.parent;
      const parentRootElements = parentInstance ? getRootElementsFromComponentInstance(parentInstance) : [];
      let el = firstElement;
      const indexList = [];
      do {
        indexList.push(Array.from(el.parentElement.childNodes).indexOf(el));
        el = el.parentElement;
      } while (el.parentElement && parentRootElements.length && !parentRootElements.includes(el));
      treeNode.domOrder = indexList.reverse();
    } else {
      treeNode.domOrder = [-1];
    }
    if ((_a25 = instance.suspense) == null ? void 0 : _a25.suspenseKey) {
      treeNode.tags.push({
        label: instance.suspense.suspenseKey,
        backgroundColor: 14979812,
        textColor: 16777215
      });
      this.mark(instance, true);
    }
    this.api.visitComponentTree({
      treeNode,
      componentInstance: instance,
      app: instance.appContext.app,
      filter: this.componentFilter.filter
    });
    return treeNode;
  }
  /**
   * Find qualified children from a single instance.
   * If the instance itself is qualified, just return itself.
   * This is ok because [].concat works in both cases.
   *
   * @param {Vue|Vnode} instance
   * @return {Vue|Array}
   */
  async findQualifiedChildren(instance, depth) {
    var _a25;
    if (this.componentFilter.isQualified(instance) && !((_a25 = instance.type.devtools) == null ? void 0 : _a25.hide)) {
      return [await this.capture(instance, depth)];
    } else if (instance.subTree) {
      const list = this.isKeepAlive(instance) ? this.getKeepAliveCachedInstances(instance) : this.getInternalInstanceChildren(instance.subTree);
      return this.findQualifiedChildrenFromList(list, depth);
    } else {
      return [];
    }
  }
  /**
   * Iterate through an array of instances and flatten it into
   * an array of qualified instances. This is a depth-first
   * traversal - e.g. if an instance is not matched, we will
   * recursively go deeper until a qualified child is found.
   *
   * @param {Array} instances
   * @return {Array}
   */
  async findQualifiedChildrenFromList(instances, depth) {
    instances = instances.filter((child) => {
      var _a25;
      return !isBeingDestroyed(child) && !((_a25 = child.type.devtools) == null ? void 0 : _a25.hide);
    });
    if (!this.componentFilter.filter)
      return Promise.all(instances.map((child) => this.capture(child, depth)));
    else
      return Array.prototype.concat.apply([], await Promise.all(instances.map((i) => this.findQualifiedChildren(i, depth))));
  }
  /**
   * Get children from a component instance.
   */
  getInternalInstanceChildren(subTree, suspense = null) {
    const list = [];
    if (subTree) {
      if (subTree.component) {
        !suspense ? list.push(subTree.component) : list.push({ ...subTree.component, suspense });
      } else if (subTree.suspense) {
        const suspenseKey = !subTree.suspense.isInFallback ? "suspense default" : "suspense fallback";
        list.push(...this.getInternalInstanceChildren(subTree.suspense.activeBranch, { ...subTree.suspense, suspenseKey }));
      } else if (Array.isArray(subTree.children)) {
        subTree.children.forEach((childSubTree) => {
          if (childSubTree.component)
            !suspense ? list.push(childSubTree.component) : list.push({ ...childSubTree.component, suspense });
          else
            list.push(...this.getInternalInstanceChildren(childSubTree, suspense));
        });
      }
    }
    return list.filter((child) => {
      var _a25;
      return !isBeingDestroyed(child) && !((_a25 = child.type.devtools) == null ? void 0 : _a25.hide);
    });
  }
  /**
   * Mark an instance as captured and store it in the instance map.
   *
   * @param {Vue} instance
   */
  mark(instance, force = false) {
    const instanceMap = getAppRecord(instance).instanceMap;
    if (force || !instanceMap.has(instance.__VUE_DEVTOOLS_NEXT_UID__)) {
      instanceMap.set(instance.__VUE_DEVTOOLS_NEXT_UID__, instance);
      activeAppRecord.value.instanceMap = instanceMap;
    }
  }
  isKeepAlive(instance) {
    return instance.type.__isKeepAlive && instance.__v_cache;
  }
  getKeepAliveCachedInstances(instance) {
    return Array.from(instance.__v_cache.values()).map((vnode) => vnode.component).filter(Boolean);
  }
};

// src/core/timeline/index.ts
init_cjs_shims();
var import_devtools_shared13 = require("@vue/devtools-shared");

// src/core/timeline/perf.ts
init_cjs_shims();
var markEndQueue = /* @__PURE__ */ new Map();
var PERFORMANCE_EVENT_LAYER_ID = "performance";
async function performanceMarkStart(api, app, uid, vm, type, time) {
  const appRecord = await getAppRecord(app);
  if (!appRecord) {
    return;
  }
  const componentName = getInstanceName(vm) || "Unknown Component";
  const groupId = devtoolsState.perfUniqueGroupId++;
  const groupKey = `${uid}-${type}`;
  appRecord.perfGroupIds.set(groupKey, { groupId, time });
  await api.addTimelineEvent({
    layerId: PERFORMANCE_EVENT_LAYER_ID,
    event: {
      time: Date.now(),
      data: {
        component: componentName,
        type,
        measure: "start"
      },
      title: componentName,
      subtitle: type,
      groupId
    }
  });
  if (markEndQueue.has(groupKey)) {
    const {
      app: app2,
      uid: uid2,
      instance,
      type: type2,
      time: time2
    } = markEndQueue.get(groupKey);
    markEndQueue.delete(groupKey);
    await performanceMarkEnd(
      api,
      app2,
      uid2,
      instance,
      type2,
      time2
    );
  }
}
function performanceMarkEnd(api, app, uid, vm, type, time) {
  const appRecord = getAppRecord(app);
  if (!appRecord)
    return;
  const componentName = getInstanceName(vm) || "Unknown Component";
  const groupKey = `${uid}-${type}`;
  const groupInfo = appRecord.perfGroupIds.get(groupKey);
  if (groupInfo) {
    const groupId = groupInfo.groupId;
    const startTime = groupInfo.time;
    const duration = time - startTime;
    api.addTimelineEvent({
      layerId: PERFORMANCE_EVENT_LAYER_ID,
      event: {
        time: Date.now(),
        data: {
          component: componentName,
          type,
          measure: "end",
          duration: {
            _custom: {
              type: "Duration",
              value: duration,
              display: `${duration} ms`
            }
          }
        },
        title: componentName,
        subtitle: type,
        groupId
      }
    });
  } else {
    markEndQueue.set(groupKey, { app, uid, instance: vm, type, time });
  }
}

// src/core/timeline/index.ts
var COMPONENT_EVENT_LAYER_ID = "component-event";
function setupBuiltinTimelineLayers(api) {
  if (!import_devtools_shared13.isBrowser)
    return;
  api.addTimelineLayer({
    id: "mouse",
    label: "Mouse",
    color: 10768815
  });
  ["mousedown", "mouseup", "click", "dblclick"].forEach((eventType) => {
    if (!devtoolsState.timelineLayersState.recordingState || !devtoolsState.timelineLayersState.mouseEventEnabled)
      return;
    window.addEventListener(eventType, async (event) => {
      await api.addTimelineEvent({
        layerId: "mouse",
        event: {
          time: Date.now(),
          data: {
            type: eventType,
            x: event.clientX,
            y: event.clientY
          },
          title: eventType
        }
      });
    }, {
      capture: true,
      passive: true
    });
  });
  api.addTimelineLayer({
    id: "keyboard",
    label: "Keyboard",
    color: 8475055
  });
  ["keyup", "keydown", "keypress"].forEach((eventType) => {
    window.addEventListener(eventType, async (event) => {
      if (!devtoolsState.timelineLayersState.recordingState || !devtoolsState.timelineLayersState.keyboardEventEnabled)
        return;
      await api.addTimelineEvent({
        layerId: "keyboard",
        event: {
          time: Date.now(),
          data: {
            type: eventType,
            key: event.key,
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey,
            altKey: event.altKey,
            metaKey: event.metaKey
          },
          title: event.key
        }
      });
    }, {
      capture: true,
      passive: true
    });
  });
  api.addTimelineLayer({
    id: COMPONENT_EVENT_LAYER_ID,
    label: "Component events",
    color: 5226637
  });
  hook.on.componentEmit(async (app, instance, event, params) => {
    if (!devtoolsState.timelineLayersState.recordingState || !devtoolsState.timelineLayersState.componentEventEnabled)
      return;
    const appRecord = await getAppRecord(app);
    if (!appRecord)
      return;
    const componentId = `${appRecord.id}:${instance.uid}`;
    const componentName = getInstanceName(instance) || "Unknown Component";
    api.addTimelineEvent({
      layerId: COMPONENT_EVENT_LAYER_ID,
      event: {
        time: Date.now(),
        data: {
          component: {
            _custom: {
              type: "component-definition",
              display: componentName
            }
          },
          event,
          params
        },
        title: event,
        subtitle: `by ${componentName}`,
        meta: {
          componentId
        }
      }
    });
  });
  api.addTimelineLayer({
    id: "performance",
    label: PERFORMANCE_EVENT_LAYER_ID,
    color: 4307050
  });
  hook.on.perfStart((app, uid, vm, type, time) => {
    if (!devtoolsState.timelineLayersState.recordingState || !devtoolsState.timelineLayersState.performanceEventEnabled)
      return;
    performanceMarkStart(api, app, uid, vm, type, time);
  });
  hook.on.perfEnd((app, uid, vm, type, time) => {
    if (!devtoolsState.timelineLayersState.recordingState || !devtoolsState.timelineLayersState.performanceEventEnabled)
      return;
    performanceMarkEnd(api, app, uid, vm, type, time);
  });
}

// src/core/vm/index.ts
init_cjs_shims();
var MAX_$VM = 10;
var $vmQueue = [];
function exposeInstanceToWindow(componentInstance) {
  if (typeof window === "undefined")
    return;
  const win = window;
  if (!componentInstance)
    return;
  win.$vm = componentInstance;
  if ($vmQueue[0] !== componentInstance) {
    if ($vmQueue.length >= MAX_$VM) {
      $vmQueue.pop();
    }
    for (let i = $vmQueue.length; i > 0; i--) {
      win[`$vm${i}`] = $vmQueue[i] = $vmQueue[i - 1];
    }
    win.$vm0 = $vmQueue[0] = componentInstance;
  }
}

// src/core/plugin/components.ts
var INSPECTOR_ID = "components";
function createComponentsDevToolsPlugin(app) {
  const descriptor = {
    id: INSPECTOR_ID,
    label: "Components",
    app
  };
  const setupFn = (api) => {
    api.addInspector({
      id: INSPECTOR_ID,
      label: "Components",
      treeFilterPlaceholder: "Search components"
    });
    setupBuiltinTimelineLayers(api);
    api.on.getInspectorTree(async (payload) => {
      if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
        const instance = getComponentInstance(activeAppRecord.value, payload.instanceId);
        if (instance) {
          const walker2 = new ComponentWalker({
            filterText: payload.filter,
            // @TODO: should make this configurable?
            maxDepth: 100,
            recursively: false,
            api
          });
          payload.rootNodes = await walker2.getComponentTree(instance);
        }
      }
    });
    api.on.getInspectorState(async (payload) => {
      var _a25;
      if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
        const result = getInstanceState({
          instanceId: payload.nodeId
        });
        const componentInstance = result.instance;
        const app2 = (_a25 = result.instance) == null ? void 0 : _a25.appContext.app;
        const _payload = {
          componentInstance,
          app: app2,
          instanceData: result
        };
        devtoolsContext.hooks.callHookWith((callbacks) => {
          callbacks.forEach((cb) => cb(_payload));
        }, "inspectComponent" /* INSPECT_COMPONENT */);
        payload.state = result;
        exposeInstanceToWindow(componentInstance);
      }
    });
    api.on.editInspectorState(async (payload) => {
      if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
        editState(payload);
        await api.sendInspectorState("components");
      }
    });
    const debounceSendInspectorTree = (0, import_perfect_debounce4.debounce)(() => {
      api.sendInspectorTree(INSPECTOR_ID);
    }, 120);
    const debounceSendInspectorState = (0, import_perfect_debounce4.debounce)(() => {
      api.sendInspectorState(INSPECTOR_ID);
    }, 120);
    const componentAddedCleanup = hook.on.componentAdded(async (app2, uid, parentUid, component) => {
      var _a25, _b25, _c;
      if (devtoolsState.highPerfModeEnabled)
        return;
      if ((_c = (_b25 = (_a25 = app2 == null ? void 0 : app2._instance) == null ? void 0 : _a25.type) == null ? void 0 : _b25.devtools) == null ? void 0 : _c.hide)
        return;
      if (!app2 || typeof uid !== "number" && !uid || !component)
        return;
      const id = await getComponentId({
        app: app2,
        uid,
        instance: component
      });
      const appRecord = await getAppRecord(app2);
      if (component) {
        if (component.__VUE_DEVTOOLS_NEXT_UID__ == null)
          component.__VUE_DEVTOOLS_NEXT_UID__ = id;
        if (!(appRecord == null ? void 0 : appRecord.instanceMap.has(id))) {
          appRecord == null ? void 0 : appRecord.instanceMap.set(id, component);
          if (activeAppRecord.value.id === (appRecord == null ? void 0 : appRecord.id))
            activeAppRecord.value.instanceMap = appRecord.instanceMap;
        }
      }
      if (!appRecord)
        return;
      debounceSendInspectorTree();
    });
    const componentUpdatedCleanup = hook.on.componentUpdated(async (app2, uid, parentUid, component) => {
      var _a25, _b25, _c;
      if (devtoolsState.highPerfModeEnabled)
        return;
      if ((_c = (_b25 = (_a25 = app2 == null ? void 0 : app2._instance) == null ? void 0 : _a25.type) == null ? void 0 : _b25.devtools) == null ? void 0 : _c.hide)
        return;
      if (!app2 || typeof uid !== "number" && !uid || !component)
        return;
      const id = await getComponentId({
        app: app2,
        uid,
        instance: component
      });
      const appRecord = await getAppRecord(app2);
      if (component) {
        if (component.__VUE_DEVTOOLS_NEXT_UID__ == null)
          component.__VUE_DEVTOOLS_NEXT_UID__ = id;
        if (!(appRecord == null ? void 0 : appRecord.instanceMap.has(id))) {
          appRecord == null ? void 0 : appRecord.instanceMap.set(id, component);
          if (activeAppRecord.value.id === (appRecord == null ? void 0 : appRecord.id))
            activeAppRecord.value.instanceMap = appRecord.instanceMap;
        }
      }
      if (!appRecord)
        return;
      debounceSendInspectorTree();
      debounceSendInspectorState();
    });
    const componentRemovedCleanup = hook.on.componentRemoved(async (app2, uid, parentUid, component) => {
      var _a25, _b25, _c;
      if (devtoolsState.highPerfModeEnabled)
        return;
      if ((_c = (_b25 = (_a25 = app2 == null ? void 0 : app2._instance) == null ? void 0 : _a25.type) == null ? void 0 : _b25.devtools) == null ? void 0 : _c.hide)
        return;
      if (!app2 || typeof uid !== "number" && !uid || !component)
        return;
      const appRecord = await getAppRecord(app2);
      if (!appRecord)
        return;
      const id = await getComponentId({
        app: app2,
        uid,
        instance: component
      });
      appRecord == null ? void 0 : appRecord.instanceMap.delete(id);
      if (activeAppRecord.value.id === (appRecord == null ? void 0 : appRecord.id))
        activeAppRecord.value.instanceMap = appRecord.instanceMap;
      debounceSendInspectorTree();
    });
  };
  return [descriptor, setupFn];
}

// src/core/plugin/index.ts
var _a12, _b12;
(_b12 = (_a12 = import_devtools_shared14.target).__VUE_DEVTOOLS_KIT__REGISTERED_PLUGIN_APPS__) != null ? _b12 : _a12.__VUE_DEVTOOLS_KIT__REGISTERED_PLUGIN_APPS__ = /* @__PURE__ */ new Set();
function setupDevToolsPlugin(pluginDescriptor, setupFn) {
  return hook.setupDevToolsPlugin(pluginDescriptor, setupFn);
}
function callDevToolsPluginSetupFn(plugin, app) {
  const [pluginDescriptor, setupFn] = plugin;
  if (pluginDescriptor.app !== app)
    return;
  const api = new DevToolsPluginAPI({
    plugin: {
      setupFn,
      descriptor: pluginDescriptor
    },
    ctx: devtoolsContext
  });
  if (pluginDescriptor.packageName === "vuex") {
    api.on.editInspectorState((payload) => {
      api.sendInspectorState(payload.inspectorId);
    });
  }
  setupFn(api);
}
function removeRegisteredPluginApp(app) {
  import_devtools_shared14.target.__VUE_DEVTOOLS_KIT__REGISTERED_PLUGIN_APPS__.delete(app);
}
function registerDevToolsPlugin(app, options) {
  if (import_devtools_shared14.target.__VUE_DEVTOOLS_KIT__REGISTERED_PLUGIN_APPS__.has(app)) {
    return;
  }
  if (devtoolsState.highPerfModeEnabled && !(options == null ? void 0 : options.inspectingComponent)) {
    return;
  }
  import_devtools_shared14.target.__VUE_DEVTOOLS_KIT__REGISTERED_PLUGIN_APPS__.add(app);
  devtoolsPluginBuffer.forEach((plugin) => {
    callDevToolsPluginSetupFn(plugin, app);
  });
}

// src/core/router/index.ts
init_cjs_shims();
var import_devtools_shared16 = require("@vue/devtools-shared");
var import_perfect_debounce5 = require("perfect-debounce");

// src/ctx/router.ts
init_cjs_shims();
var import_devtools_shared15 = require("@vue/devtools-shared");
var ROUTER_KEY = "__VUE_DEVTOOLS_ROUTER__";
var ROUTER_INFO_KEY = "__VUE_DEVTOOLS_ROUTER_INFO__";
var _a13, _b13;
(_b13 = (_a13 = import_devtools_shared15.target)[ROUTER_INFO_KEY]) != null ? _b13 : _a13[ROUTER_INFO_KEY] = {
  currentRoute: null,
  routes: []
};
var _a14, _b14;
(_b14 = (_a14 = import_devtools_shared15.target)[ROUTER_KEY]) != null ? _b14 : _a14[ROUTER_KEY] = {};
var devtoolsRouterInfo = new Proxy(import_devtools_shared15.target[ROUTER_INFO_KEY], {
  get(target22, property) {
    return import_devtools_shared15.target[ROUTER_INFO_KEY][property];
  }
});
var devtoolsRouter = new Proxy(import_devtools_shared15.target[ROUTER_KEY], {
  get(target22, property) {
    if (property === "value") {
      return import_devtools_shared15.target[ROUTER_KEY];
    }
  }
});

// src/core/router/index.ts
function getRoutes(router) {
  const routesMap = /* @__PURE__ */ new Map();
  return ((router == null ? void 0 : router.getRoutes()) || []).filter((i) => !routesMap.has(i.path) && routesMap.set(i.path, 1));
}
function filterRoutes(routes) {
  return routes.map((item) => {
    let { path, name, children, meta } = item;
    if (children == null ? void 0 : children.length)
      children = filterRoutes(children);
    return {
      path,
      name,
      children,
      meta
    };
  });
}
function filterCurrentRoute(route) {
  if (route) {
    const { fullPath, hash, href, path, name, matched, params, query } = route;
    return {
      fullPath,
      hash,
      href,
      path,
      name,
      params,
      query,
      matched: filterRoutes(matched)
    };
  }
  return route;
}
function normalizeRouterInfo(appRecord, activeAppRecord2) {
  function init() {
    var _a25;
    const router = (_a25 = appRecord.app) == null ? void 0 : _a25.config.globalProperties.$router;
    const currentRoute = filterCurrentRoute(router == null ? void 0 : router.currentRoute.value);
    const routes = filterRoutes(getRoutes(router));
    const c = console.warn;
    console.warn = () => {
    };
    import_devtools_shared16.target[ROUTER_INFO_KEY] = {
      currentRoute: currentRoute ? (0, import_devtools_shared16.deepClone)(currentRoute) : {},
      routes: (0, import_devtools_shared16.deepClone)(routes)
    };
    import_devtools_shared16.target[ROUTER_KEY] = router;
    console.warn = c;
  }
  init();
  hook.on.componentUpdated((0, import_perfect_debounce5.debounce)(() => {
    var _a25;
    if (((_a25 = activeAppRecord2.value) == null ? void 0 : _a25.app) !== appRecord.app)
      return;
    init();
    if (devtoolsState.highPerfModeEnabled)
      return;
    devtoolsContext.hooks.callHook("routerInfoUpdated" /* ROUTER_INFO_UPDATED */, { state: import_devtools_shared16.target[ROUTER_INFO_KEY] });
  }, 200));
}

// src/ctx/api.ts
function createDevToolsApi(hooks2) {
  return {
    // get inspector tree
    async getInspectorTree(payload) {
      const _payload = {
        ...payload,
        app: activeAppRecord.value.app,
        rootNodes: []
      };
      await new Promise((resolve) => {
        hooks2.callHookWith(async (callbacks) => {
          await Promise.all(callbacks.map((cb) => cb(_payload)));
          resolve();
        }, "getInspectorTree" /* GET_INSPECTOR_TREE */);
      });
      return _payload.rootNodes;
    },
    // get inspector state
    async getInspectorState(payload) {
      const _payload = {
        ...payload,
        app: activeAppRecord.value.app,
        state: null
      };
      const ctx = {
        currentTab: `custom-inspector:${payload.inspectorId}`
      };
      await new Promise((resolve) => {
        hooks2.callHookWith(async (callbacks) => {
          await Promise.all(callbacks.map((cb) => cb(_payload, ctx)));
          resolve();
        }, "getInspectorState" /* GET_INSPECTOR_STATE */);
      });
      return _payload.state;
    },
    // edit inspector state
    editInspectorState(payload) {
      const stateEditor2 = new StateEditor();
      const _payload = {
        ...payload,
        app: activeAppRecord.value.app,
        set: (obj, path = payload.path, value = payload.state.value, cb) => {
          stateEditor2.set(obj, path, value, cb || stateEditor2.createDefaultSetCallback(payload.state));
        }
      };
      hooks2.callHookWith((callbacks) => {
        callbacks.forEach((cb) => cb(_payload));
      }, "editInspectorState" /* EDIT_INSPECTOR_STATE */);
    },
    // send inspector state
    sendInspectorState(inspectorId) {
      const inspector = getInspector(inspectorId);
      hooks2.callHook("sendInspectorState" /* SEND_INSPECTOR_STATE */, { inspectorId, plugin: {
        descriptor: inspector.descriptor,
        setupFn: () => ({})
      } });
    },
    // inspect component inspector
    inspectComponentInspector() {
      return inspectComponentHighLighter();
    },
    // cancel inspect component inspector
    cancelInspectComponentInspector() {
      return cancelInspectComponentHighLighter();
    },
    // get component render code
    getComponentRenderCode(id) {
      const instance = getComponentInstance(activeAppRecord.value, id);
      if (instance)
        return !(typeof (instance == null ? void 0 : instance.type) === "function") ? instance.render.toString() : instance.type.toString();
    },
    // scroll to component
    scrollToComponent(id) {
      return scrollToComponent({ id });
    },
    // open in editor
    openInEditor,
    // get vue inspector
    getVueInspector: getComponentInspector,
    // toggle app
    toggleApp(id, options) {
      const appRecord = devtoolsAppRecords.value.find((record) => record.id === id);
      if (appRecord) {
        setActiveAppRecordId(id);
        setActiveAppRecord(appRecord);
        normalizeRouterInfo(appRecord, activeAppRecord);
        callInspectorUpdatedHook();
        registerDevToolsPlugin(appRecord.app, options);
      }
    },
    // inspect dom
    inspectDOM(instanceId) {
      const instance = getComponentInstance(activeAppRecord.value, instanceId);
      if (instance) {
        const [el] = getRootElementsFromComponentInstance(instance);
        if (el) {
          import_devtools_shared17.target.__VUE_DEVTOOLS_INSPECT_DOM_TARGET__ = el;
        }
      }
    },
    updatePluginSettings(pluginId, key, value) {
      setPluginSettings(pluginId, key, value);
    },
    getPluginSettings(pluginId) {
      return {
        options: getPluginSettingsOptions(pluginId),
        values: getPluginSettings(pluginId)
      };
    }
  };
}

// src/ctx/env.ts
init_cjs_shims();
var import_devtools_shared18 = require("@vue/devtools-shared");
var _a15, _b15;
(_b15 = (_a15 = import_devtools_shared18.target).__VUE_DEVTOOLS_ENV__) != null ? _b15 : _a15.__VUE_DEVTOOLS_ENV__ = {
  vitePluginDetected: false
};
function getDevToolsEnv() {
  return import_devtools_shared18.target.__VUE_DEVTOOLS_ENV__;
}
function setDevToolsEnv(env) {
  import_devtools_shared18.target.__VUE_DEVTOOLS_ENV__ = {
    ...import_devtools_shared18.target.__VUE_DEVTOOLS_ENV__,
    ...env
  };
}

// src/ctx/index.ts
var hooks = createDevToolsCtxHooks();
var _a16, _b16;
(_b16 = (_a16 = import_devtools_shared19.target).__VUE_DEVTOOLS_KIT_CONTEXT__) != null ? _b16 : _a16.__VUE_DEVTOOLS_KIT_CONTEXT__ = {
  hooks,
  get state() {
    return {
      ...devtoolsState,
      activeAppRecordId: activeAppRecord.id,
      activeAppRecord: activeAppRecord.value,
      appRecords: devtoolsAppRecords.value
    };
  },
  api: createDevToolsApi(hooks)
};
var devtoolsContext = import_devtools_shared19.target.__VUE_DEVTOOLS_KIT_CONTEXT__;

// src/core/app/index.ts
init_cjs_shims();
var import_devtools_shared20 = require("@vue/devtools-shared");
var import_speakingurl = __toESM(require_speakingurl2(), 1);
var _a17, _b17;
var appRecordInfo = (_b17 = (_a17 = import_devtools_shared20.target).__VUE_DEVTOOLS_NEXT_APP_RECORD_INFO__) != null ? _b17 : _a17.__VUE_DEVTOOLS_NEXT_APP_RECORD_INFO__ = {
  id: 0,
  appIds: /* @__PURE__ */ new Set()
};
function getAppRecordName(app, fallbackName) {
  var _a25;
  return ((_a25 = app == null ? void 0 : app._component) == null ? void 0 : _a25.name) || `App ${fallbackName}`;
}
function getAppRootInstance(app) {
  var _a25, _b25, _c, _d;
  if (app._instance)
    return app._instance;
  else if ((_b25 = (_a25 = app._container) == null ? void 0 : _a25._vnode) == null ? void 0 : _b25.component)
    return (_d = (_c = app._container) == null ? void 0 : _c._vnode) == null ? void 0 : _d.component;
}
function removeAppRecordId(app) {
  const id = app.__VUE_DEVTOOLS_NEXT_APP_RECORD_ID__;
  if (id != null) {
    appRecordInfo.appIds.delete(id);
    appRecordInfo.id--;
  }
}
function getAppRecordId(app, defaultId) {
  if (app.__VUE_DEVTOOLS_NEXT_APP_RECORD_ID__ != null)
    return app.__VUE_DEVTOOLS_NEXT_APP_RECORD_ID__;
  let id = defaultId != null ? defaultId : (appRecordInfo.id++).toString();
  if (defaultId && appRecordInfo.appIds.has(id)) {
    let count = 1;
    while (appRecordInfo.appIds.has(`${defaultId}_${count}`))
      count++;
    id = `${defaultId}_${count}`;
  }
  appRecordInfo.appIds.add(id);
  app.__VUE_DEVTOOLS_NEXT_APP_RECORD_ID__ = id;
  return id;
}
function createAppRecord(app, types) {
  var _a25, _b25;
  const rootInstance = getAppRootInstance(app);
  if (rootInstance) {
    appRecordInfo.id++;
    const name = getAppRecordName(app, appRecordInfo.id.toString());
    const id = getAppRecordId(app, (0, import_speakingurl.default)(name));
    const [el] = getRootElementsFromComponentInstance(rootInstance);
    const record = {
      id,
      name,
      types,
      instanceMap: /* @__PURE__ */ new Map(),
      perfGroupIds: /* @__PURE__ */ new Map(),
      rootInstance,
      iframe: import_devtools_shared20.isBrowser && document !== (el == null ? void 0 : el.ownerDocument) ? (_b25 = (_a25 = el == null ? void 0 : el.ownerDocument) == null ? void 0 : _a25.location) == null ? void 0 : _b25.pathname : void 0
    };
    app.__VUE_DEVTOOLS_NEXT_APP_RECORD__ = record;
    const rootId = `${record.id}:root`;
    record.instanceMap.set(rootId, record.rootInstance);
    record.rootInstance.__VUE_DEVTOOLS_NEXT_UID__ = rootId;
    return record;
  } else {
    return {};
  }
}

// src/core/iframe/index.ts
init_cjs_shims();
function detectIframeApp(target22, inIframe = false) {
  if (inIframe) {
    let sendEventToParent2 = function(cb) {
      try {
        const hook3 = window.parent.__VUE_DEVTOOLS_GLOBAL_HOOK__;
        if (hook3) {
          cb(hook3);
        }
      } catch (e) {
      }
    };
    var sendEventToParent = sendEventToParent2;
    const hook2 = {
      id: "vue-devtools-next",
      devtoolsVersion: "7.0",
      on: (event, cb) => {
        sendEventToParent2((hook3) => {
          hook3.on(event, cb);
        });
      },
      once: (event, cb) => {
        sendEventToParent2((hook3) => {
          hook3.once(event, cb);
        });
      },
      off: (event, cb) => {
        sendEventToParent2((hook3) => {
          hook3.off(event, cb);
        });
      },
      emit: (event, ...payload) => {
        sendEventToParent2((hook3) => {
          hook3.emit(event, ...payload);
        });
      }
    };
    Object.defineProperty(target22, "__VUE_DEVTOOLS_GLOBAL_HOOK__", {
      get() {
        return hook2;
      },
      configurable: true
    });
  }
  function injectVueHookToIframe(iframe) {
    if (iframe.__vdevtools__injected) {
      return;
    }
    try {
      iframe.__vdevtools__injected = true;
      const inject = () => {
        try {
          iframe.contentWindow.__VUE_DEVTOOLS_IFRAME__ = iframe;
          const script = iframe.contentDocument.createElement("script");
          script.textContent = `;(${detectIframeApp.toString()})(window, true)`;
          iframe.contentDocument.documentElement.appendChild(script);
          script.parentNode.removeChild(script);
        } catch (e) {
        }
      };
      inject();
      iframe.addEventListener("load", () => inject());
    } catch (e) {
    }
  }
  function injectVueHookToIframes() {
    if (typeof window === "undefined") {
      return;
    }
    const iframes = Array.from(document.querySelectorAll("iframe:not([data-vue-devtools-ignore])"));
    for (const iframe of iframes) {
      injectVueHookToIframe(iframe);
    }
  }
  injectVueHookToIframes();
  let iframeAppChecks = 0;
  const iframeAppCheckTimer = setInterval(() => {
    injectVueHookToIframes();
    iframeAppChecks++;
    if (iframeAppChecks >= 5) {
      clearInterval(iframeAppCheckTimer);
    }
  }, 1e3);
}

// src/core/index.ts
function initDevTools() {
  var _a25;
  detectIframeApp(import_devtools_shared21.target);
  updateDevToolsState({
    vitePluginDetected: getDevToolsEnv().vitePluginDetected
  });
  const isDevToolsNext = ((_a25 = import_devtools_shared21.target.__VUE_DEVTOOLS_GLOBAL_HOOK__) == null ? void 0 : _a25.id) === "vue-devtools-next";
  if (import_devtools_shared21.target.__VUE_DEVTOOLS_GLOBAL_HOOK__ && isDevToolsNext)
    return;
  const _devtoolsHook = createDevToolsHook();
  if (import_devtools_shared21.target.__VUE_DEVTOOLS_HOOK_REPLAY__) {
    try {
      import_devtools_shared21.target.__VUE_DEVTOOLS_HOOK_REPLAY__.forEach((cb) => cb(_devtoolsHook));
      import_devtools_shared21.target.__VUE_DEVTOOLS_HOOK_REPLAY__ = [];
    } catch (e) {
      console.error("[vue-devtools] Error during hook replay", e);
    }
  }
  _devtoolsHook.once("init", (Vue) => {
    import_devtools_shared21.target.__VUE_DEVTOOLS_VUE2_APP_DETECTED__ = true;
    console.log("%c[_____Vue DevTools v7 log_____]", "color: red; font-bold: 600; font-size: 16px;");
    console.log("%cVue DevTools v7 detected in your Vue2 project. v7 only supports Vue3 and will not work.", "font-bold: 500; font-size: 14px;");
    const legacyChromeUrl = "https://chromewebstore.google.com/detail/vuejs-devtools/iaajmlceplecbljialhhkmedjlpdblhp";
    const legacyFirefoxUrl = "https://addons.mozilla.org/firefox/addon/vue-js-devtools-v6-legacy";
    console.log(`%cThe legacy version of chrome extension that supports both Vue 2 and Vue 3 has been moved to %c ${legacyChromeUrl}`, "font-size: 14px;", "text-decoration: underline; cursor: pointer;font-size: 14px;");
    console.log(`%cThe legacy version of firefox extension that supports both Vue 2 and Vue 3 has been moved to %c ${legacyFirefoxUrl}`, "font-size: 14px;", "text-decoration: underline; cursor: pointer;font-size: 14px;");
    console.log("%cPlease install and enable only the legacy version for your Vue2 app.", "font-bold: 500; font-size: 14px;");
    console.log("%c[_____Vue DevTools v7 log_____]", "color: red; font-bold: 600; font-size: 16px;");
  });
  hook.on.setupDevtoolsPlugin((pluginDescriptor, setupFn) => {
    var _a26;
    addDevToolsPluginToBuffer(pluginDescriptor, setupFn);
    const { app } = (_a26 = activeAppRecord) != null ? _a26 : {};
    if (pluginDescriptor.settings) {
      initPluginSettings(pluginDescriptor.id, pluginDescriptor.settings);
    }
    if (!app)
      return;
    callDevToolsPluginSetupFn([pluginDescriptor, setupFn], app);
  });
  onLegacyDevToolsPluginApiAvailable(() => {
    const normalizedPluginBuffer = devtoolsPluginBuffer.filter(([item]) => item.id !== "components");
    normalizedPluginBuffer.forEach(([pluginDescriptor, setupFn]) => {
      _devtoolsHook.emit("devtools-plugin:setup" /* SETUP_DEVTOOLS_PLUGIN */, pluginDescriptor, setupFn, { target: "legacy" });
    });
  });
  hook.on.vueAppInit(async (app, version, types) => {
    const appRecord = createAppRecord(app, types);
    const normalizedAppRecord = {
      ...appRecord,
      app,
      version
    };
    addDevToolsAppRecord(normalizedAppRecord);
    if (devtoolsAppRecords.value.length === 1) {
      setActiveAppRecord(normalizedAppRecord);
      setActiveAppRecordId(normalizedAppRecord.id);
      normalizeRouterInfo(normalizedAppRecord, activeAppRecord);
      registerDevToolsPlugin(normalizedAppRecord.app);
    }
    setupDevToolsPlugin(...createComponentsDevToolsPlugin(normalizedAppRecord.app));
    updateDevToolsState({
      connected: true
    });
    _devtoolsHook.apps.push(app);
  });
  hook.on.vueAppUnmount(async (app) => {
    const activeRecords = devtoolsAppRecords.value.filter((appRecord) => appRecord.app !== app);
    if (activeRecords.length === 0) {
      updateDevToolsState({
        connected: false
      });
    }
    removeDevToolsAppRecord(app);
    removeAppRecordId(app);
    if (activeAppRecord.value.app === app) {
      setActiveAppRecord(activeRecords[0]);
      devtoolsContext.hooks.callHook("sendActiveAppUpdatedToClient" /* SEND_ACTIVE_APP_UNMOUNTED_TO_CLIENT */);
    }
    import_devtools_shared21.target.__VUE_DEVTOOLS_GLOBAL_HOOK__.apps.splice(import_devtools_shared21.target.__VUE_DEVTOOLS_GLOBAL_HOOK__.apps.indexOf(app), 1);
    removeRegisteredPluginApp(app);
  });
  subscribeDevToolsHook(_devtoolsHook);
  if (!import_devtools_shared21.target.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    Object.defineProperty(import_devtools_shared21.target, "__VUE_DEVTOOLS_GLOBAL_HOOK__", {
      get() {
        return _devtoolsHook;
      },
      configurable: true
    });
  } else {
    if (!import_devtools_shared21.isNuxtApp) {
      Object.assign(__VUE_DEVTOOLS_GLOBAL_HOOK__, _devtoolsHook);
    }
  }
}
function onDevToolsClientConnected(fn) {
  return new Promise((resolve) => {
    if (devtoolsState.connected && devtoolsState.clientConnected) {
      fn();
      resolve();
      return;
    }
    devtoolsContext.hooks.hook("devtoolsConnectedUpdated" /* DEVTOOLS_CONNECTED_UPDATED */, ({ state }) => {
      if (state.connected && state.clientConnected) {
        fn();
        resolve();
      }
    });
  });
}

// src/core/high-perf-mode/index.ts
init_cjs_shims();
function toggleHighPerfMode(state) {
  devtoolsState.highPerfModeEnabled = state != null ? state : !devtoolsState.highPerfModeEnabled;
  if (!state && activeAppRecord.value) {
    registerDevToolsPlugin(activeAppRecord.value.app);
  }
}

// src/core/component/state/format.ts
init_cjs_shims();

// src/core/component/state/reviver.ts
init_cjs_shims();
var import_devtools_shared22 = require("@vue/devtools-shared");
function reviveSet(val) {
  const result = /* @__PURE__ */ new Set();
  const list = val._custom.value;
  for (let i = 0; i < list.length; i++) {
    const value = list[i];
    result.add(revive(value));
  }
  return result;
}
function reviveMap(val) {
  const result = /* @__PURE__ */ new Map();
  const list = val._custom.value;
  for (let i = 0; i < list.length; i++) {
    const { key, value } = list[i];
    result.set(key, revive(value));
  }
  return result;
}
function revive(val) {
  if (val === UNDEFINED) {
    return void 0;
  } else if (val === INFINITY) {
    return Number.POSITIVE_INFINITY;
  } else if (val === NEGATIVE_INFINITY) {
    return Number.NEGATIVE_INFINITY;
  } else if (val === NAN) {
    return Number.NaN;
  } else if (val && val._custom) {
    const { _custom: custom } = val;
    if (custom.type === "component")
      return activeAppRecord.value.instanceMap.get(custom.id);
    else if (custom.type === "map")
      return reviveMap(val);
    else if (custom.type === "set")
      return reviveSet(val);
    else if (custom.type === "bigint")
      return BigInt(custom.value);
    else
      return revive(custom.value);
  } else if (symbolRE.test(val)) {
    const [, string] = symbolRE.exec(val);
    return Symbol.for(string);
  } else if (specialTypeRE.test(val)) {
    const [, type, string, , details] = specialTypeRE.exec(val);
    const result = new import_devtools_shared22.target[type](string);
    if (type === "Error" && details)
      result.stack = details;
    return result;
  } else {
    return val;
  }
}
function reviver(key, value) {
  return revive(value);
}

// src/core/component/state/format.ts
function getInspectorStateValueType(value, raw = true) {
  const type = typeof value;
  if (value == null || value === UNDEFINED || value === "undefined") {
    return "null";
  } else if (type === "boolean" || type === "number" || value === INFINITY || value === NEGATIVE_INFINITY || value === NAN) {
    return "literal";
  } else if (value == null ? void 0 : value._custom) {
    if (raw || value._custom.display != null || value._custom.displayText != null)
      return "custom";
    else
      return getInspectorStateValueType(value._custom.value);
  } else if (typeof value === "string") {
    const typeMatch = specialTypeRE.exec(value);
    if (typeMatch) {
      const [, type2] = typeMatch;
      return `native ${type2}`;
    } else {
      return "string";
    }
  } else if (Array.isArray(value) || (value == null ? void 0 : value._isArray)) {
    return "array";
  } else if (isPlainObject(value)) {
    return "plain-object";
  } else {
    return "unknown";
  }
}
function formatInspectorStateValue(value, quotes = false, options) {
  var _a25, _b25, _c;
  const { customClass } = options != null ? options : {};
  let result;
  const type = getInspectorStateValueType(value, false);
  if (type !== "custom" && (value == null ? void 0 : value._custom))
    value = value._custom.value;
  if (result = internalStateTokenToString(value)) {
    return result;
  } else if (type === "custom") {
    const nestedName = ((_a25 = value._custom.value) == null ? void 0 : _a25._custom) && formatInspectorStateValue(value._custom.value, quotes, options);
    return nestedName || value._custom.displayText || value._custom.display;
  } else if (type === "array") {
    return `Array[${value.length}]`;
  } else if (type === "plain-object") {
    return `Object${Object.keys(value).length ? "" : " (empty)"}`;
  } else if (type == null ? void 0 : type.includes("native")) {
    return escape((_b25 = specialTypeRE.exec(value)) == null ? void 0 : _b25[2]);
  } else if (typeof value === "string") {
    const typeMatch = value.match(rawTypeRE);
    if (typeMatch) {
      value = escapeString(typeMatch[1]);
    } else if (quotes) {
      value = `<span>"</span>${(customClass == null ? void 0 : customClass.string) ? `<span class=${customClass.string}>${escapeString(value)}</span>` : escapeString(value)}<span>"</span>`;
    } else {
      value = (customClass == null ? void 0 : customClass.string) ? `<span class="${(_c = customClass == null ? void 0 : customClass.string) != null ? _c : ""}">${escapeString(value)}</span>` : escapeString(value);
    }
  }
  return value;
}
function escapeString(value) {
  return escape(value).replace(/ /g, "&nbsp;").replace(/\n/g, "<span>\\n</span>");
}
function getRaw(value) {
  var _a25, _b25, _c;
  let customType;
  const isCustom = getInspectorStateValueType(value) === "custom";
  let inherit = {};
  if (isCustom) {
    const data = value;
    const customValue = (_a25 = data._custom) == null ? void 0 : _a25.value;
    const currentCustomType = (_b25 = data._custom) == null ? void 0 : _b25.type;
    const nestedCustom = typeof customValue === "object" && customValue !== null && "_custom" in customValue ? getRaw(customValue) : { inherit: void 0, value: void 0, customType: void 0 };
    inherit = nestedCustom.inherit || ((_c = data._custom) == null ? void 0 : _c.fields) || {};
    value = nestedCustom.value || customValue;
    customType = nestedCustom.customType || currentCustomType;
  }
  if (value && value._isArray)
    value = value.items;
  return { value, inherit, customType };
}
function toEdit(value, customType) {
  if (customType === "bigint")
    return value;
  if (customType === "date")
    return value;
  return replaceTokenToString(JSON.stringify(value));
}
function toSubmit(value, customType) {
  if (customType === "bigint")
    return BigInt(value);
  if (customType === "date")
    return new Date(value);
  return JSON.parse(replaceStringToToken(value), reviver);
}

// src/core/devtools-client/detected.ts
init_cjs_shims();
var import_devtools_shared23 = require("@vue/devtools-shared");
function updateDevToolsClientDetected(params) {
  devtoolsState.devtoolsClientDetected = {
    ...devtoolsState.devtoolsClientDetected,
    ...params
  };
  const devtoolsClientVisible = Object.values(devtoolsState.devtoolsClientDetected).some(Boolean);
  toggleHighPerfMode(!devtoolsClientVisible);
}
var _a18, _b18;
(_b18 = (_a18 = import_devtools_shared23.target).__VUE_DEVTOOLS_UPDATE_CLIENT_DETECTED__) != null ? _b18 : _a18.__VUE_DEVTOOLS_UPDATE_CLIENT_DETECTED__ = updateDevToolsClientDetected;

// src/messaging/index.ts
init_cjs_shims();
var import_devtools_shared31 = require("@vue/devtools-shared");
var import_birpc = require("birpc");

// src/messaging/presets/index.ts
init_cjs_shims();

// src/messaging/presets/broadcast-channel/index.ts
init_cjs_shims();

// ../../node_modules/.pnpm/superjson@2.2.2/node_modules/superjson/dist/index.js
init_cjs_shims();

// ../../node_modules/.pnpm/superjson@2.2.2/node_modules/superjson/dist/class-registry.js
init_cjs_shims();

// ../../node_modules/.pnpm/superjson@2.2.2/node_modules/superjson/dist/registry.js
init_cjs_shims();

// ../../node_modules/.pnpm/superjson@2.2.2/node_modules/superjson/dist/double-indexed-kv.js
init_cjs_shims();
var DoubleIndexedKV = class {
  constructor() {
    this.keyToValue = /* @__PURE__ */ new Map();
    this.valueToKey = /* @__PURE__ */ new Map();
  }
  set(key, value) {
    this.keyToValue.set(key, value);
    this.valueToKey.set(value, key);
  }
  getByKey(key) {
    return this.keyToValue.get(key);
  }
  getByValue(value) {
    return this.valueToKey.get(value);
  }
  clear() {
    this.keyToValue.clear();
    this.valueToKey.clear();
  }
};

// ../../node_modules/.pnpm/superjson@2.2.2/node_modules/superjson/dist/registry.js
var Registry = class {
  constructor(generateIdentifier) {
    this.generateIdentifier = generateIdentifier;
    this.kv = new DoubleIndexedKV();
  }
  register(value, identifier) {
    if (this.kv.getByValue(value)) {
      return;
    }
    if (!identifier) {
      identifier = this.generateIdentifier(value);
    }
    this.kv.set(identifier, value);
  }
  clear() {
    this.kv.clear();
  }
  getIdentifier(value) {
    return this.kv.getByValue(value);
  }
  getValue(identifier) {
    return this.kv.getByKey(identifier);
  }
};

// ../../node_modules/.pnpm/superjson@2.2.2/node_modules/superjson/dist/class-registry.js
var ClassRegistry = class extends Registry {
  constructor() {
    super((c) => c.name);
    this.classToAllowedProps = /* @__PURE__ */ new Map();
  }
  register(value, options) {
    if (typeof options === "object") {
      if (options.allowProps) {
        this.classToAllowedProps.set(value, options.allowProps);
      }
      super.register(value, options.identifier);
    } else {
      super.register(value, options);
    }
  }
  getAllowedProps(value) {
    return this.classToAllowedProps.get(value);
  }
};

// ../../node_modules/.pnpm/superjson@2.2.2/node_modules/superjson/dist/custom-transformer-registry.js
init_cjs_shims();

// ../../node_modules/.pnpm/superjson@2.2.2/node_modules/superjson/dist/util.js
init_cjs_shims();
function valuesOfObj(record) {
  if ("values" in Object) {
    return Object.values(record);
  }
  const values = [];
  for (const key in record) {
    if (record.hasOwnProperty(key)) {
      values.push(record[key]);
    }
  }
  return values;
}
function find(record, predicate) {
  const values = valuesOfObj(record);
  if ("find" in values) {
    return values.find(predicate);
  }
  const valuesNotNever = values;
  for (let i = 0; i < valuesNotNever.length; i++) {
    const value = valuesNotNever[i];
    if (predicate(value)) {
      return value;
    }
  }
  return void 0;
}
function forEach(record, run) {
  Object.entries(record).forEach(([key, value]) => run(value, key));
}
function includes(arr, value) {
  return arr.indexOf(value) !== -1;
}
function findArr(record, predicate) {
  for (let i = 0; i < record.length; i++) {
    const value = record[i];
    if (predicate(value)) {
      return value;
    }
  }
  return void 0;
}

// ../../node_modules/.pnpm/superjson@2.2.2/node_modules/superjson/dist/custom-transformer-registry.js
var CustomTransformerRegistry = class {
  constructor() {
    this.transfomers = {};
  }
  register(transformer) {
    this.transfomers[transformer.name] = transformer;
  }
  findApplicable(v) {
    return find(this.transfomers, (transformer) => transformer.isApplicable(v));
  }
  findByName(name) {
    return this.transfomers[name];
  }
};

// ../../node_modules/.pnpm/superjson@2.2.2/node_modules/superjson/dist/plainer.js
init_cjs_shims();

// ../../node_modules/.pnpm/superjson@2.2.2/node_modules/superjson/dist/is.js
init_cjs_shims();
var getType = (payload) => Object.prototype.toString.call(payload).slice(8, -1);
var isUndefined = (payload) => typeof payload === "undefined";
var isNull = (payload) => payload === null;
var isPlainObject2 = (payload) => {
  if (typeof payload !== "object" || payload === null)
    return false;
  if (payload === Object.prototype)
    return false;
  if (Object.getPrototypeOf(payload) === null)
    return true;
  return Object.getPrototypeOf(payload) === Object.prototype;
};
var isEmptyObject = (payload) => isPlainObject2(payload) && Object.keys(payload).length === 0;
var isArray = (payload) => Array.isArray(payload);
var isString = (payload) => typeof payload === "string";
var isNumber = (payload) => typeof payload === "number" && !isNaN(payload);
var isBoolean = (payload) => typeof payload === "boolean";
var isRegExp = (payload) => payload instanceof RegExp;
var isMap = (payload) => payload instanceof Map;
var isSet = (payload) => payload instanceof Set;
var isSymbol = (payload) => getType(payload) === "Symbol";
var isDate = (payload) => payload instanceof Date && !isNaN(payload.valueOf());
var isError = (payload) => payload instanceof Error;
var isNaNValue = (payload) => typeof payload === "number" && isNaN(payload);
var isPrimitive2 = (payload) => isBoolean(payload) || isNull(payload) || isUndefined(payload) || isNumber(payload) || isString(payload) || isSymbol(payload);
var isBigint = (payload) => typeof payload === "bigint";
var isInfinite = (payload) => payload === Infinity || payload === -Infinity;
var isTypedArray = (payload) => ArrayBuffer.isView(payload) && !(payload instanceof DataView);
var isURL = (payload) => payload instanceof URL;

// ../../node_modules/.pnpm/superjson@2.2.2/node_modules/superjson/dist/pathstringifier.js
init_cjs_shims();
var escapeKey = (key) => key.replace(/\./g, "\\.");
var stringifyPath = (path) => path.map(String).map(escapeKey).join(".");
var parsePath = (string) => {
  const result = [];
  let segment = "";
  for (let i = 0; i < string.length; i++) {
    let char = string.charAt(i);
    const isEscapedDot = char === "\\" && string.charAt(i + 1) === ".";
    if (isEscapedDot) {
      segment += ".";
      i++;
      continue;
    }
    const isEndOfSegment = char === ".";
    if (isEndOfSegment) {
      result.push(segment);
      segment = "";
      continue;
    }
    segment += char;
  }
  const lastSegment = segment;
  result.push(lastSegment);
  return result;
};

// ../../node_modules/.pnpm/superjson@2.2.2/node_modules/superjson/dist/transformer.js
init_cjs_shims();
function simpleTransformation(isApplicable, annotation, transform, untransform) {
  return {
    isApplicable,
    annotation,
    transform,
    untransform
  };
}
var simpleRules = [
  simpleTransformation(isUndefined, "undefined", () => null, () => void 0),
  simpleTransformation(isBigint, "bigint", (v) => v.toString(), (v) => {
    if (typeof BigInt !== "undefined") {
      return BigInt(v);
    }
    console.error("Please add a BigInt polyfill.");
    return v;
  }),
  simpleTransformation(isDate, "Date", (v) => v.toISOString(), (v) => new Date(v)),
  simpleTransformation(isError, "Error", (v, superJson) => {
    const baseError = {
      name: v.name,
      message: v.message
    };
    superJson.allowedErrorProps.forEach((prop) => {
      baseError[prop] = v[prop];
    });
    return baseError;
  }, (v, superJson) => {
    const e = new Error(v.message);
    e.name = v.name;
    e.stack = v.stack;
    superJson.allowedErrorProps.forEach((prop) => {
      e[prop] = v[prop];
    });
    return e;
  }),
  simpleTransformation(isRegExp, "regexp", (v) => "" + v, (regex) => {
    const body = regex.slice(1, regex.lastIndexOf("/"));
    const flags = regex.slice(regex.lastIndexOf("/") + 1);
    return new RegExp(body, flags);
  }),
  simpleTransformation(
    isSet,
    "set",
    // (sets only exist in es6+)
    // eslint-disable-next-line es5/no-es6-methods
    (v) => [...v.values()],
    (v) => new Set(v)
  ),
  simpleTransformation(isMap, "map", (v) => [...v.entries()], (v) => new Map(v)),
  simpleTransformation((v) => isNaNValue(v) || isInfinite(v), "number", (v) => {
    if (isNaNValue(v)) {
      return "NaN";
    }
    if (v > 0) {
      return "Infinity";
    } else {
      return "-Infinity";
    }
  }, Number),
  simpleTransformation((v) => v === 0 && 1 / v === -Infinity, "number", () => {
    return "-0";
  }, Number),
  simpleTransformation(isURL, "URL", (v) => v.toString(), (v) => new URL(v))
];
function compositeTransformation(isApplicable, annotation, transform, untransform) {
  return {
    isApplicable,
    annotation,
    transform,
    untransform
  };
}
var symbolRule = compositeTransformation((s, superJson) => {
  if (isSymbol(s)) {
    const isRegistered = !!superJson.symbolRegistry.getIdentifier(s);
    return isRegistered;
  }
  return false;
}, (s, superJson) => {
  const identifier = superJson.symbolRegistry.getIdentifier(s);
  return ["symbol", identifier];
}, (v) => v.description, (_, a, superJson) => {
  const value = superJson.symbolRegistry.getValue(a[1]);
  if (!value) {
    throw new Error("Trying to deserialize unknown symbol");
  }
  return value;
});
var constructorToName = [
  Int8Array,
  Uint8Array,
  Int16Array,
  Uint16Array,
  Int32Array,
  Uint32Array,
  Float32Array,
  Float64Array,
  Uint8ClampedArray
].reduce((obj, ctor) => {
  obj[ctor.name] = ctor;
  return obj;
}, {});
var typedArrayRule = compositeTransformation(isTypedArray, (v) => ["typed-array", v.constructor.name], (v) => [...v], (v, a) => {
  const ctor = constructorToName[a[1]];
  if (!ctor) {
    throw new Error("Trying to deserialize unknown typed array");
  }
  return new ctor(v);
});
function isInstanceOfRegisteredClass(potentialClass, superJson) {
  if (potentialClass == null ? void 0 : potentialClass.constructor) {
    const isRegistered = !!superJson.classRegistry.getIdentifier(potentialClass.constructor);
    return isRegistered;
  }
  return false;
}
var classRule = compositeTransformation(isInstanceOfRegisteredClass, (clazz, superJson) => {
  const identifier = superJson.classRegistry.getIdentifier(clazz.constructor);
  return ["class", identifier];
}, (clazz, superJson) => {
  const allowedProps = superJson.classRegistry.getAllowedProps(clazz.constructor);
  if (!allowedProps) {
    return { ...clazz };
  }
  const result = {};
  allowedProps.forEach((prop) => {
    result[prop] = clazz[prop];
  });
  return result;
}, (v, a, superJson) => {
  const clazz = superJson.classRegistry.getValue(a[1]);
  if (!clazz) {
    throw new Error(`Trying to deserialize unknown class '${a[1]}' - check https://github.com/blitz-js/superjson/issues/116#issuecomment-773996564`);
  }
  return Object.assign(Object.create(clazz.prototype), v);
});
var customRule = compositeTransformation((value, superJson) => {
  return !!superJson.customTransformerRegistry.findApplicable(value);
}, (value, superJson) => {
  const transformer = superJson.customTransformerRegistry.findApplicable(value);
  return ["custom", transformer.name];
}, (value, superJson) => {
  const transformer = superJson.customTransformerRegistry.findApplicable(value);
  return transformer.serialize(value);
}, (v, a, superJson) => {
  const transformer = superJson.customTransformerRegistry.findByName(a[1]);
  if (!transformer) {
    throw new Error("Trying to deserialize unknown custom value");
  }
  return transformer.deserialize(v);
});
var compositeRules = [classRule, symbolRule, customRule, typedArrayRule];
var transformValue = (value, superJson) => {
  const applicableCompositeRule = findArr(compositeRules, (rule) => rule.isApplicable(value, superJson));
  if (applicableCompositeRule) {
    return {
      value: applicableCompositeRule.transform(value, superJson),
      type: applicableCompositeRule.annotation(value, superJson)
    };
  }
  const applicableSimpleRule = findArr(simpleRules, (rule) => rule.isApplicable(value, superJson));
  if (applicableSimpleRule) {
    return {
      value: applicableSimpleRule.transform(value, superJson),
      type: applicableSimpleRule.annotation
    };
  }
  return void 0;
};
var simpleRulesByAnnotation = {};
simpleRules.forEach((rule) => {
  simpleRulesByAnnotation[rule.annotation] = rule;
});
var untransformValue = (json, type, superJson) => {
  if (isArray(type)) {
    switch (type[0]) {
      case "symbol":
        return symbolRule.untransform(json, type, superJson);
      case "class":
        return classRule.untransform(json, type, superJson);
      case "custom":
        return customRule.untransform(json, type, superJson);
      case "typed-array":
        return typedArrayRule.untransform(json, type, superJson);
      default:
        throw new Error("Unknown transformation: " + type);
    }
  } else {
    const transformation = simpleRulesByAnnotation[type];
    if (!transformation) {
      throw new Error("Unknown transformation: " + type);
    }
    return transformation.untransform(json, superJson);
  }
};

// ../../node_modules/.pnpm/superjson@2.2.2/node_modules/superjson/dist/accessDeep.js
init_cjs_shims();
var getNthKey = (value, n) => {
  if (n > value.size)
    throw new Error("index out of bounds");
  const keys = value.keys();
  while (n > 0) {
    keys.next();
    n--;
  }
  return keys.next().value;
};
function validatePath(path) {
  if (includes(path, "__proto__")) {
    throw new Error("__proto__ is not allowed as a property");
  }
  if (includes(path, "prototype")) {
    throw new Error("prototype is not allowed as a property");
  }
  if (includes(path, "constructor")) {
    throw new Error("constructor is not allowed as a property");
  }
}
var getDeep = (object, path) => {
  validatePath(path);
  for (let i = 0; i < path.length; i++) {
    const key = path[i];
    if (isSet(object)) {
      object = getNthKey(object, +key);
    } else if (isMap(object)) {
      const row = +key;
      const type = +path[++i] === 0 ? "key" : "value";
      const keyOfRow = getNthKey(object, row);
      switch (type) {
        case "key":
          object = keyOfRow;
          break;
        case "value":
          object = object.get(keyOfRow);
          break;
      }
    } else {
      object = object[key];
    }
  }
  return object;
};
var setDeep = (object, path, mapper) => {
  validatePath(path);
  if (path.length === 0) {
    return mapper(object);
  }
  let parent = object;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (isArray(parent)) {
      const index = +key;
      parent = parent[index];
    } else if (isPlainObject2(parent)) {
      parent = parent[key];
    } else if (isSet(parent)) {
      const row = +key;
      parent = getNthKey(parent, row);
    } else if (isMap(parent)) {
      const isEnd = i === path.length - 2;
      if (isEnd) {
        break;
      }
      const row = +key;
      const type = +path[++i] === 0 ? "key" : "value";
      const keyOfRow = getNthKey(parent, row);
      switch (type) {
        case "key":
          parent = keyOfRow;
          break;
        case "value":
          parent = parent.get(keyOfRow);
          break;
      }
    }
  }
  const lastKey = path[path.length - 1];
  if (isArray(parent)) {
    parent[+lastKey] = mapper(parent[+lastKey]);
  } else if (isPlainObject2(parent)) {
    parent[lastKey] = mapper(parent[lastKey]);
  }
  if (isSet(parent)) {
    const oldValue = getNthKey(parent, +lastKey);
    const newValue = mapper(oldValue);
    if (oldValue !== newValue) {
      parent.delete(oldValue);
      parent.add(newValue);
    }
  }
  if (isMap(parent)) {
    const row = +path[path.length - 2];
    const keyToRow = getNthKey(parent, row);
    const type = +lastKey === 0 ? "key" : "value";
    switch (type) {
      case "key": {
        const newKey = mapper(keyToRow);
        parent.set(newKey, parent.get(keyToRow));
        if (newKey !== keyToRow) {
          parent.delete(keyToRow);
        }
        break;
      }
      case "value": {
        parent.set(keyToRow, mapper(parent.get(keyToRow)));
        break;
      }
    }
  }
  return object;
};

// ../../node_modules/.pnpm/superjson@2.2.2/node_modules/superjson/dist/plainer.js
function traverse(tree, walker2, origin = []) {
  if (!tree) {
    return;
  }
  if (!isArray(tree)) {
    forEach(tree, (subtree, key) => traverse(subtree, walker2, [...origin, ...parsePath(key)]));
    return;
  }
  const [nodeValue, children] = tree;
  if (children) {
    forEach(children, (child, key) => {
      traverse(child, walker2, [...origin, ...parsePath(key)]);
    });
  }
  walker2(nodeValue, origin);
}
function applyValueAnnotations(plain, annotations, superJson) {
  traverse(annotations, (type, path) => {
    plain = setDeep(plain, path, (v) => untransformValue(v, type, superJson));
  });
  return plain;
}
function applyReferentialEqualityAnnotations(plain, annotations) {
  function apply(identicalPaths, path) {
    const object = getDeep(plain, parsePath(path));
    identicalPaths.map(parsePath).forEach((identicalObjectPath) => {
      plain = setDeep(plain, identicalObjectPath, () => object);
    });
  }
  if (isArray(annotations)) {
    const [root, other] = annotations;
    root.forEach((identicalPath) => {
      plain = setDeep(plain, parsePath(identicalPath), () => plain);
    });
    if (other) {
      forEach(other, apply);
    }
  } else {
    forEach(annotations, apply);
  }
  return plain;
}
var isDeep = (object, superJson) => isPlainObject2(object) || isArray(object) || isMap(object) || isSet(object) || isInstanceOfRegisteredClass(object, superJson);
function addIdentity(object, path, identities) {
  const existingSet = identities.get(object);
  if (existingSet) {
    existingSet.push(path);
  } else {
    identities.set(object, [path]);
  }
}
function generateReferentialEqualityAnnotations(identitites, dedupe) {
  const result = {};
  let rootEqualityPaths = void 0;
  identitites.forEach((paths) => {
    if (paths.length <= 1) {
      return;
    }
    if (!dedupe) {
      paths = paths.map((path) => path.map(String)).sort((a, b) => a.length - b.length);
    }
    const [representativePath, ...identicalPaths] = paths;
    if (representativePath.length === 0) {
      rootEqualityPaths = identicalPaths.map(stringifyPath);
    } else {
      result[stringifyPath(representativePath)] = identicalPaths.map(stringifyPath);
    }
  });
  if (rootEqualityPaths) {
    if (isEmptyObject(result)) {
      return [rootEqualityPaths];
    } else {
      return [rootEqualityPaths, result];
    }
  } else {
    return isEmptyObject(result) ? void 0 : result;
  }
}
var walker = (object, identities, superJson, dedupe, path = [], objectsInThisPath = [], seenObjects = /* @__PURE__ */ new Map()) => {
  var _a25;
  const primitive = isPrimitive2(object);
  if (!primitive) {
    addIdentity(object, path, identities);
    const seen = seenObjects.get(object);
    if (seen) {
      return dedupe ? {
        transformedValue: null
      } : seen;
    }
  }
  if (!isDeep(object, superJson)) {
    const transformed2 = transformValue(object, superJson);
    const result2 = transformed2 ? {
      transformedValue: transformed2.value,
      annotations: [transformed2.type]
    } : {
      transformedValue: object
    };
    if (!primitive) {
      seenObjects.set(object, result2);
    }
    return result2;
  }
  if (includes(objectsInThisPath, object)) {
    return {
      transformedValue: null
    };
  }
  const transformationResult = transformValue(object, superJson);
  const transformed = (_a25 = transformationResult == null ? void 0 : transformationResult.value) != null ? _a25 : object;
  const transformedValue = isArray(transformed) ? [] : {};
  const innerAnnotations = {};
  forEach(transformed, (value, index) => {
    if (index === "__proto__" || index === "constructor" || index === "prototype") {
      throw new Error(`Detected property ${index}. This is a prototype pollution risk, please remove it from your object.`);
    }
    const recursiveResult = walker(value, identities, superJson, dedupe, [...path, index], [...objectsInThisPath, object], seenObjects);
    transformedValue[index] = recursiveResult.transformedValue;
    if (isArray(recursiveResult.annotations)) {
      innerAnnotations[index] = recursiveResult.annotations;
    } else if (isPlainObject2(recursiveResult.annotations)) {
      forEach(recursiveResult.annotations, (tree, key) => {
        innerAnnotations[escapeKey(index) + "." + key] = tree;
      });
    }
  });
  const result = isEmptyObject(innerAnnotations) ? {
    transformedValue,
    annotations: !!transformationResult ? [transformationResult.type] : void 0
  } : {
    transformedValue,
    annotations: !!transformationResult ? [transformationResult.type, innerAnnotations] : innerAnnotations
  };
  if (!primitive) {
    seenObjects.set(object, result);
  }
  return result;
};

// ../../node_modules/.pnpm/copy-anything@3.0.5/node_modules/copy-anything/dist/index.js
init_cjs_shims();

// ../../node_modules/.pnpm/is-what@4.1.16/node_modules/is-what/dist/index.js
init_cjs_shims();
function getType2(payload) {
  return Object.prototype.toString.call(payload).slice(8, -1);
}
function isArray2(payload) {
  return getType2(payload) === "Array";
}
function isPlainObject3(payload) {
  if (getType2(payload) !== "Object")
    return false;
  const prototype = Object.getPrototypeOf(payload);
  return !!prototype && prototype.constructor === Object && prototype === Object.prototype;
}
function isNull2(payload) {
  return getType2(payload) === "Null";
}
function isOneOf(a, b, c, d, e) {
  return (value) => a(value) || b(value) || !!c && c(value) || !!d && d(value) || !!e && e(value);
}
function isUndefined2(payload) {
  return getType2(payload) === "Undefined";
}
var isNullOrUndefined = isOneOf(isNull2, isUndefined2);

// ../../node_modules/.pnpm/copy-anything@3.0.5/node_modules/copy-anything/dist/index.js
function assignProp(carry, key, newVal, originalObject, includeNonenumerable) {
  const propType = {}.propertyIsEnumerable.call(originalObject, key) ? "enumerable" : "nonenumerable";
  if (propType === "enumerable")
    carry[key] = newVal;
  if (includeNonenumerable && propType === "nonenumerable") {
    Object.defineProperty(carry, key, {
      value: newVal,
      enumerable: false,
      writable: true,
      configurable: true
    });
  }
}
function copy(target22, options = {}) {
  if (isArray2(target22)) {
    return target22.map((item) => copy(item, options));
  }
  if (!isPlainObject3(target22)) {
    return target22;
  }
  const props = Object.getOwnPropertyNames(target22);
  const symbols = Object.getOwnPropertySymbols(target22);
  return [...props, ...symbols].reduce((carry, key) => {
    if (isArray2(options.props) && !options.props.includes(key)) {
      return carry;
    }
    const val = target22[key];
    const newVal = copy(val, options);
    assignProp(carry, key, newVal, target22, options.nonenumerable);
    return carry;
  }, {});
}

// ../../node_modules/.pnpm/superjson@2.2.2/node_modules/superjson/dist/index.js
var SuperJSON = class {
  /**
   * @param dedupeReferentialEqualities  If true, SuperJSON will make sure only one instance of referentially equal objects are serialized and the rest are replaced with `null`.
   */
  constructor({ dedupe = false } = {}) {
    this.classRegistry = new ClassRegistry();
    this.symbolRegistry = new Registry((s) => {
      var _a25;
      return (_a25 = s.description) != null ? _a25 : "";
    });
    this.customTransformerRegistry = new CustomTransformerRegistry();
    this.allowedErrorProps = [];
    this.dedupe = dedupe;
  }
  serialize(object) {
    const identities = /* @__PURE__ */ new Map();
    const output = walker(object, identities, this, this.dedupe);
    const res = {
      json: output.transformedValue
    };
    if (output.annotations) {
      res.meta = {
        ...res.meta,
        values: output.annotations
      };
    }
    const equalityAnnotations = generateReferentialEqualityAnnotations(identities, this.dedupe);
    if (equalityAnnotations) {
      res.meta = {
        ...res.meta,
        referentialEqualities: equalityAnnotations
      };
    }
    return res;
  }
  deserialize(payload) {
    const { json, meta } = payload;
    let result = copy(json);
    if (meta == null ? void 0 : meta.values) {
      result = applyValueAnnotations(result, meta.values, this);
    }
    if (meta == null ? void 0 : meta.referentialEqualities) {
      result = applyReferentialEqualityAnnotations(result, meta.referentialEqualities);
    }
    return result;
  }
  stringify(object) {
    return JSON.stringify(this.serialize(object));
  }
  parse(string) {
    return this.deserialize(JSON.parse(string));
  }
  registerClass(v, options) {
    this.classRegistry.register(v, options);
  }
  registerSymbol(v, identifier) {
    this.symbolRegistry.register(v, identifier);
  }
  registerCustom(transformer, name) {
    this.customTransformerRegistry.register({
      name,
      ...transformer
    });
  }
  allowErrorProps(...props) {
    this.allowedErrorProps.push(...props);
  }
};
SuperJSON.defaultInstance = new SuperJSON();
SuperJSON.serialize = SuperJSON.defaultInstance.serialize.bind(SuperJSON.defaultInstance);
SuperJSON.deserialize = SuperJSON.defaultInstance.deserialize.bind(SuperJSON.defaultInstance);
SuperJSON.stringify = SuperJSON.defaultInstance.stringify.bind(SuperJSON.defaultInstance);
SuperJSON.parse = SuperJSON.defaultInstance.parse.bind(SuperJSON.defaultInstance);
SuperJSON.registerClass = SuperJSON.defaultInstance.registerClass.bind(SuperJSON.defaultInstance);
SuperJSON.registerSymbol = SuperJSON.defaultInstance.registerSymbol.bind(SuperJSON.defaultInstance);
SuperJSON.registerCustom = SuperJSON.defaultInstance.registerCustom.bind(SuperJSON.defaultInstance);
SuperJSON.allowErrorProps = SuperJSON.defaultInstance.allowErrorProps.bind(SuperJSON.defaultInstance);
var serialize = SuperJSON.serialize;
var deserialize = SuperJSON.deserialize;
var stringify = SuperJSON.stringify;
var parse = SuperJSON.parse;
var registerClass = SuperJSON.registerClass;
var registerCustom = SuperJSON.registerCustom;
var registerSymbol = SuperJSON.registerSymbol;
var allowErrorProps = SuperJSON.allowErrorProps;

// src/messaging/presets/broadcast-channel/context.ts
init_cjs_shims();
var __DEVTOOLS_KIT_BROADCAST_MESSAGING_EVENT_KEY = "__devtools-kit-broadcast-messaging-event-key__";

// src/messaging/presets/broadcast-channel/index.ts
var BROADCAST_CHANNEL_NAME = "__devtools-kit:broadcast-channel__";
function createBroadcastChannel() {
  const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  return {
    post: (data) => {
      channel.postMessage(SuperJSON.stringify({
        event: __DEVTOOLS_KIT_BROADCAST_MESSAGING_EVENT_KEY,
        data
      }));
    },
    on: (handler) => {
      channel.onmessage = (event) => {
        const parsed = SuperJSON.parse(event.data);
        if (parsed.event === __DEVTOOLS_KIT_BROADCAST_MESSAGING_EVENT_KEY) {
          handler(parsed.data);
        }
      };
    }
  };
}

// src/messaging/presets/electron/index.ts
init_cjs_shims();

// src/messaging/presets/electron/client.ts
init_cjs_shims();

// src/messaging/presets/electron/context.ts
init_cjs_shims();
var import_devtools_shared24 = require("@vue/devtools-shared");
var __ELECTRON_CLIENT_CONTEXT__ = "electron:client-context";
var __ELECTRON_RPOXY_CONTEXT__ = "electron:proxy-context";
var __ELECTRON_SERVER_CONTEXT__ = "electron:server-context";
var __DEVTOOLS_KIT_ELECTRON_MESSAGING_EVENT_KEY__ = {
  // client
  CLIENT_TO_PROXY: "client->proxy",
  // on: proxy->client
  // proxy
  PROXY_TO_CLIENT: "proxy->client",
  // on: server->proxy
  PROXY_TO_SERVER: "proxy->server",
  // on: client->proxy
  // server
  SERVER_TO_PROXY: "server->proxy"
  // on: proxy->server
};
function getElectronClientContext() {
  return import_devtools_shared24.target[__ELECTRON_CLIENT_CONTEXT__];
}
function setElectronClientContext(context) {
  import_devtools_shared24.target[__ELECTRON_CLIENT_CONTEXT__] = context;
}
function getElectronProxyContext() {
  return import_devtools_shared24.target[__ELECTRON_RPOXY_CONTEXT__];
}
function setElectronProxyContext(context) {
  import_devtools_shared24.target[__ELECTRON_RPOXY_CONTEXT__] = context;
}
function getElectronServerContext() {
  return import_devtools_shared24.target[__ELECTRON_SERVER_CONTEXT__];
}
function setElectronServerContext(context) {
  import_devtools_shared24.target[__ELECTRON_SERVER_CONTEXT__] = context;
}

// src/messaging/presets/electron/client.ts
function createElectronClientChannel() {
  const socket = getElectronClientContext();
  return {
    post: (data) => {
      socket.emit(__DEVTOOLS_KIT_ELECTRON_MESSAGING_EVENT_KEY__.CLIENT_TO_PROXY, SuperJSON.stringify(data));
    },
    on: (handler) => {
      socket.on(__DEVTOOLS_KIT_ELECTRON_MESSAGING_EVENT_KEY__.PROXY_TO_CLIENT, (e) => {
        handler(SuperJSON.parse(e));
      });
    }
  };
}

// src/messaging/presets/electron/proxy.ts
init_cjs_shims();
function createElectronProxyChannel() {
  const socket = getElectronProxyContext();
  return {
    post: (data) => {
    },
    on: (handler) => {
      socket.on(__DEVTOOLS_KIT_ELECTRON_MESSAGING_EVENT_KEY__.SERVER_TO_PROXY, (data) => {
        socket.broadcast.emit(__DEVTOOLS_KIT_ELECTRON_MESSAGING_EVENT_KEY__.PROXY_TO_CLIENT, data);
      });
      socket.on(__DEVTOOLS_KIT_ELECTRON_MESSAGING_EVENT_KEY__.CLIENT_TO_PROXY, (data) => {
        socket.broadcast.emit(__DEVTOOLS_KIT_ELECTRON_MESSAGING_EVENT_KEY__.PROXY_TO_SERVER, data);
      });
    }
  };
}

// src/messaging/presets/electron/server.ts
init_cjs_shims();
function createElectronServerChannel() {
  const socket = getElectronServerContext();
  return {
    post: (data) => {
      socket.emit(__DEVTOOLS_KIT_ELECTRON_MESSAGING_EVENT_KEY__.SERVER_TO_PROXY, SuperJSON.stringify(data));
    },
    on: (handler) => {
      socket.on(__DEVTOOLS_KIT_ELECTRON_MESSAGING_EVENT_KEY__.PROXY_TO_SERVER, (data) => {
        handler(SuperJSON.parse(data));
      });
    }
  };
}

// src/messaging/presets/extension/index.ts
init_cjs_shims();

// src/messaging/presets/extension/client.ts
init_cjs_shims();

// src/messaging/presets/extension/context.ts
init_cjs_shims();
var import_devtools_shared25 = require("@vue/devtools-shared");
var __EXTENSION_CLIENT_CONTEXT__ = "electron:client-context";
var __DEVTOOLS_KIT_EXTENSION_MESSAGING_EVENT_KEY__ = {
  // client
  CLIENT_TO_PROXY: "client->proxy",
  // on: proxy->client
  // proxy
  PROXY_TO_CLIENT: "proxy->client",
  // on: server->proxy
  PROXY_TO_SERVER: "proxy->server",
  // on: client->proxy
  // server
  SERVER_TO_PROXY: "server->proxy"
  // on: proxy->server
};
function getExtensionClientContext() {
  return import_devtools_shared25.target[__EXTENSION_CLIENT_CONTEXT__];
}
function setExtensionClientContext(context) {
  import_devtools_shared25.target[__EXTENSION_CLIENT_CONTEXT__] = context;
}

// src/messaging/presets/extension/client.ts
function createExtensionClientChannel() {
  let disconnected = false;
  let port = null;
  let reconnectTimer = null;
  let onMessageHandler = null;
  function connect() {
    try {
      clearTimeout(reconnectTimer);
      port = chrome.runtime.connect({
        name: `${chrome.devtools.inspectedWindow.tabId}`
      });
      setExtensionClientContext(port);
      disconnected = false;
      port == null ? void 0 : port.onMessage.addListener(onMessageHandler);
      port.onDisconnect.addListener(() => {
        disconnected = true;
        port == null ? void 0 : port.onMessage.removeListener(onMessageHandler);
        reconnectTimer = setTimeout(connect, 1e3);
      });
    } catch (e) {
      disconnected = true;
    }
  }
  connect();
  return {
    post: (data) => {
      if (disconnected) {
        return;
      }
      port == null ? void 0 : port.postMessage(SuperJSON.stringify(data));
    },
    on: (handler) => {
      onMessageHandler = (data) => {
        if (disconnected) {
          return;
        }
        handler(SuperJSON.parse(data));
      };
      port == null ? void 0 : port.onMessage.addListener(onMessageHandler);
    }
  };
}

// src/messaging/presets/extension/proxy.ts
init_cjs_shims();
function createExtensionProxyChannel() {
  const port = chrome.runtime.connect({
    name: "content-script"
  });
  function sendMessageToUserApp(payload) {
    window.postMessage({
      source: __DEVTOOLS_KIT_EXTENSION_MESSAGING_EVENT_KEY__.PROXY_TO_SERVER,
      payload
    }, "*");
  }
  function sendMessageToDevToolsClient(e) {
    if (e.data && e.data.source === __DEVTOOLS_KIT_EXTENSION_MESSAGING_EVENT_KEY__.SERVER_TO_PROXY) {
      try {
        port.postMessage(e.data.payload);
      } catch (e2) {
      }
    }
  }
  port.onMessage.addListener(sendMessageToUserApp);
  window.addEventListener("message", sendMessageToDevToolsClient);
  port.onDisconnect.addListener(() => {
    window.removeEventListener("message", sendMessageToDevToolsClient);
    sendMessageToUserApp(SuperJSON.stringify({
      event: "shutdown"
    }));
  });
  sendMessageToUserApp(SuperJSON.stringify({
    event: "init"
  }));
  return {
    post: (data) => {
    },
    on: (handler) => {
    }
  };
}

// src/messaging/presets/extension/server.ts
init_cjs_shims();
function createExtensionServerChannel() {
  return {
    post: (data) => {
      window.postMessage({
        source: __DEVTOOLS_KIT_EXTENSION_MESSAGING_EVENT_KEY__.SERVER_TO_PROXY,
        payload: SuperJSON.stringify(data)
      }, "*");
    },
    on: (handler) => {
      const listener = (event) => {
        if (event.data.source === __DEVTOOLS_KIT_EXTENSION_MESSAGING_EVENT_KEY__.PROXY_TO_SERVER && event.data.payload) {
          handler(SuperJSON.parse(event.data.payload));
        }
      };
      window.addEventListener("message", listener);
      return () => {
        window.removeEventListener("message", listener);
      };
    }
  };
}

// src/messaging/presets/iframe/index.ts
init_cjs_shims();

// src/messaging/presets/iframe/client.ts
init_cjs_shims();
var import_devtools_shared27 = require("@vue/devtools-shared");

// src/messaging/presets/iframe/context.ts
init_cjs_shims();
var import_devtools_shared26 = require("@vue/devtools-shared");
var __DEVTOOLS_KIT_IFRAME_MESSAGING_EVENT_KEY = "__devtools-kit-iframe-messaging-event-key__";
var __IFRAME_SERVER_CONTEXT__ = "iframe:server-context";
function getIframeServerContext() {
  return import_devtools_shared26.target[__IFRAME_SERVER_CONTEXT__];
}
function setIframeServerContext(context) {
  import_devtools_shared26.target[__IFRAME_SERVER_CONTEXT__] = context;
}

// src/messaging/presets/iframe/client.ts
function createIframeClientChannel() {
  if (!import_devtools_shared27.isBrowser) {
    return {
      post: (data) => {
      },
      on: (handler) => {
      }
    };
  }
  return {
    post: (data) => window.parent.postMessage(SuperJSON.stringify({
      event: __DEVTOOLS_KIT_IFRAME_MESSAGING_EVENT_KEY,
      data
    }), "*"),
    on: (handler) => window.addEventListener("message", (event) => {
      try {
        const parsed = SuperJSON.parse(event.data);
        if (event.source === window.parent && parsed.event === __DEVTOOLS_KIT_IFRAME_MESSAGING_EVENT_KEY) {
          handler(parsed.data);
        }
      } catch (e) {
      }
    })
  };
}

// src/messaging/presets/iframe/server.ts
init_cjs_shims();
var import_devtools_shared28 = require("@vue/devtools-shared");
function createIframeServerChannel() {
  if (!import_devtools_shared28.isBrowser) {
    return {
      post: (data) => {
      },
      on: (handler) => {
      }
    };
  }
  return {
    post: (data) => {
      var _a25;
      const iframe = getIframeServerContext();
      (_a25 = iframe == null ? void 0 : iframe.contentWindow) == null ? void 0 : _a25.postMessage(SuperJSON.stringify({
        event: __DEVTOOLS_KIT_IFRAME_MESSAGING_EVENT_KEY,
        data
      }), "*");
    },
    on: (handler) => {
      window.addEventListener("message", (event) => {
        const iframe = getIframeServerContext();
        try {
          const parsed = SuperJSON.parse(event.data);
          if (event.source === (iframe == null ? void 0 : iframe.contentWindow) && parsed.event === __DEVTOOLS_KIT_IFRAME_MESSAGING_EVENT_KEY) {
            handler(parsed.data);
          }
        } catch (e) {
        }
      });
    }
  };
}

// src/messaging/presets/vite/index.ts
init_cjs_shims();

// src/messaging/presets/vite/client.ts
init_cjs_shims();

// src/messaging/presets/vite/context.ts
init_cjs_shims();
var import_devtools_shared29 = require("@vue/devtools-shared");
var __DEVTOOLS_KIT_VITE_MESSAGING_EVENT_KEY = "__devtools-kit-vite-messaging-event-key__";
var __VITE_CLIENT_CONTEXT__ = "vite:client-context";
var __VITE_SERVER_CONTEXT__ = "vite:server-context";
function getViteClientContext() {
  return import_devtools_shared29.target[__VITE_CLIENT_CONTEXT__];
}
function setViteClientContext(context) {
  import_devtools_shared29.target[__VITE_CLIENT_CONTEXT__] = context;
}
function getViteServerContext() {
  return import_devtools_shared29.target[__VITE_SERVER_CONTEXT__];
}
function setViteServerContext(context) {
  import_devtools_shared29.target[__VITE_SERVER_CONTEXT__] = context;
}

// src/messaging/presets/vite/client.ts
function createViteClientChannel() {
  const client = getViteClientContext();
  return {
    post: (data) => {
      client == null ? void 0 : client.send(__DEVTOOLS_KIT_VITE_MESSAGING_EVENT_KEY, SuperJSON.stringify(data));
    },
    on: (handler) => {
      client == null ? void 0 : client.on(__DEVTOOLS_KIT_VITE_MESSAGING_EVENT_KEY, (event) => {
        handler(SuperJSON.parse(event));
      });
    }
  };
}

// src/messaging/presets/vite/server.ts
init_cjs_shims();
function createViteServerChannel() {
  var _a25;
  const viteServer = getViteServerContext();
  const ws = (_a25 = viteServer.hot) != null ? _a25 : viteServer.ws;
  return {
    post: (data) => ws == null ? void 0 : ws.send(__DEVTOOLS_KIT_VITE_MESSAGING_EVENT_KEY, SuperJSON.stringify(data)),
    on: (handler) => ws == null ? void 0 : ws.on(__DEVTOOLS_KIT_VITE_MESSAGING_EVENT_KEY, (event) => {
      handler(SuperJSON.parse(event));
    })
  };
}

// src/messaging/presets/ws/index.ts
init_cjs_shims();

// src/messaging/presets/ws/client.ts
init_cjs_shims();

// src/messaging/presets/ws/context.ts
init_cjs_shims();
var import_devtools_shared30 = require("@vue/devtools-shared");

// src/messaging/presets/ws/server.ts
init_cjs_shims();

// src/messaging/index.ts
var _a19, _b19;
(_b19 = (_a19 = import_devtools_shared31.target).__VUE_DEVTOOLS_KIT_MESSAGE_CHANNELS__) != null ? _b19 : _a19.__VUE_DEVTOOLS_KIT_MESSAGE_CHANNELS__ = [];
var _a20, _b20;
(_b20 = (_a20 = import_devtools_shared31.target).__VUE_DEVTOOLS_KIT_RPC_CLIENT__) != null ? _b20 : _a20.__VUE_DEVTOOLS_KIT_RPC_CLIENT__ = null;
var _a21, _b21;
(_b21 = (_a21 = import_devtools_shared31.target).__VUE_DEVTOOLS_KIT_RPC_SERVER__) != null ? _b21 : _a21.__VUE_DEVTOOLS_KIT_RPC_SERVER__ = null;
var _a22, _b22;
(_b22 = (_a22 = import_devtools_shared31.target).__VUE_DEVTOOLS_KIT_VITE_RPC_CLIENT__) != null ? _b22 : _a22.__VUE_DEVTOOLS_KIT_VITE_RPC_CLIENT__ = null;
var _a23, _b23;
(_b23 = (_a23 = import_devtools_shared31.target).__VUE_DEVTOOLS_KIT_VITE_RPC_SERVER__) != null ? _b23 : _a23.__VUE_DEVTOOLS_KIT_VITE_RPC_SERVER__ = null;
var _a24, _b24;
(_b24 = (_a24 = import_devtools_shared31.target).__VUE_DEVTOOLS_KIT_BROADCAST_RPC_SERVER__) != null ? _b24 : _a24.__VUE_DEVTOOLS_KIT_BROADCAST_RPC_SERVER__ = null;
function setRpcClientToGlobal(rpc) {
  import_devtools_shared31.target.__VUE_DEVTOOLS_KIT_RPC_CLIENT__ = rpc;
}
function setRpcServerToGlobal(rpc) {
  import_devtools_shared31.target.__VUE_DEVTOOLS_KIT_RPC_SERVER__ = rpc;
}
function getRpcClient() {
  return import_devtools_shared31.target.__VUE_DEVTOOLS_KIT_RPC_CLIENT__;
}
function getRpcServer() {
  return import_devtools_shared31.target.__VUE_DEVTOOLS_KIT_RPC_SERVER__;
}
function setViteRpcClientToGlobal(rpc) {
  import_devtools_shared31.target.__VUE_DEVTOOLS_KIT_VITE_RPC_CLIENT__ = rpc;
}
function setViteRpcServerToGlobal(rpc) {
  import_devtools_shared31.target.__VUE_DEVTOOLS_KIT_VITE_RPC_SERVER__ = rpc;
}
function getViteRpcClient() {
  return import_devtools_shared31.target.__VUE_DEVTOOLS_KIT_VITE_RPC_CLIENT__;
}
function getViteRpcServer() {
  return import_devtools_shared31.target.__VUE_DEVTOOLS_KIT_VITE_RPC_SERVER__;
}
function getChannel(preset, host = "client") {
  const channel = {
    iframe: {
      client: createIframeClientChannel,
      server: createIframeServerChannel
    }[host],
    electron: {
      client: createElectronClientChannel,
      proxy: createElectronProxyChannel,
      server: createElectronServerChannel
    }[host],
    vite: {
      client: createViteClientChannel,
      server: createViteServerChannel
    }[host],
    broadcast: {
      client: createBroadcastChannel,
      server: createBroadcastChannel
    }[host],
    extension: {
      client: createExtensionClientChannel,
      proxy: createExtensionProxyChannel,
      server: createExtensionServerChannel
    }[host]
  }[preset];
  return channel();
}
function createRpcClient(functions, options = {}) {
  const { channel: _channel, options: _options, preset } = options;
  const channel = preset ? getChannel(preset) : _channel;
  const rpc = (0, import_birpc.createBirpc)(functions, {
    ..._options,
    ...channel,
    timeout: -1
  });
  if (preset === "vite") {
    setViteRpcClientToGlobal(rpc);
    return;
  }
  setRpcClientToGlobal(rpc);
  return rpc;
}
function createRpcServer(functions, options = {}) {
  const { channel: _channel, options: _options, preset } = options;
  const channel = preset ? getChannel(preset, "server") : _channel;
  const rpcServer = getRpcServer();
  if (!rpcServer) {
    const group = (0, import_birpc.createBirpcGroup)(functions, [channel], {
      ..._options,
      timeout: -1
    });
    if (preset === "vite") {
      setViteRpcServerToGlobal(group);
      return;
    }
    setRpcServerToGlobal(group);
  } else {
    rpcServer.updateChannels((channels) => {
      channels.push(channel);
    });
  }
}
function createRpcProxy(options = {}) {
  const { channel: _channel, options: _options, preset } = options;
  const channel = preset ? getChannel(preset, "proxy") : _channel;
  return (0, import_birpc.createBirpc)({}, {
    ..._options,
    ...channel,
    timeout: -1
  });
}

// src/shared/index.ts
init_cjs_shims();

// src/shared/env.ts
init_cjs_shims();

// src/shared/time.ts
init_cjs_shims();

// src/shared/util.ts
init_cjs_shims();

// src/core/component/state/replacer.ts
init_cjs_shims();

// src/core/component/state/custom.ts
init_cjs_shims();
function getFunctionDetails(func) {
  let string = "";
  let matches = null;
  try {
    string = Function.prototype.toString.call(func);
    matches = String.prototype.match.call(string, /\([\s\S]*?\)/);
  } catch (e) {
  }
  const match = matches && matches[0];
  const args = typeof match === "string" ? match : "(?)";
  const name = typeof func.name === "string" ? func.name : "";
  return {
    _custom: {
      type: "function",
      displayText: `<span style="opacity:.8;margin-right:5px;">function</span> <span style="white-space:nowrap;">${escape(name)}${args}</span>`,
      tooltipText: string.trim() ? `<pre>${string}</pre>` : null
    }
  };
}
function getBigIntDetails(val) {
  const stringifiedBigInt = BigInt.prototype.toString.call(val);
  return {
    _custom: {
      type: "bigint",
      displayText: `BigInt(${stringifiedBigInt})`,
      value: stringifiedBigInt
    }
  };
}
function getDateDetails(val) {
  const date = new Date(val.getTime());
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return {
    _custom: {
      type: "date",
      displayText: Date.prototype.toString.call(val),
      value: date.toISOString().slice(0, -1)
    }
  };
}
function getMapDetails(val) {
  const list = Object.fromEntries(val);
  return {
    _custom: {
      type: "map",
      displayText: "Map",
      value: list,
      readOnly: true,
      fields: {
        abstract: true
      }
    }
  };
}
function getSetDetails(val) {
  const list = Array.from(val);
  return {
    _custom: {
      type: "set",
      displayText: `Set[${list.length}]`,
      value: list,
      readOnly: true
    }
  };
}
function getCaughtGetters(store) {
  const getters = {};
  const origGetters = store.getters || {};
  const keys = Object.keys(origGetters);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    Object.defineProperty(getters, key, {
      enumerable: true,
      get: () => {
        try {
          return origGetters[key];
        } catch (e) {
          return e;
        }
      }
    });
  }
  return getters;
}
function reduceStateList(list) {
  if (!list.length)
    return void 0;
  return list.reduce((map, item) => {
    const key = item.type || "data";
    const obj = map[key] = map[key] || {};
    obj[item.key] = item.value;
    return map;
  }, {});
}
function namedNodeMapToObject(map) {
  const result = {};
  const l = map.length;
  for (let i = 0; i < l; i++) {
    const node = map.item(i);
    result[node.name] = node.value;
  }
  return result;
}
function getStoreDetails(store) {
  return {
    _custom: {
      type: "store",
      displayText: "Store",
      value: {
        state: store.state,
        getters: getCaughtGetters(store)
      },
      fields: {
        abstract: true
      }
    }
  };
}
function getRouterDetails(router) {
  return {
    _custom: {
      type: "router",
      displayText: "VueRouter",
      value: {
        options: router.options,
        currentRoute: router.currentRoute
      },
      fields: {
        abstract: true
      }
    }
  };
}
function getInstanceDetails(instance) {
  if (instance._)
    instance = instance._;
  const state = processInstanceState(instance);
  return {
    _custom: {
      type: "component",
      id: instance.__VUE_DEVTOOLS_NEXT_UID__,
      displayText: getInstanceName(instance),
      tooltipText: "Component instance",
      value: reduceStateList(state),
      fields: {
        abstract: true
      }
    }
  };
}
function getComponentDefinitionDetails(definition) {
  let display = getComponentName(definition);
  if (display) {
    if (definition.name && definition.__file)
      display += ` <span>(${definition.__file})</span>`;
  } else {
    display = "<i>Unknown Component</i>";
  }
  return {
    _custom: {
      type: "component-definition",
      displayText: display,
      tooltipText: "Component definition",
      ...definition.__file ? {
        file: definition.__file
      } : {}
    }
  };
}
function getHTMLElementDetails(value) {
  try {
    return {
      _custom: {
        type: "HTMLElement",
        displayText: `<span class="opacity-30">&lt;</span><span class="text-blue-500">${value.tagName.toLowerCase()}</span><span class="opacity-30">&gt;</span>`,
        value: namedNodeMapToObject(value.attributes)
      }
    };
  } catch (e) {
    return {
      _custom: {
        type: "HTMLElement",
        displayText: `<span class="text-blue-500">${String(value)}</span>`
      }
    };
  }
}
function tryGetRefValue(ref) {
  if (ensurePropertyExists(ref, "_value", true)) {
    return ref._value;
  }
  if (ensurePropertyExists(ref, "value", true)) {
    return ref.value;
  }
}
function getObjectDetails(object) {
  var _a25, _b25, _c, _d;
  const info = getSetupStateType(object);
  const isState = info.ref || info.computed || info.reactive;
  if (isState) {
    const stateTypeName = info.computed ? "Computed" : info.ref ? "Ref" : info.reactive ? "Reactive" : null;
    const value = toRaw2(info.reactive ? object : tryGetRefValue(object));
    const raw = ensurePropertyExists(object, "effect") ? ((_b25 = (_a25 = object.effect) == null ? void 0 : _a25.raw) == null ? void 0 : _b25.toString()) || ((_d = (_c = object.effect) == null ? void 0 : _c.fn) == null ? void 0 : _d.toString()) : null;
    return {
      _custom: {
        type: stateTypeName == null ? void 0 : stateTypeName.toLowerCase(),
        stateTypeName,
        value,
        ...raw ? { tooltipText: `<span class="font-mono">${raw}</span>` } : {}
      }
    };
  }
  if (ensurePropertyExists(object, "__asyncLoader") && typeof object.__asyncLoader === "function") {
    return {
      _custom: {
        type: "component-definition",
        display: "Async component definition"
      }
    };
  }
}

// src/core/component/state/replacer.ts
function stringifyReplacer(key, _value, depth, seenInstance) {
  var _a25;
  if (key === "compilerOptions")
    return;
  const val = this[key];
  const type = typeof val;
  if (Array.isArray(val)) {
    const l = val.length;
    if (l > MAX_ARRAY_SIZE) {
      return {
        _isArray: true,
        length: l,
        items: val.slice(0, MAX_ARRAY_SIZE)
      };
    }
    return val;
  } else if (typeof val === "string") {
    if (val.length > MAX_STRING_SIZE)
      return `${val.substring(0, MAX_STRING_SIZE)}... (${val.length} total length)`;
    else
      return val;
  } else if (type === "undefined") {
    return UNDEFINED;
  } else if (val === Number.POSITIVE_INFINITY) {
    return INFINITY;
  } else if (val === Number.NEGATIVE_INFINITY) {
    return NEGATIVE_INFINITY;
  } else if (typeof val === "function") {
    return getFunctionDetails(val);
  } else if (type === "symbol") {
    return `[native Symbol ${Symbol.prototype.toString.call(val)}]`;
  } else if (typeof val === "bigint") {
    return getBigIntDetails(val);
  } else if (val !== null && typeof val === "object") {
    const proto = Object.prototype.toString.call(val);
    if (proto === "[object Map]") {
      return getMapDetails(val);
    } else if (proto === "[object Set]") {
      return getSetDetails(val);
    } else if (proto === "[object RegExp]") {
      return `[native RegExp ${RegExp.prototype.toString.call(val)}]`;
    } else if (proto === "[object Date]") {
      return getDateDetails(val);
    } else if (proto === "[object Error]") {
      return `[native Error ${val.message}<>${val.stack}]`;
    } else if (ensurePropertyExists(val, "state", true) && ensurePropertyExists(val, "_vm", true)) {
      return getStoreDetails(val);
    } else if (val.constructor && val.constructor.name === "VueRouter") {
      return getRouterDetails(val);
    } else if (isVueInstance(val)) {
      const componentVal = getInstanceDetails(val);
      const parentInstanceDepth = seenInstance == null ? void 0 : seenInstance.get(val);
      if (parentInstanceDepth && parentInstanceDepth < depth) {
        return `[[CircularRef]] <${componentVal._custom.displayText}>`;
      }
      seenInstance == null ? void 0 : seenInstance.set(val, depth);
      return componentVal;
    } else if (ensurePropertyExists(val, "render", true) && typeof val.render === "function") {
      return getComponentDefinitionDetails(val);
    } else if (val.constructor && val.constructor.name === "VNode") {
      return `[native VNode <${val.tag}>]`;
    } else if (typeof HTMLElement !== "undefined" && val instanceof HTMLElement) {
      return getHTMLElementDetails(val);
    } else if (((_a25 = val.constructor) == null ? void 0 : _a25.name) === "Store" && "_wrappedGetters" in val) {
      return "[object Store]";
    } else if (ensurePropertyExists(val, "currentRoute", true)) {
      return "[object Router]";
    }
    const customDetails = getObjectDetails(val);
    if (customDetails != null)
      return customDetails;
  } else if (Number.isNaN(val)) {
    return NAN;
  }
  return sanitize(val);
}

// src/shared/transfer.ts
init_cjs_shims();
var MAX_SERIALIZED_SIZE = 2 * 1024 * 1024;
function isObject(_data, proto) {
  return proto === "[object Object]";
}
function isArray3(_data, proto) {
  return proto === "[object Array]";
}
function isVueReactiveLinkNode(node) {
  var _a25;
  const constructorName = (_a25 = node == null ? void 0 : node.constructor) == null ? void 0 : _a25.name;
  return constructorName === "Dep" && "activeLink" in node || constructorName === "Link" && "dep" in node;
}
function encode(data, replacer, list, seen, depth = 0, seenVueInstance = /* @__PURE__ */ new Map()) {
  let stored;
  let key;
  let value;
  let i;
  let l;
  const seenIndex = seen.get(data);
  if (seenIndex != null)
    return seenIndex;
  const index = list.length;
  const proto = Object.prototype.toString.call(data);
  if (isObject(data, proto)) {
    if (isVueReactiveLinkNode(data)) {
      return index;
    }
    stored = {};
    seen.set(data, index);
    list.push(stored);
    const keys = Object.keys(data);
    for (i = 0, l = keys.length; i < l; i++) {
      key = keys[i];
      if (key === "compilerOptions")
        return index;
      value = data[key];
      const isVm = value != null && isObject(value, Object.prototype.toString.call(data)) && isVueInstance(value);
      try {
        if (replacer) {
          value = replacer.call(data, key, value, depth, seenVueInstance);
        }
      } catch (e) {
        value = e;
      }
      stored[key] = encode(value, replacer, list, seen, depth + 1, seenVueInstance);
      if (isVm) {
        seenVueInstance.delete(value);
      }
    }
  } else if (isArray3(data, proto)) {
    stored = [];
    seen.set(data, index);
    list.push(stored);
    for (i = 0, l = data.length; i < l; i++) {
      try {
        value = data[i];
        if (replacer)
          value = replacer.call(data, i, value, depth, seenVueInstance);
      } catch (e) {
        value = e;
      }
      stored[i] = encode(value, replacer, list, seen, depth + 1, seenVueInstance);
    }
  } else {
    list.push(data);
  }
  return index;
}
function decode(list, reviver2 = null) {
  let i = list.length;
  let j, k, data, key, value, proto;
  while (i--) {
    data = list[i];
    proto = Object.prototype.toString.call(data);
    if (proto === "[object Object]") {
      const keys = Object.keys(data);
      for (j = 0, k = keys.length; j < k; j++) {
        key = keys[j];
        value = list[data[key]];
        if (reviver2)
          value = reviver2.call(data, key, value);
        data[key] = value;
      }
    } else if (proto === "[object Array]") {
      for (j = 0, k = data.length; j < k; j++) {
        value = list[data[j]];
        if (reviver2)
          value = reviver2.call(data, j, value);
        data[j] = value;
      }
    }
  }
}
function stringifyCircularAutoChunks(data, replacer = null, space = null) {
  let result;
  try {
    result = arguments.length === 1 ? JSON.stringify(data) : JSON.stringify(data, (k, v) => {
      var _a25;
      return (_a25 = replacer == null ? void 0 : replacer(k, v)) == null ? void 0 : _a25.call(this);
    }, space);
  } catch (e) {
    result = stringifyStrictCircularAutoChunks(data, replacer, space);
  }
  if (result.length > MAX_SERIALIZED_SIZE) {
    const chunkCount = Math.ceil(result.length / MAX_SERIALIZED_SIZE);
    const chunks = [];
    for (let i = 0; i < chunkCount; i++)
      chunks.push(result.slice(i * MAX_SERIALIZED_SIZE, (i + 1) * MAX_SERIALIZED_SIZE));
    return chunks;
  }
  return result;
}
function stringifyStrictCircularAutoChunks(data, replacer = null, space = null) {
  const list = [];
  encode(data, replacer, list, /* @__PURE__ */ new Map());
  return space ? ` ${JSON.stringify(list, null, space)}` : ` ${JSON.stringify(list)}`;
}
function parseCircularAutoChunks(data, reviver2 = null) {
  if (Array.isArray(data))
    data = data.join("");
  const hasCircular = /^\s/.test(data);
  if (!hasCircular) {
    return arguments.length === 1 ? JSON.parse(data) : JSON.parse(data, reviver2);
  } else {
    const list = JSON.parse(data);
    decode(list, reviver2);
    return list[0];
  }
}

// src/shared/util.ts
function stringify2(data) {
  return stringifyCircularAutoChunks(data, stringifyReplacer);
}
function parse2(data, revive2 = false) {
  if (data == void 0)
    return {};
  return revive2 ? parseCircularAutoChunks(data, reviver) : parseCircularAutoChunks(data);
}

// src/index.ts
var devtools = {
  hook,
  init: () => {
    initDevTools();
  },
  get ctx() {
    return devtoolsContext;
  },
  get api() {
    return devtoolsContext.api;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DevToolsContextHookKeys,
  DevToolsMessagingHookKeys,
  DevToolsV6PluginAPIHookKeys,
  INFINITY,
  NAN,
  NEGATIVE_INFINITY,
  ROUTER_INFO_KEY,
  ROUTER_KEY,
  UNDEFINED,
  activeAppRecord,
  addCustomCommand,
  addCustomTab,
  addDevToolsAppRecord,
  addDevToolsPluginToBuffer,
  addInspector,
  callConnectedUpdatedHook,
  callDevToolsPluginSetupFn,
  callInspectorUpdatedHook,
  callStateUpdatedHook,
  createComponentsDevToolsPlugin,
  createDevToolsApi,
  createDevToolsCtxHooks,
  createRpcClient,
  createRpcProxy,
  createRpcServer,
  devtools,
  devtoolsAppRecords,
  devtoolsContext,
  devtoolsInspector,
  devtoolsPluginBuffer,
  devtoolsRouter,
  devtoolsRouterInfo,
  devtoolsState,
  escape,
  formatInspectorStateValue,
  getActiveInspectors,
  getDevToolsEnv,
  getExtensionClientContext,
  getInspector,
  getInspectorActions,
  getInspectorInfo,
  getInspectorNodeActions,
  getInspectorStateValueType,
  getRaw,
  getRpcClient,
  getRpcServer,
  getViteRpcClient,
  getViteRpcServer,
  initDevTools,
  isPlainObject,
  onDevToolsClientConnected,
  onDevToolsConnected,
  parse,
  registerDevToolsPlugin,
  removeCustomCommand,
  removeDevToolsAppRecord,
  removeRegisteredPluginApp,
  resetDevToolsState,
  setActiveAppRecord,
  setActiveAppRecordId,
  setDevToolsEnv,
  setElectronClientContext,
  setElectronProxyContext,
  setElectronServerContext,
  setExtensionClientContext,
  setIframeServerContext,
  setOpenInEditorBaseUrl,
  setRpcServerToGlobal,
  setViteClientContext,
  setViteRpcClientToGlobal,
  setViteRpcServerToGlobal,
  setViteServerContext,
  setupDevToolsPlugin,
  stringify,
  toEdit,
  toSubmit,
  toggleClientConnected,
  toggleComponentInspectorEnabled,
  toggleHighPerfMode,
  updateDevToolsClientDetected,
  updateDevToolsState,
  updateTimelineLayersState
});
