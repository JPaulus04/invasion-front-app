// ═══════════════════════════════════════════════════════════════════════════════
// CAPACITOR IAP INTEGRATION FOR INVASION FRONT COMMANDER
// Direct Apple IAP via Capacitor Plugin
// ═══════════════════════════════════════════════════════════════════════════════

(async () => {
  // Your product IDs — must match App Store Connect exactly
  const PRODUCT_IDS = [
    'com.paulus.laststandcommand.autowave',
    'com.paulus.laststandcommand.quickbuy',
    'com.paulus.laststandcommand.supporter',
    'com.paulus.laststandcommand.commander'
  ];

  // Map game IAP IDs to App Store product IDs
  const PRODUCT_MAP = {
    'autowav':   'com.paulus.laststandcommand.autowave',
    'quickbuy':  'com.paulus.laststandcommand.quickbuy',
    'supporter': 'com.paulus.laststandcommand.supporter',
    'commander': 'com.paulus.laststandcommand.commander'
  };

  let IAPPlugin = null;
  let isInitialized = false;
  let products = [];

  // ── Initialize IAP Plugin ────────────────────────────────────────────────
  async function initIAP() {
    try {
      // Check if we're on a real device
      const { Capacitor } = window;
      if (!Capacitor || Capacitor.getPlatform() !== 'ios') {
        console.log('Not on iOS — IAP disabled for testing');
        return false;
      }

      // Import the IAP plugin
      const { InAppPurchase } = await import('capacitor-plugin-iap');
      IAPPlugin = InAppPurchase;

      // Initialize IAP
      await IAPPlugin.initialize();

      // Fetch product information from App Store
      const result = await IAPPlugin.getProducts({
        productIds: PRODUCT_IDS
      });

      products = result.products || [];
      isInitialized = true;

      console.log('✓ IAP initialized. Products:', products.length);
      return true;
    } catch (err) {
      console.error('IAP init failed:', err);
      return false;
    }
  }

  // ── Execute purchase ─────────────────────────────────────────────────────
  async function executePurchase(gameProductId) {
    if (!isInitialized || !IAPPlugin) {
      alert('Store not ready. Please try again.');
      return false;
    }

    try {
      const storeProductId = PRODUCT_MAP[gameProductId];
      if (!storeProductId) {
        console.error('Unknown product:', gameProductId);
        return false;
      }

      // Find the product
      const product = products.find(p => p.id === storeProductId);
      if (!product) {
        console.error('Product not found:', storeProductId);
        alert('Product not available. Please try again later.');
        return false;
      }

      // Execute purchase
      const result = await IAPPlugin.purchase({
        productId: storeProductId
      });

      if (result && result.transactionId) {
        console.log('✓ Purchase successful:', gameProductId);
        return true;
      }

      return false;
    } catch (err) {
      if (err.message && err.message.includes('cancel')) {
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
    if (!isInitialized || !IAPPlugin) {
      alert('Store not ready. Please try again.');
      return [];
    }

    try {
      const result = await IAPPlugin.restorePurchases();
      const restoredIds = result.purchaseIds || [];

      if (restoredIds.length > 0) {
        console.log('✓ Restored purchases:', restoredIds);
        return restoredIds;
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
      // Fallback to original if IAP not ready
      console.warn('IAP not initialized, using fallback');
      originalStoreApplyPurchase(id);
    }
  };

  window._restorePurchasesIAP = async function() {
    if (!isInitialized) {
      alert('Store not ready. Please try again.');
      return;
    }

    const restored = await restorePurchases();
    if (restored.length > 0) {
      // Map store IDs back to game IDs
      const gameIds = restored
        .map(storeId => {
          for (let gameId in PRODUCT_MAP) {
            if (PRODUCT_MAP[gameId] === storeId) return gameId;
          }
          return null;
        })
        .filter(Boolean);

      gameIds.forEach(id => {
        originalStoreApplyPurchase(id);
      });
      showToast('✓ Purchases restored!');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // STARTUP
  // ─────────────────────────────────────────────────────────────────────────

  console.log('🎮 Initializing IAP for Invasion Front Commander...');

  // Try to initialize IAP
  let retries = 0;
  const initInterval = setInterval(async () => {
    const success = await initIAP();
    if (success) {
      clearInterval(initInterval);
      console.log('✓ IAP ready for purchases');
    } else {
      retries++;
      if (retries > 20) {
        clearInterval(initInterval);
        console.warn('IAP failed to initialize — falling back to offline mode');
      }
    }
  }, 500);

})();
