import Document, { Html, Head, Main, NextScript } from 'next/document';
import React from 'react';

const shouldInjectExtensionGuards = process.env.NEXT_PUBLIC_SUPPRESS_EXTENSION_ERRORS === 'true';

const extensionGuardScript = `
(function () {
  try {
    if (typeof window === 'undefined') return;

    var shouldSilence = function (text) {
      if (!text) return false;
      try {
        var normalized = text.toString().toLowerCase();
        return normalized.includes('metamask') || normalized.includes('chrome-extension://') || normalized.includes('next.js (');
      } catch (err) {
        return false;
      }
    };

    var silenceEvent = function (event, message) {
      if (!shouldSilence(message)) return;
      try {
        event.preventDefault();
        event.stopImmediatePropagation();
      } catch (err) {}
    };

    window.addEventListener('error', function (event) {
      var msg = event && event.message ? event.message : '';
      var src = '';
      if (event) {
        if (event.filename) {
          src = event.filename;
        } else if (event.target && event.target.src) {
          src = event.target.src;
        }
      }
      silenceEvent(event, (msg || '') + ' ' + (src || ''));
    }, true);

    window.addEventListener('unhandledrejection', function (event) {
      var reason = '';
      if (event && event.reason) {
        if (typeof event.reason === 'string') {
          reason = event.reason;
        } else if (event.reason.message) {
          reason = event.reason.message;
        } else if (event.reason.stack) {
          reason = event.reason.stack;
        } else if (event.reason.toString) {
          reason = event.reason.toString();
        }
      }
      silenceEvent(event, reason);
    }, true);
  } catch (err) {
    console.warn('Extension guard script failed:', err);
  }
})();
`;

export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          {shouldInjectExtensionGuards && (
            <script dangerouslySetInnerHTML={{ __html: extensionGuardScript }} />
          )}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
