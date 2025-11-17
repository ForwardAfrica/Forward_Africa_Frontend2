"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_document";
exports.ids = ["pages/_document"];
exports.modules = {

/***/ "./pages/_document.tsx":
/*!*****************************!*\
  !*** ./pages/_document.tsx ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ MyDocument)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_document__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/document */ \"./node_modules/next/document.js\");\n/* harmony import */ var next_document__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_document__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_2__);\n\n\n\nconst shouldInjectExtensionGuards = process.env.NEXT_PUBLIC_SUPPRESS_EXTENSION_ERRORS === \"true\";\nconst extensionGuardScript = `\r\n(function () {\r\n  try {\r\n    if (typeof window === 'undefined') return;\r\n\r\n    var shouldSilence = function (text) {\r\n      if (!text) return false;\r\n      try {\r\n        var normalized = text.toString().toLowerCase();\r\n        return normalized.includes('metamask') || normalized.includes('chrome-extension://') || normalized.includes('next.js (');\r\n      } catch (err) {\r\n        return false;\r\n      }\r\n    };\r\n\r\n    var silenceEvent = function (event, message) {\r\n      if (!shouldSilence(message)) return;\r\n      try {\r\n        event.preventDefault();\r\n        event.stopImmediatePropagation();\r\n      } catch (err) {}\r\n    };\r\n\r\n    window.addEventListener('error', function (event) {\r\n      var msg = event && event.message ? event.message : '';\r\n      var src = '';\r\n      if (event) {\r\n        if (event.filename) {\r\n          src = event.filename;\r\n        } else if (event.target && event.target.src) {\r\n          src = event.target.src;\r\n        }\r\n      }\r\n      silenceEvent(event, (msg || '') + ' ' + (src || ''));\r\n    }, true);\r\n\r\n    window.addEventListener('unhandledrejection', function (event) {\r\n      var reason = '';\r\n      if (event && event.reason) {\r\n        if (typeof event.reason === 'string') {\r\n          reason = event.reason;\r\n        } else if (event.reason.message) {\r\n          reason = event.reason.message;\r\n        } else if (event.reason.stack) {\r\n          reason = event.reason.stack;\r\n        } else if (event.reason.toString) {\r\n          reason = event.reason.toString();\r\n        }\r\n      }\r\n      silenceEvent(event, reason);\r\n    }, true);\r\n  } catch (err) {\r\n    console.warn('Extension guard script failed:', err);\r\n  }\r\n})();\r\n`;\nclass MyDocument extends (next_document__WEBPACK_IMPORTED_MODULE_1___default()) {\n    render() {\n        return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(next_document__WEBPACK_IMPORTED_MODULE_1__.Html, {\n            children: [\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(next_document__WEBPACK_IMPORTED_MODULE_1__.Head, {\n                    children: shouldInjectExtensionGuards && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"script\", {\n                        dangerouslySetInnerHTML: {\n                            __html: extensionGuardScript\n                        }\n                    }, void 0, false, {\n                        fileName: \"A:\\\\Forward_Africa_Frontend2\\\\pages\\\\_document.tsx\",\n                        lineNumber: 69,\n                        columnNumber: 13\n                    }, this)\n                }, void 0, false, {\n                    fileName: \"A:\\\\Forward_Africa_Frontend2\\\\pages\\\\_document.tsx\",\n                    lineNumber: 67,\n                    columnNumber: 9\n                }, this),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"body\", {\n                    children: [\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(next_document__WEBPACK_IMPORTED_MODULE_1__.Main, {}, void 0, false, {\n                            fileName: \"A:\\\\Forward_Africa_Frontend2\\\\pages\\\\_document.tsx\",\n                            lineNumber: 73,\n                            columnNumber: 11\n                        }, this),\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(next_document__WEBPACK_IMPORTED_MODULE_1__.NextScript, {}, void 0, false, {\n                            fileName: \"A:\\\\Forward_Africa_Frontend2\\\\pages\\\\_document.tsx\",\n                            lineNumber: 74,\n                            columnNumber: 11\n                        }, this)\n                    ]\n                }, void 0, true, {\n                    fileName: \"A:\\\\Forward_Africa_Frontend2\\\\pages\\\\_document.tsx\",\n                    lineNumber: 72,\n                    columnNumber: 9\n                }, this)\n            ]\n        }, void 0, true, {\n            fileName: \"A:\\\\Forward_Africa_Frontend2\\\\pages\\\\_document.tsx\",\n            lineNumber: 66,\n            columnNumber: 7\n        }, this);\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9fZG9jdW1lbnQudHN4IiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQXVFO0FBQzdDO0FBRTFCLE1BQU1NLDhCQUE4QkMsUUFBUUMsR0FBRyxDQUFDQyxxQ0FBcUMsS0FBSztBQUUxRixNQUFNQyx1QkFBdUIsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXVEOUIsQ0FBQztBQUVjLE1BQU1DLG1CQUFtQlgsc0RBQVFBO0lBQzlDWSxTQUFTO1FBQ1AscUJBQ0UsOERBQUNYLCtDQUFJQTs7OEJBQ0gsOERBQUNDLCtDQUFJQTs4QkFDRkksNkNBQ0MsOERBQUNPO3dCQUFPQyx5QkFBeUI7NEJBQUVDLFFBQVFMO3dCQUFxQjs7Ozs7Ozs7Ozs7OEJBR3BFLDhEQUFDTTs7c0NBQ0MsOERBQUNiLCtDQUFJQTs7Ozs7c0NBQ0wsOERBQUNDLHFEQUFVQTs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFJbkI7QUFDRiIsInNvdXJjZXMiOlsid2VicGFjazovL21hc3RlcnN0cmVhbS1sZWFybmluZy1wbGF0Zm9ybS8uL3BhZ2VzL19kb2N1bWVudC50c3g/ZDM3ZCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRG9jdW1lbnQsIHsgSHRtbCwgSGVhZCwgTWFpbiwgTmV4dFNjcmlwdCB9IGZyb20gJ25leHQvZG9jdW1lbnQnO1xyXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xyXG5cclxuY29uc3Qgc2hvdWxkSW5qZWN0RXh0ZW5zaW9uR3VhcmRzID0gcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU1VQUFJFU1NfRVhURU5TSU9OX0VSUk9SUyA9PT0gJ3RydWUnO1xyXG5cclxuY29uc3QgZXh0ZW5zaW9uR3VhcmRTY3JpcHQgPSBgXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgdHJ5IHtcclxuICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykgcmV0dXJuO1xyXG5cclxuICAgIHZhciBzaG91bGRTaWxlbmNlID0gZnVuY3Rpb24gKHRleHQpIHtcclxuICAgICAgaWYgKCF0ZXh0KSByZXR1cm4gZmFsc2U7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgdmFyIG5vcm1hbGl6ZWQgPSB0ZXh0LnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICByZXR1cm4gbm9ybWFsaXplZC5pbmNsdWRlcygnbWV0YW1hc2snKSB8fCBub3JtYWxpemVkLmluY2x1ZGVzKCdjaHJvbWUtZXh0ZW5zaW9uOi8vJykgfHwgbm9ybWFsaXplZC5pbmNsdWRlcygnbmV4dC5qcyAoJyk7XHJcbiAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICB2YXIgc2lsZW5jZUV2ZW50ID0gZnVuY3Rpb24gKGV2ZW50LCBtZXNzYWdlKSB7XHJcbiAgICAgIGlmICghc2hvdWxkU2lsZW5jZShtZXNzYWdlKSkgcmV0dXJuO1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XHJcbiAgICAgIH0gY2F0Y2ggKGVycikge31cclxuICAgIH07XHJcblxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgIHZhciBtc2cgPSBldmVudCAmJiBldmVudC5tZXNzYWdlID8gZXZlbnQubWVzc2FnZSA6ICcnO1xyXG4gICAgICB2YXIgc3JjID0gJyc7XHJcbiAgICAgIGlmIChldmVudCkge1xyXG4gICAgICAgIGlmIChldmVudC5maWxlbmFtZSkge1xyXG4gICAgICAgICAgc3JjID0gZXZlbnQuZmlsZW5hbWU7XHJcbiAgICAgICAgfSBlbHNlIGlmIChldmVudC50YXJnZXQgJiYgZXZlbnQudGFyZ2V0LnNyYykge1xyXG4gICAgICAgICAgc3JjID0gZXZlbnQudGFyZ2V0LnNyYztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgc2lsZW5jZUV2ZW50KGV2ZW50LCAobXNnIHx8ICcnKSArICcgJyArIChzcmMgfHwgJycpKTtcclxuICAgIH0sIHRydWUpO1xyXG5cclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd1bmhhbmRsZWRyZWplY3Rpb24nLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgdmFyIHJlYXNvbiA9ICcnO1xyXG4gICAgICBpZiAoZXZlbnQgJiYgZXZlbnQucmVhc29uKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBldmVudC5yZWFzb24gPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICByZWFzb24gPSBldmVudC5yZWFzb247XHJcbiAgICAgICAgfSBlbHNlIGlmIChldmVudC5yZWFzb24ubWVzc2FnZSkge1xyXG4gICAgICAgICAgcmVhc29uID0gZXZlbnQucmVhc29uLm1lc3NhZ2U7XHJcbiAgICAgICAgfSBlbHNlIGlmIChldmVudC5yZWFzb24uc3RhY2spIHtcclxuICAgICAgICAgIHJlYXNvbiA9IGV2ZW50LnJlYXNvbi5zdGFjaztcclxuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LnJlYXNvbi50b1N0cmluZykge1xyXG4gICAgICAgICAgcmVhc29uID0gZXZlbnQucmVhc29uLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHNpbGVuY2VFdmVudChldmVudCwgcmVhc29uKTtcclxuICAgIH0sIHRydWUpO1xyXG4gIH0gY2F0Y2ggKGVycikge1xyXG4gICAgY29uc29sZS53YXJuKCdFeHRlbnNpb24gZ3VhcmQgc2NyaXB0IGZhaWxlZDonLCBlcnIpO1xyXG4gIH1cclxufSkoKTtcclxuYDtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE15RG9jdW1lbnQgZXh0ZW5kcyBEb2N1bWVudCB7XHJcbiAgcmVuZGVyKCkge1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgPEh0bWw+XHJcbiAgICAgICAgPEhlYWQ+XHJcbiAgICAgICAgICB7c2hvdWxkSW5qZWN0RXh0ZW5zaW9uR3VhcmRzICYmIChcclxuICAgICAgICAgICAgPHNjcmlwdCBkYW5nZXJvdXNseVNldElubmVySFRNTD17eyBfX2h0bWw6IGV4dGVuc2lvbkd1YXJkU2NyaXB0IH19IC8+XHJcbiAgICAgICAgICApfVxyXG4gICAgICAgIDwvSGVhZD5cclxuICAgICAgICA8Ym9keT5cclxuICAgICAgICAgIDxNYWluIC8+XHJcbiAgICAgICAgICA8TmV4dFNjcmlwdCAvPlxyXG4gICAgICAgIDwvYm9keT5cclxuICAgICAgPC9IdG1sPlxyXG4gICAgKTtcclxuICB9XHJcbn1cclxuIl0sIm5hbWVzIjpbIkRvY3VtZW50IiwiSHRtbCIsIkhlYWQiLCJNYWluIiwiTmV4dFNjcmlwdCIsIlJlYWN0Iiwic2hvdWxkSW5qZWN0RXh0ZW5zaW9uR3VhcmRzIiwicHJvY2VzcyIsImVudiIsIk5FWFRfUFVCTElDX1NVUFBSRVNTX0VYVEVOU0lPTl9FUlJPUlMiLCJleHRlbnNpb25HdWFyZFNjcmlwdCIsIk15RG9jdW1lbnQiLCJyZW5kZXIiLCJzY3JpcHQiLCJkYW5nZXJvdXNseVNldElubmVySFRNTCIsIl9faHRtbCIsImJvZHkiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./pages/_document.tsx\n");

/***/ }),

/***/ "next/dist/compiled/next-server/pages.runtime.dev.js":
/*!**********************************************************************!*\
  !*** external "next/dist/compiled/next-server/pages.runtime.dev.js" ***!
  \**********************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/pages.runtime.dev.js");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

module.exports = require("react");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

module.exports = require("react/jsx-dev-runtime");

/***/ }),

/***/ "react/jsx-runtime":
/*!************************************!*\
  !*** external "react/jsx-runtime" ***!
  \************************************/
/***/ ((module) => {

module.exports = require("react/jsx-runtime");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@swc"], () => (__webpack_exec__("./pages/_document.tsx")));
module.exports = __webpack_exports__;

})();