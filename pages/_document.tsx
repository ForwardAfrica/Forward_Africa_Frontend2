import Document, { Html, Head, Main, NextScript } from 'next/document';
import React from 'react';

export default class MyDocument extends Document {
  render() {
    const inlineScript = `(function(){
  try{
    // Block/neutralize injected Ethereum providers and extension scripts.
    // Intercept DOM insertion of script nodes to stop extension inpage scripts from running.
    (function(){
      const origAppend = Node.prototype.appendChild;
      const origInsertBefore = Node.prototype.insertBefore;

      function isExtensionScript(node){
        try{
          if(!node) return false;
          if(node.tagName !== 'SCRIPT') return false;
          const src = node.src || '';
          const txt = node.textContent || '';
          if(src && src.indexOf('chrome-extension://') === 0) return true;
          if(src && /inpage\.js/i.test(src)) return true;
          if(/failed to connect to metamask/i.test(txt)) return true;
          if(/window\.ethereum|web3|ethereum\./i.test(txt)) return true;
        }catch(e){}
        return false;
      }

      Node.prototype.appendChild = function(node){
        try{
          if(isExtensionScript(node)){
            console.warn('Blocked extension script injection:', node.src || (node.textContent||'inline'));
            return node; // swallow
          }
        }catch(e){}
        return origAppend.call(this, node);
      };

      Node.prototype.insertBefore = function(node, ref){
        try{
          if(isExtensionScript(node)){
            console.warn('Blocked extension script insertion:', node.src || (node.textContent||'inline'));
            return node;
          }
        }catch(e){}
        return origInsertBefore.call(this, node, ref);
      };

      // MutationObserver as backup to remove any injected extension scripts
      try{
        const observer = new MutationObserver((mutations) => {
          for(const m of mutations){
            for(const node of Array.from(m.addedNodes || [])){
              try{
                if(node && node.tagName === 'SCRIPT'){
                  const src = node.src || '';
                  const txt = node.textContent || '';
                  if((src && src.indexOf('chrome-extension://') === 0) || /inpage\.js/i.test(src) || /failed to connect to metamask/i.test(txt) || /window\.ethereum|web3|ethereum\./i.test(txt)){
                    node.parentNode && node.parentNode.removeChild(node);
                    console.warn('Removed extension script node via observer:', src || txt.slice(0,120));
                  }
                }
              }catch(e){}
            }
          }
        });
        observer.observe(document.documentElement || document, { childList: true, subtree: true });
      }catch(e){}

      // Repeatedly neutralize provider objects in case extension re-injects them later
      try{
        const neutralize = () => {
          try{
            if(window.ethereum){
              try{ window.ethereum.request = function(){}; }catch(e){}
              try{ window.ethereum.enable = function(){}; }catch(e){}
              try{ window.ethereum = undefined; }catch(e){}
            }
          }catch(e){}
          try{ if(window.web3){ window.web3 = undefined; } }catch(e){}
        };
        neutralize();
        setInterval(neutralize, 1000);
      }catch(e){}

      // Mark blocked
      try{ window.__METAMASK_BLOCKED = true; }catch(e){}
    })();

    // Suppress noisy extension/devtool errors from surfacing to the overlay
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
      // Attach targeted handlers
      window.addEventListener('unhandledrejection', onUnhandledRejection, true);
      window.addEventListener('error', onError, true);

      // Global suppression: prevent Next.js dev overlay and other default error handling
      try{
        window.addEventListener('error', function(ev){
          try{ ev.preventDefault(); ev.stopImmediatePropagation(); }catch(e){}
        }, true);
      }catch(e){}

      try{
        window.addEventListener('unhandledrejection', function(ev){
          try{ ev.preventDefault(); ev.stopImmediatePropagation(); }catch(e){}
        }, true);
      }catch(e){}

      // Ensure window.onerror always returns true to suppress default browser handling
      try{
        window.onerror = function(){ return true; };
      }catch(e){}

    }catch(e){}
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
