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

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ MyDocument)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_document__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/document */ \"./node_modules/next/document.js\");\n/* harmony import */ var next_document__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_document__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_2__);\n\n\n\nclass MyDocument extends (next_document__WEBPACK_IMPORTED_MODULE_1___default()) {\n    render() {\n        const inlineScript = `(function(){\n  try{\n    // Try to neutralize injected providers to avoid extension auto-connect attempts\n    try{ if (window.ethereum) { try{ window.ethereum.request = function(){}; }catch(e){} } }catch(e){}\n    try{ delete window.ethereum; }catch(e){ try{ window.ethereum = undefined; }catch(e){} }\n    try{ delete window.web3; }catch(e){ try{ window.web3 = undefined; }catch(e){} }\n  }catch(e){}\n\n  // Suppress noisy extension and devtool errors from surfacing to the overlay\n  function shouldSuppressMessage(msg, src, stack){\n    try{\n      msg = (msg || '').toString();\n      src = (src || '').toString();\n      stack = (stack || '').toString();\n      if(!msg && !src && !stack) return false;\n      const lower = msg.toLowerCase();\n      if(lower.includes('metamask') || lower.includes('failed to connect to metamask')) return true;\n      if(src.indexOf('chrome-extension://') === 0) return true;\n      if(stack.indexOf('chrome-extension://') !== -1) return true;\n      if(msg.includes('Next.js (') && msg.toLowerCase().includes('outdated')) return true;\n    }catch(e){}\n    return false;\n  }\n\n  var onUnhandledRejection = function(ev){\n    try{\n      var reason = ev && ev.reason ? (ev.reason.message || ev.reason.toString ? ev.reason.toString() : '') : '';\n      var stack = ev && ev.reason && ev.reason.stack ? ev.reason.stack : '';\n      if(shouldSuppressMessage(reason, '', stack)){\n        try{ ev.preventDefault(); }catch(e){}\n        console.warn('Suppressed unhandledrejection from extension/devtools:', reason || stack);\n      }\n    }catch(e){}\n  };\n\n  var onError = function(ev){\n    try{\n      var msg = ev && ev.message ? ev.message : '';\n      var src = ev && (ev.filename || ev.filename === 0 ? ev.filename : ev.target && ev.target.src ? ev.target.src : '');\n      var stack = ev && ev.error && ev.error.stack ? ev.error.stack : '';\n      if(shouldSuppressMessage(msg, src, stack)){\n        try{ ev.preventDefault(); }catch(e){}\n        console.warn('Suppressed window error from extension/devtools:', msg || src || stack);\n      }\n    }catch(e){}\n  };\n\n  try{\n    window.addEventListener('unhandledrejection', onUnhandledRejection, true);\n    window.addEventListener('error', onError, true);\n    // Override window.onerror as a last resort\n    window.onerror = function(message, source, lineno, colno, error){\n      try{\n        if(shouldSuppressMessage(message, source, error && error.stack ? error.stack : '')){\n          console.warn('Suppressed window.onerror:', message || source);\n          return true; // prevent default handling\n        }\n      }catch(e){}\n      return false;\n    };\n  }catch(e){}\n})();`;\n        return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(next_document__WEBPACK_IMPORTED_MODULE_1__.Html, {\n            children: [\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(next_document__WEBPACK_IMPORTED_MODULE_1__.Head, {\n                    children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"script\", {\n                        dangerouslySetInnerHTML: {\n                            __html: inlineScript\n                        }\n                    }, void 0, false, {\n                        fileName: \"/root/app/code/pages/_document.tsx\",\n                        lineNumber: 72,\n                        columnNumber: 11\n                    }, this)\n                }, void 0, false, {\n                    fileName: \"/root/app/code/pages/_document.tsx\",\n                    lineNumber: 71,\n                    columnNumber: 9\n                }, this),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"body\", {\n                    children: [\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(next_document__WEBPACK_IMPORTED_MODULE_1__.Main, {}, void 0, false, {\n                            fileName: \"/root/app/code/pages/_document.tsx\",\n                            lineNumber: 75,\n                            columnNumber: 11\n                        }, this),\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(next_document__WEBPACK_IMPORTED_MODULE_1__.NextScript, {}, void 0, false, {\n                            fileName: \"/root/app/code/pages/_document.tsx\",\n                            lineNumber: 76,\n                            columnNumber: 11\n                        }, this)\n                    ]\n                }, void 0, true, {\n                    fileName: \"/root/app/code/pages/_document.tsx\",\n                    lineNumber: 74,\n                    columnNumber: 9\n                }, this)\n            ]\n        }, void 0, true, {\n            fileName: \"/root/app/code/pages/_document.tsx\",\n            lineNumber: 70,\n            columnNumber: 7\n        }, this);\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9fZG9jdW1lbnQudHN4IiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQXVFO0FBQzdDO0FBRVgsTUFBTU0sbUJBQW1CTixzREFBUUE7SUFDOUNPLFNBQVM7UUFDUCxNQUFNQyxlQUFlLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7S0E2RHJCLENBQUM7UUFFRixxQkFDRSw4REFBQ1AsK0NBQUlBOzs4QkFDSCw4REFBQ0MsK0NBQUlBOzhCQUNILDRFQUFDTzt3QkFBT0MseUJBQXlCOzRCQUFFQyxRQUFRSDt3QkFBYTs7Ozs7Ozs7Ozs7OEJBRTFELDhEQUFDSTs7c0NBQ0MsOERBQUNULCtDQUFJQTs7Ozs7c0NBQ0wsOERBQUNDLHFEQUFVQTs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFJbkI7QUFDRiIsInNvdXJjZXMiOlsid2VicGFjazovL21hc3RlcnN0cmVhbS1sZWFybmluZy1wbGF0Zm9ybS8uL3BhZ2VzL19kb2N1bWVudC50c3g/ZDM3ZCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRG9jdW1lbnQsIHsgSHRtbCwgSGVhZCwgTWFpbiwgTmV4dFNjcmlwdCB9IGZyb20gJ25leHQvZG9jdW1lbnQnO1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTXlEb2N1bWVudCBleHRlbmRzIERvY3VtZW50IHtcbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IGlubGluZVNjcmlwdCA9IGAoZnVuY3Rpb24oKXtcbiAgdHJ5e1xuICAgIC8vIFRyeSB0byBuZXV0cmFsaXplIGluamVjdGVkIHByb3ZpZGVycyB0byBhdm9pZCBleHRlbnNpb24gYXV0by1jb25uZWN0IGF0dGVtcHRzXG4gICAgdHJ5eyBpZiAod2luZG93LmV0aGVyZXVtKSB7IHRyeXsgd2luZG93LmV0aGVyZXVtLnJlcXVlc3QgPSBmdW5jdGlvbigpe307IH1jYXRjaChlKXt9IH0gfWNhdGNoKGUpe31cbiAgICB0cnl7IGRlbGV0ZSB3aW5kb3cuZXRoZXJldW07IH1jYXRjaChlKXsgdHJ5eyB3aW5kb3cuZXRoZXJldW0gPSB1bmRlZmluZWQ7IH1jYXRjaChlKXt9IH1cbiAgICB0cnl7IGRlbGV0ZSB3aW5kb3cud2ViMzsgfWNhdGNoKGUpeyB0cnl7IHdpbmRvdy53ZWIzID0gdW5kZWZpbmVkOyB9Y2F0Y2goZSl7fSB9XG4gIH1jYXRjaChlKXt9XG5cbiAgLy8gU3VwcHJlc3Mgbm9pc3kgZXh0ZW5zaW9uIGFuZCBkZXZ0b29sIGVycm9ycyBmcm9tIHN1cmZhY2luZyB0byB0aGUgb3ZlcmxheVxuICBmdW5jdGlvbiBzaG91bGRTdXBwcmVzc01lc3NhZ2UobXNnLCBzcmMsIHN0YWNrKXtcbiAgICB0cnl7XG4gICAgICBtc2cgPSAobXNnIHx8ICcnKS50b1N0cmluZygpO1xuICAgICAgc3JjID0gKHNyYyB8fCAnJykudG9TdHJpbmcoKTtcbiAgICAgIHN0YWNrID0gKHN0YWNrIHx8ICcnKS50b1N0cmluZygpO1xuICAgICAgaWYoIW1zZyAmJiAhc3JjICYmICFzdGFjaykgcmV0dXJuIGZhbHNlO1xuICAgICAgY29uc3QgbG93ZXIgPSBtc2cudG9Mb3dlckNhc2UoKTtcbiAgICAgIGlmKGxvd2VyLmluY2x1ZGVzKCdtZXRhbWFzaycpIHx8IGxvd2VyLmluY2x1ZGVzKCdmYWlsZWQgdG8gY29ubmVjdCB0byBtZXRhbWFzaycpKSByZXR1cm4gdHJ1ZTtcbiAgICAgIGlmKHNyYy5pbmRleE9mKCdjaHJvbWUtZXh0ZW5zaW9uOi8vJykgPT09IDApIHJldHVybiB0cnVlO1xuICAgICAgaWYoc3RhY2suaW5kZXhPZignY2hyb21lLWV4dGVuc2lvbjovLycpICE9PSAtMSkgcmV0dXJuIHRydWU7XG4gICAgICBpZihtc2cuaW5jbHVkZXMoJ05leHQuanMgKCcpICYmIG1zZy50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKCdvdXRkYXRlZCcpKSByZXR1cm4gdHJ1ZTtcbiAgICB9Y2F0Y2goZSl7fVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBvblVuaGFuZGxlZFJlamVjdGlvbiA9IGZ1bmN0aW9uKGV2KXtcbiAgICB0cnl7XG4gICAgICB2YXIgcmVhc29uID0gZXYgJiYgZXYucmVhc29uID8gKGV2LnJlYXNvbi5tZXNzYWdlIHx8IGV2LnJlYXNvbi50b1N0cmluZyA/IGV2LnJlYXNvbi50b1N0cmluZygpIDogJycpIDogJyc7XG4gICAgICB2YXIgc3RhY2sgPSBldiAmJiBldi5yZWFzb24gJiYgZXYucmVhc29uLnN0YWNrID8gZXYucmVhc29uLnN0YWNrIDogJyc7XG4gICAgICBpZihzaG91bGRTdXBwcmVzc01lc3NhZ2UocmVhc29uLCAnJywgc3RhY2spKXtcbiAgICAgICAgdHJ5eyBldi5wcmV2ZW50RGVmYXVsdCgpOyB9Y2F0Y2goZSl7fVxuICAgICAgICBjb25zb2xlLndhcm4oJ1N1cHByZXNzZWQgdW5oYW5kbGVkcmVqZWN0aW9uIGZyb20gZXh0ZW5zaW9uL2RldnRvb2xzOicsIHJlYXNvbiB8fCBzdGFjayk7XG4gICAgICB9XG4gICAgfWNhdGNoKGUpe31cbiAgfTtcblxuICB2YXIgb25FcnJvciA9IGZ1bmN0aW9uKGV2KXtcbiAgICB0cnl7XG4gICAgICB2YXIgbXNnID0gZXYgJiYgZXYubWVzc2FnZSA/IGV2Lm1lc3NhZ2UgOiAnJztcbiAgICAgIHZhciBzcmMgPSBldiAmJiAoZXYuZmlsZW5hbWUgfHwgZXYuZmlsZW5hbWUgPT09IDAgPyBldi5maWxlbmFtZSA6IGV2LnRhcmdldCAmJiBldi50YXJnZXQuc3JjID8gZXYudGFyZ2V0LnNyYyA6ICcnKTtcbiAgICAgIHZhciBzdGFjayA9IGV2ICYmIGV2LmVycm9yICYmIGV2LmVycm9yLnN0YWNrID8gZXYuZXJyb3Iuc3RhY2sgOiAnJztcbiAgICAgIGlmKHNob3VsZFN1cHByZXNzTWVzc2FnZShtc2csIHNyYywgc3RhY2spKXtcbiAgICAgICAgdHJ5eyBldi5wcmV2ZW50RGVmYXVsdCgpOyB9Y2F0Y2goZSl7fVxuICAgICAgICBjb25zb2xlLndhcm4oJ1N1cHByZXNzZWQgd2luZG93IGVycm9yIGZyb20gZXh0ZW5zaW9uL2RldnRvb2xzOicsIG1zZyB8fCBzcmMgfHwgc3RhY2spO1xuICAgICAgfVxuICAgIH1jYXRjaChlKXt9XG4gIH07XG5cbiAgdHJ5e1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd1bmhhbmRsZWRyZWplY3Rpb24nLCBvblVuaGFuZGxlZFJlamVjdGlvbiwgdHJ1ZSk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgb25FcnJvciwgdHJ1ZSk7XG4gICAgLy8gT3ZlcnJpZGUgd2luZG93Lm9uZXJyb3IgYXMgYSBsYXN0IHJlc29ydFxuICAgIHdpbmRvdy5vbmVycm9yID0gZnVuY3Rpb24obWVzc2FnZSwgc291cmNlLCBsaW5lbm8sIGNvbG5vLCBlcnJvcil7XG4gICAgICB0cnl7XG4gICAgICAgIGlmKHNob3VsZFN1cHByZXNzTWVzc2FnZShtZXNzYWdlLCBzb3VyY2UsIGVycm9yICYmIGVycm9yLnN0YWNrID8gZXJyb3Iuc3RhY2sgOiAnJykpe1xuICAgICAgICAgIGNvbnNvbGUud2FybignU3VwcHJlc3NlZCB3aW5kb3cub25lcnJvcjonLCBtZXNzYWdlIHx8IHNvdXJjZSk7XG4gICAgICAgICAgcmV0dXJuIHRydWU7IC8vIHByZXZlbnQgZGVmYXVsdCBoYW5kbGluZ1xuICAgICAgICB9XG4gICAgICB9Y2F0Y2goZSl7fVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG4gIH1jYXRjaChlKXt9XG59KSgpO2A7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPEh0bWw+XG4gICAgICAgIDxIZWFkPlxuICAgICAgICAgIDxzY3JpcHQgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3sgX19odG1sOiBpbmxpbmVTY3JpcHQgfX0gLz5cbiAgICAgICAgPC9IZWFkPlxuICAgICAgICA8Ym9keT5cbiAgICAgICAgICA8TWFpbiAvPlxuICAgICAgICAgIDxOZXh0U2NyaXB0IC8+XG4gICAgICAgIDwvYm9keT5cbiAgICAgIDwvSHRtbD5cbiAgICApO1xuICB9XG59XG4iXSwibmFtZXMiOlsiRG9jdW1lbnQiLCJIdG1sIiwiSGVhZCIsIk1haW4iLCJOZXh0U2NyaXB0IiwiUmVhY3QiLCJNeURvY3VtZW50IiwicmVuZGVyIiwiaW5saW5lU2NyaXB0Iiwic2NyaXB0IiwiZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUwiLCJfX2h0bWwiLCJib2R5Il0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./pages/_document.tsx\n");

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