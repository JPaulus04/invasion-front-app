// ═══════════════════════════════════════════════════════════════════════════════
// REVENUECAT INTEGRATION FOR INVASION FRONT COMMANDER
// Uses Capacitor plugin (purchases-capacitor) — no separate JS SDK needed
// ═══════════════════════════════════════════════════════════════════════════════

(async () => {
  // RevenueCat API Key — from your RevenueCat dashboard
  const REVENUECAT_API_KEY = "appl_sjSqUMsEbQgRgGTvYEvvmzFcecQ";

  // Map game IAP IDs to your App Store product IDs
  const PRODUCT_MAP = {
    'autowav':   'com.paulus.laststandcommand.autowave',
    'quickbuy':  'com.paulus.laststandcommand.quickbuy',
    'supporter': 'com.paulus.laststandcommand.supporter',
    'commander': 'com.paulus.laststandcommand.commander'
  };

  let Purchases = null;
  let isInitialized = false;

  // ── Initialize RevenueCat via Capacitor ──────────────────────────────────
  async function initRevenueCat() {
    try {
      // Import Capacitor's RevenueCat plugin
      const { Purchases: PurchasesModule } = window.revenueCat || {};
      
      if (!PurchasesModule) {
        console.warn('RevenueCat Capacitor plugin not available yet, retrying...');
        return false;
      }

      // Initialize the SDK
      await PurchasesModule.configure({
        apiKey: REVENUECAT_API_KEY,
        appUserID: null // Anonymous — RevenueCat generates ID
      });

      Purchases = PurchasesModule;
      isInitialized = true;
      
      console.log('✓ RevenueCat initialized via Capacitor');
      return true;
    } catch (err) {
      console.error('RevenueCat init failed:', err);
      return false;
    }
  }

  // ── Execute purchase ─────────────────────────────────────────────────────
  async function executePurchase(gameProductId) {
    if (!isInitialized || !Purchases) {
      alert('Store not ready. Please try again.');
      return false;
    }

    try {
      const storeProductId = PRODUCT_MAP[gameProductId];
      if (!storeProductId) {
        console.error('Unknown product:', gameProductId);
        return false;
      }

      // Get offerings
      const offerings = await Purchases.getOfferings();

      if (!offerings.current) {
        console.error('No current offering available');
        alert('Products not available. Please try again later.');
        return false;
      }

      // Find the product in offerings
      const product = offerings.current.availablePackages?.find(
        pkg => pkg.product?.identifier === storeProductId
      );

      if (!product) {
        console.error('Product not found in offerings:', storeProductId);
        alert('Product not available. Please try again later.');
        return false;
      }

      // Execute purchase
      const result = await Purchases.purchasePackage({
        aPackage: product
      });

      // Check if purchase was successful
      if (result.customerInfo?.entitlements?.active?.[gameProductId]) {
        console.log('✓ Purchase successful:', gameProductId);
        return true;
      }

      return false;
    } catch (err) {
      if (err.code === 'PurchaseCancelledError') {
        console.log('Purchase cancelled by user');
      } else {
        console.error('Purchase failed:', err);
        alert('Purchase failed. Please try again.');
      }
      return false;
    }
  }

  // ── Restore purchases ────────────────────────────────────────────────────
  async function restorePurchases() {
    if (!isInitialized || !Purchases) {
      alert('Store not ready. Please try again.');
      return [];
    }

    try {
      const customerInfo = await Purchases.restorePurchases();

      let restored = [];
      Object.keys(PRODUCT_MAP).forEach(gameId => {
        if (customerInfo.entitlements?.active?.[gameId]) {
          restored.push(gameId);
        }
      });

      if (restored.length > 0) {
        console.log('✓ Restored purchases:', restored);
        return restored;
      } else {
        alert('No purchases found to restore.');
        return [];
      }
    } catch (err) {
      console.error('Restore failed:', err);
      alert('Restore failed. Please try again.');
      return [];
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HOOK INTO GAME'S PURCHASE SYSTEM
  // ─────────────────────────────────────────────────────────────────────────

  const originalStorePurchase = window._storePurchase;
  const originalStoreApplyPurchase = window._storeApplyPurchase;

  window._storePurchase = async function(id) {
    const msg = _storeConfirmMessage(id);
    const ok = confirm(msg);
    if (!ok) return;

    if (isInitialized) {
      const success = await executePurchase(id);
      if (success) {
        originalStoreApplyPurchase(id);
        return;
      }
    } else {
      // Fallback if RevenueCat not ready
      console.warn('RevenueCat not initialized, using fallback');
      originalStoreApplyPurchase(id);
    }
  };

  window._restorePurchasesRevenueCat = async function() {
    if (!isInitialized) {
      alert('Store not ready. Please try again.');
      return;
    }

    const restored = await restorePurchases();
    if (restored.length > 0) {
      restored.forEach(id => {
        originalStoreApplyPurchase(id);
      });
      showToast('✓ Purchases restored!');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // STARTUP
  // ─────────────────────────────────────────────────────────────────────────

  console.log('🎮 Initializing RevenueCat for Invasion Front Commander...');

  // Retry initialization every 500ms for up to 10 seconds
  let retries = 0;
  const initInterval = setInterval(async () => {
    const success = await initRevenueCat();
    if (success) {
      clearInterval(initInterval);
      console.log('✓ RevenueCat ready for purchases');
    } else {
      retries++;
      if (retries > 20) {
        clearInterval(initInterval);
        console.warn('RevenueCat failed to initialize — falling back to offline mode');
      }
    }
  }, 500);

})();
