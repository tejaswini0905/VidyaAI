import React, { useEffect } from 'react';
import './translate.css';

const GoogleTranslate = () => {
  useEffect(() => {
    // Create the global init callback for Google Translate
    window.googleTranslateElementInit = () => {
      if (!window.google || !window.google.translate) return;
      
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en', // Default page language
          // Comprehensive Indian languages + English and Sanskrit
          includedLanguages: 'hi,bn,mr,te,ta,gu,ur,kn,or,ml,pa,as,mai,sat,ks,ne,sd,doi,kok,mni,brx,en,sa,bho,gom,hne,kha,lus,mag,mni,rkt,sck,unx',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
          gaTrack: false,
          gaId: null,
          // Additional configuration options
          multilanguagePage: true,
          // Hide Google branding
          disableAutoTranslation: false
        },
        'google_translate_element'
      );
    };

    // Add the Google Translate script with proper protocol
    const scriptId = 'google-translate-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'text/javascript';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.defer = true;
      
      // Add error handling
      script.onerror = () => {
        console.warn('Failed to load Google Translate script');
      };
      
      document.body.appendChild(script);
    } else {
      // If script already present and google is loaded, try to init immediately
      if (window.google && window.google.translate && window.googleTranslateElementInit) {
        window.googleTranslateElementInit();
      }
    }

    // Add classes to preserve certain elements during translation
    const addTranslationClasses = () => {
      // Add 'notranslate' class to elements that should not be translated
      const preserveElements = document.querySelectorAll([
        'code',
        'pre', 
        '.logo',
        '.brand',
        '[data-notranslate]',
        'input[type="email"]',
        'input[type="url"]',
        'input[type="tel"]'
      ].join(','));

      preserveElements.forEach(element => {
        element.classList.add('notranslate');
      });

      // Ensure main content is translatable
      const translatableElements = document.querySelectorAll([
        'p',
        'h1',
        'h2', 
        'h3',
        'h4',
        'h5',
        'h6',
        'span:not(.notranslate)',
        'div:not(.notranslate)',
        'li',
        'td',
        'th',
        'label'
      ].join(','));

      translatableElements.forEach(element => {
        if (!element.classList.contains('notranslate')) {
          element.classList.add('translate');
        }
      });
    };

    // Apply translation classes after a short delay
    const classTimer = setTimeout(addTranslationClasses, 1000);

    // Cleanup function
    return () => {
      clearTimeout(classTimer);
      
      // Remove the script
      const existingScript = document.getElementById(scriptId);
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
      
      // Remove global init function
      try {
        delete window.googleTranslateElementInit;
      } catch (e) {
        window.googleTranslateElementInit = undefined;
      }
      
      // Clear the widget container to avoid duplicates
      const container = document.getElementById('google_translate_element');
      if (container) {
        container.innerHTML = '';
      }

      // Remove any Google Translate cookies and reset page language
      try {
        // Clear Google Translate cookies
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname;
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.' + window.location.hostname;
        
        // Remove any inline styles added by Google Translate
        document.documentElement.removeAttribute('style');
        document.body.removeAttribute('style');
      } catch (e) {
        // Ignore cookie errors
      }
    };
  }, []);

  return (
    <div className="translator-container" aria-live="polite">
      <div id="google_translate_element" />
    </div>
  );
};

export default GoogleTranslate;