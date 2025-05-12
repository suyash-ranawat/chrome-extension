// Inject Google OAuth (MSAL, Facebook, Apple dynamically)
function injectScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  
  // Inject Google OAuth SDK (example)
  function loadGoogleSDK() {
    return injectScript("https://accounts.google.com/gsi/client");
  }
  
  // Inject Facebook SDK
  function loadFacebookSDK() {
    return injectScript("https://connect.facebook.net/en_US/sdk.js");
  }
  
  // Inject Microsoft MSAL SDK
  function loadMSALSDK() {
    return injectScript("https://alcdn.msauth.net/browser/2.35.0/js/msal-browser.min.js");
  }
  
  // Inject Apple SignIn SDK
  function loadAppleSignInSDK() {
    return injectScript("https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js");
  }
  
  // Example of loading all SDKs
  async function loadSocialSDKs() {
    try {
      await loadGoogleSDK();
      console.log("Google SDK Loaded");
      
      await loadFacebookSDK();
      console.log("Facebook SDK Loaded");
  
      await loadMSALSDK();
      console.log("MSAL SDK Loaded");
  
      await loadAppleSignInSDK();
      console.log("Apple SignIn SDK Loaded");
  
    } catch (error) {
      console.error("Error loading social SDKs", error);
    }
  }
  
  // Load the SDKs
  loadSocialSDKs();
  