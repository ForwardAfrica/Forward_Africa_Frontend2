import Document, { Html, Head, Main, NextScript } from 'next/document';
import React from 'react';

export default class MyDocument extends Document {
  render() {
    const inlineScript = `(function(){
  try{
    // Try to neutralize injected providers to avoid extension auto-connect attempts
    try{ if (window.ethereum) { try{ window.ethereum.request = function(){}; }catch(e){} } }catch(e){}
    try{ delete window.ethereum; }catch(e){ try{ window.ethereum = undefined; }catch(e){} }
    try{ delete window.web3; }catch(e){ try{ window.web3 = undefined; }catch(e){} }
  }catch(e){}

  // Suppress noisy extension and devtool errors from surfacing to the overlay
  function shouldSuppressMessage(msg, src, stack){
    try{
      msg = (msg || '').toString();
      src = (src || '').toString();
      stack = (stack || '').toString();
      if(!msg && !src && !stack) return false;
      const lower = msg.toLowerCase();
      if(lower.includes('metamask') || lower.includes('failed to connect to metamask')) return true;
      if(src.indexOf('chrome-extension://') === 0) return true;
      if(stack.indexOf('chrome-extension://') !== -1) return true;
      if(msg.includes('Next.js (') && msg.toLowerCase().includes('outdated')) return true;
    }catch(e){}
    return false;
  }

  var onUnhandledRejection = function(ev){
    try{
      var reason = ev && ev.reason ? (ev.reason.message || ev.reason.toString ? ev.reason.toString() : '') : '';
      var stack = ev && ev.reason && ev.reason.stack ? ev.reason.stack : '';
      if(shouldSuppressMessage(reason, '', stack)){
        try{ ev.preventDefault(); }catch(e){}
        console.warn('Suppressed unhandledrejection from extension/devtools:', reason || stack);
      }
    }catch(e){}
  };

  var onError = function(ev){
    try{
      var msg = ev && ev.message ? ev.message : '';
      var src = ev && (ev.filename || ev.filename === 0 ? ev.filename : ev.target && ev.target.src ? ev.target.src : '');
      var stack = ev && ev.error && ev.error.stack ? ev.error.stack : '';
      if(shouldSuppressMessage(msg, src, stack)){
        try{ ev.preventDefault(); }catch(e){}
        console.warn('Suppressed window error from extension/devtools:', msg || src || stack);
      }
    }catch(e){}
  };

  try{
    window.addEventListener('unhandledrejection', onUnhandledRejection, true);
    window.addEventListener('error', onError, true);
    // Override window.onerror as a last resort
    window.onerror = function(message, source, lineno, colno, error){
      try{
        if(shouldSuppressMessage(message, source, error && error.stack ? error.stack : '')){
          console.warn('Suppressed window.onerror:', message || source);
          return true; // prevent default handling
        }
      }catch(e){}
      return false;
    };
  }catch(e){}
})();`;

    return (
      <Html>
        <Head>
          <script dangerouslySetInnerHTML={{ __html: inlineScript }} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
