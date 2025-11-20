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

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ MyDocument)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_document__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/document */ \"./node_modules/next/document.js\");\n/* harmony import */ var next_document__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_document__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_2__);\n\n\n\nconst shouldInjectExtensionGuards = process.env.NEXT_PUBLIC_SUPPRESS_EXTENSION_ERRORS === \"true\";\nconst extensionGuardScript = `\n(function () {\n  try {\n    if (typeof window === 'undefined') return;\n\n    var shouldSilence = function (text) {\n      if (!text) return false;\n      try {\n        var normalized = text.toString().toLowerCase();\n        return normalized.includes('metamask') || normalized.includes('chrome-extension://') || normalized.includes('next.js (');\n      } catch (err) {\n        return false;\n      }\n    };\n\n    var silenceEvent = function (event, message) {\n      if (!shouldSilence(message)) return;\n      try {\n        event.preventDefault();\n        event.stopImmediatePropagation();\n      } catch (err) {}\n    };\n\n    window.addEventListener('error', function (event) {\n      var msg = event && event.message ? event.message : '';\n      var src = '';\n      if (event) {\n        if (event.filename) {\n          src = event.filename;\n        } else if (event.target && event.target.src) {\n          src = event.target.src;\n        }\n      }\n      silenceEvent(event, (msg || '') + ' ' + (src || ''));\n    }, true);\n\n    window.addEventListener('unhandledrejection', function (event) {\n      var reason = '';\n      if (event && event.reason) {\n        if (typeof event.reason === 'string') {\n          reason = event.reason;\n        } else if (event.reason.message) {\n          reason = event.reason.message;\n        } else if (event.reason.stack) {\n          reason = event.reason.stack;\n        } else if (event.reason.toString) {\n          reason = event.reason.toString();\n        }\n      }\n      silenceEvent(event, reason);\n    }, true);\n  } catch (err) {\n    console.warn('Extension guard script failed:', err);\n  }\n})();\n`;\nclass MyDocument extends (next_document__WEBPACK_IMPORTED_MODULE_1___default()) {\n    render() {\n        return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(next_document__WEBPACK_IMPORTED_MODULE_1__.Html, {\n            children: [\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(next_document__WEBPACK_IMPORTED_MODULE_1__.Head, {\n                    children: shouldInjectExtensionGuards && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"script\", {\n                        dangerouslySetInnerHTML: {\n                            __html: extensionGuardScript\n                        }\n                    }, void 0, false, {\n                        fileName: \"/root/app/code/pages/_document.tsx\",\n                        lineNumber: 69,\n                        columnNumber: 13\n                    }, this)\n                }, void 0, false, {\n                    fileName: \"/root/app/code/pages/_document.tsx\",\n                    lineNumber: 67,\n                    columnNumber: 9\n                }, this),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"body\", {\n                    children: [\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(next_document__WEBPACK_IMPORTED_MODULE_1__.Main, {}, void 0, false, {\n                            fileName: \"/root/app/code/pages/_document.tsx\",\n                            lineNumber: 73,\n                            columnNumber: 11\n                        }, this),\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(next_document__WEBPACK_IMPORTED_MODULE_1__.NextScript, {}, void 0, false, {\n                            fileName: \"/root/app/code/pages/_document.tsx\",\n                            lineNumber: 74,\n                            columnNumber: 11\n                        }, this)\n                    ]\n                }, void 0, true, {\n                    fileName: \"/root/app/code/pages/_document.tsx\",\n                    lineNumber: 72,\n                    columnNumber: 9\n                }, this)\n            ]\n        }, void 0, true, {\n            fileName: \"/root/app/code/pages/_document.tsx\",\n            lineNumber: 66,\n            columnNumber: 7\n        }, this);\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9fZG9jdW1lbnQudHN4IiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQXVFO0FBQzdDO0FBRTFCLE1BQU1NLDhCQUE4QkMsUUFBUUMsR0FBRyxDQUFDQyxxQ0FBcUMsS0FBSztBQUUxRixNQUFNQyx1QkFBdUIsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXVEOUIsQ0FBQztBQUVjLE1BQU1DLG1CQUFtQlgsc0RBQVFBO0lBQzlDWSxTQUFTO1FBQ1AscUJBQ0UsOERBQUNYLCtDQUFJQTs7OEJBQ0gsOERBQUNDLCtDQUFJQTs4QkFDRkksNkNBQ0MsOERBQUNPO3dCQUFPQyx5QkFBeUI7NEJBQUVDLFFBQVFMO3dCQUFxQjs7Ozs7Ozs7Ozs7OEJBR3BFLDhEQUFDTTs7c0NBQ0MsOERBQUNiLCtDQUFJQTs7Ozs7c0NBQ0wsOERBQUNDLHFEQUFVQTs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFJbkI7QUFDRiIsInNvdXJjZXMiOlsid2VicGFjazovL21hc3RlcnN0cmVhbS1sZWFybmluZy1wbGF0Zm9ybS8uL3BhZ2VzL19kb2N1bWVudC50c3g/ZDM3ZCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRG9jdW1lbnQsIHsgSHRtbCwgSGVhZCwgTWFpbiwgTmV4dFNjcmlwdCB9IGZyb20gJ25leHQvZG9jdW1lbnQnO1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuY29uc3Qgc2hvdWxkSW5qZWN0RXh0ZW5zaW9uR3VhcmRzID0gcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU1VQUFJFU1NfRVhURU5TSU9OX0VSUk9SUyA9PT0gJ3RydWUnO1xuXG5jb25zdCBleHRlbnNpb25HdWFyZFNjcmlwdCA9IGBcbihmdW5jdGlvbiAoKSB7XG4gIHRyeSB7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSByZXR1cm47XG5cbiAgICB2YXIgc2hvdWxkU2lsZW5jZSA9IGZ1bmN0aW9uICh0ZXh0KSB7XG4gICAgICBpZiAoIXRleHQpIHJldHVybiBmYWxzZTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHZhciBub3JtYWxpemVkID0gdGV4dC50b1N0cmluZygpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIHJldHVybiBub3JtYWxpemVkLmluY2x1ZGVzKCdtZXRhbWFzaycpIHx8IG5vcm1hbGl6ZWQuaW5jbHVkZXMoJ2Nocm9tZS1leHRlbnNpb246Ly8nKSB8fCBub3JtYWxpemVkLmluY2x1ZGVzKCduZXh0LmpzICgnKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciBzaWxlbmNlRXZlbnQgPSBmdW5jdGlvbiAoZXZlbnQsIG1lc3NhZ2UpIHtcbiAgICAgIGlmICghc2hvdWxkU2lsZW5jZShtZXNzYWdlKSkgcmV0dXJuO1xuICAgICAgdHJ5IHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICB9IGNhdGNoIChlcnIpIHt9XG4gICAgfTtcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgdmFyIG1zZyA9IGV2ZW50ICYmIGV2ZW50Lm1lc3NhZ2UgPyBldmVudC5tZXNzYWdlIDogJyc7XG4gICAgICB2YXIgc3JjID0gJyc7XG4gICAgICBpZiAoZXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50LmZpbGVuYW1lKSB7XG4gICAgICAgICAgc3JjID0gZXZlbnQuZmlsZW5hbWU7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQudGFyZ2V0ICYmIGV2ZW50LnRhcmdldC5zcmMpIHtcbiAgICAgICAgICBzcmMgPSBldmVudC50YXJnZXQuc3JjO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBzaWxlbmNlRXZlbnQoZXZlbnQsIChtc2cgfHwgJycpICsgJyAnICsgKHNyYyB8fCAnJykpO1xuICAgIH0sIHRydWUpO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3VuaGFuZGxlZHJlamVjdGlvbicsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgdmFyIHJlYXNvbiA9ICcnO1xuICAgICAgaWYgKGV2ZW50ICYmIGV2ZW50LnJlYXNvbikge1xuICAgICAgICBpZiAodHlwZW9mIGV2ZW50LnJlYXNvbiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICByZWFzb24gPSBldmVudC5yZWFzb247XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQucmVhc29uLm1lc3NhZ2UpIHtcbiAgICAgICAgICByZWFzb24gPSBldmVudC5yZWFzb24ubWVzc2FnZTtcbiAgICAgICAgfSBlbHNlIGlmIChldmVudC5yZWFzb24uc3RhY2spIHtcbiAgICAgICAgICByZWFzb24gPSBldmVudC5yZWFzb24uc3RhY2s7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQucmVhc29uLnRvU3RyaW5nKSB7XG4gICAgICAgICAgcmVhc29uID0gZXZlbnQucmVhc29uLnRvU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHNpbGVuY2VFdmVudChldmVudCwgcmVhc29uKTtcbiAgICB9LCB0cnVlKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgY29uc29sZS53YXJuKCdFeHRlbnNpb24gZ3VhcmQgc2NyaXB0IGZhaWxlZDonLCBlcnIpO1xuICB9XG59KSgpO1xuYDtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTXlEb2N1bWVudCBleHRlbmRzIERvY3VtZW50IHtcbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8SHRtbD5cbiAgICAgICAgPEhlYWQ+XG4gICAgICAgICAge3Nob3VsZEluamVjdEV4dGVuc2lvbkd1YXJkcyAmJiAoXG4gICAgICAgICAgICA8c2NyaXB0IGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7IF9faHRtbDogZXh0ZW5zaW9uR3VhcmRTY3JpcHQgfX0gLz5cbiAgICAgICAgICApfVxuICAgICAgICA8L0hlYWQ+XG4gICAgICAgIDxib2R5PlxuICAgICAgICAgIDxNYWluIC8+XG4gICAgICAgICAgPE5leHRTY3JpcHQgLz5cbiAgICAgICAgPC9ib2R5PlxuICAgICAgPC9IdG1sPlxuICAgICk7XG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJEb2N1bWVudCIsIkh0bWwiLCJIZWFkIiwiTWFpbiIsIk5leHRTY3JpcHQiLCJSZWFjdCIsInNob3VsZEluamVjdEV4dGVuc2lvbkd1YXJkcyIsInByb2Nlc3MiLCJlbnYiLCJORVhUX1BVQkxJQ19TVVBQUkVTU19FWFRFTlNJT05fRVJST1JTIiwiZXh0ZW5zaW9uR3VhcmRTY3JpcHQiLCJNeURvY3VtZW50IiwicmVuZGVyIiwic2NyaXB0IiwiZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUwiLCJfX2h0bWwiLCJib2R5Il0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./pages/_document.tsx\n");

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