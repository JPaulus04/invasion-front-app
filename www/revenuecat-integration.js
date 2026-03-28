// ═══════════════════════════════════════════════════════════════════════════════
// REVENUECAT INTEGRATION FOR INVASION FRONT COMMANDER
// Drop this script block into your index.html, right after the game initialization
// ═══════════════════════════════════════════════════════════════════════════════

(async () => {
  // RevenueCat API Key — get from your RevenueCat dashboard
  const REVENUECAT_API_KEY = "appl_YOUR_REVENUECAT_API_KEY"; // TODO: Replace with your key

  // Map game IAP IDs to your RevenueCat package identifiers
  // These MUST match your App Store Connect product IDs exactly
  const PRODUCT_MAP = {
    'autowav':   'com.paulus.laststandcommand.autowave',
    'quickbuy':  'com.paulus.laststandcommand.quickbuy',
    'supporter': 'com.paulus.laststandcommand.supporter',
    'commander': 'com.paulus.laststandcommand.commander'
  };

  let Purchases = null;
  let isInitialized = false;
  let offerings = null;

  // ── Initialize RevenueCat ────────────────────────────────────────────────────
  async function initRevenueCat() {
    try {
      // Import RevenueCat
      const { default: PurchasesModule } = await import('@revenuecat/purchases-js');
      Purchases = PurchasesModule;

      // Setup with your API key
      await Purchases.setup({
        apiKey: REVENUECAT_API_KEY,
        appUserID: null // Anonymous user; RevenueCat generates an ID
      });

      // Fetch offerings (your products)
      const data = await Purchases.getOfferings();
      offerings = data;

      isInitialized = true;
      console.log('✓ RevenueCat initialized successfully');
      console.log('Available offerings:', offerings);

      return true;
    } catch (err) {
      console.error('RevenueCat init failed:', err);
      return false;
    }
  }

  // ── Check if user owns a product ──────────────────────────────────────────────
  async function checkOwnership(productId) {
    if (!isInitialized) return false;

    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const entitlementId = productId; // Assuming entitlement ID matches product ID

      // Check active entitlements
      return customerInfo.entitlements.active[entitlementId] !== undefined;
    } catch (err) {
      console.error('Ownership check failed:', err);
      return false;
    }
  }

  // ── Execute purchase ─────────────────────────────────────────────────────────
  async function executePurchase(gameProductId) {
    if (!isInitialized || !offerings) {
      alert('Store not ready. Please try again.');
      return false;
    }

    try {
      const storeProductId = PRODUCT_MAP[gameProductId];
      if (!storeProductId) {
        console.error('Unknown product:', gameProductId);
        return false;
      }

      // Find the package in offerings
      let package_ = null;
      if (offerings.current && offerings.current.available_packages) {
        package_ = offerings.current.available_packages.find(
          pkg => pkg.product.identifier === storeProductId
        );
      }

      if (!package_) {
        console.error('Product not found in offerings:', storeProductId);
        alert('Product not available. Please try again later.');
        return false;
      }

      // Execute purchase
      const customerInfo = await Purchases.purchasePackage({
        aPackage: package_
      });

      // Check if purchase successful
      const entitlementId = gameProductId;
      if (customerInfo.entitlements.active[entitlementId]) {
        console.log('✓ Purchase successful:', gameProductId);
        return true;
      }

      return false;
    } catch (err) {
      if (err.code === 'ERR_PURCHASE_CANCELLED_BY_USER') {
        console.log('Purchase cancelled by user');
      } else {
        console.error('Purchase failed:', err);
        alert('Purchase failed. Please try again.');
      }
      return false;
    }
  }

  // ── Restore purchases ────────────────────────────────────────────────────────
  async function restorePurchases() {
    if (!isInitialized) {
      alert('Store not ready. Please try again.');
      return false;
    }

    try {
      const customerInfo = await Purchases.restorePurchases();

      // Check all purchased products
      let restored = [];
      Object.keys(PRODUCT_MAP).forEach(gameId => {
        if (customerInfo.entitlements.active[gameId]) {
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

  // ─────────────────────────────────────────────────────────────────────────────
  // HOOK INTO GAME'S PURCHASE SYSTEM
  // Replace the original _storePurchase with RevenueCat flow
  // ─────────────────────────────────────────────────────────────────────────────

  // Store original functions
  const originalStorePurchase = window._storePurchase;
  const originalStoreApplyPurchase = window._storeApplyPurchase;

  // Override with RevenueCat flow
  window._storePurchase = async function(id) {
    const msg = _storeConfirmMessage(id);
    const ok = confirm(msg); // Still show confirmation
    if (!ok) return;

    // Try RevenueCat purchase
    if (isInitialized) {
      const success = await executePurchase(id);
      if (success) {
        originalStoreApplyPurchase(id); // Apply game logic
        return;
      }
      // If failed, don't apply purchase
    } else {
      // Fallback to original if RevenueCat not ready (dev mode)
      console.warn('RevenueCat not initialized, using fallback');
      originalStoreApplyPurchase(id);
    }
  };

  // Add restore purchases button handler
  window._restorePurchasesRevenueCat = async function() {
    if (!isInitialized) {
      alert('Store not ready. Please try again.');
      return;
    }

    const restored = await restorePurchases();
    if (restored.length > 0) {
      // Apply each restored product
      restored.forEach(id => {
        originalStoreApplyPurchase(id);
      });
      showToast('✓ Purchases restored!');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // STARTUP
  // ─────────────────────────────────────────────────────────────────────────────

  console.log('🎮 Initializing RevenueCat for Invasion Front Commander...');

  // Wait for Capacitor to be ready
  let retries = 0;
  const initInterval = setInterval(async () => {
    try {
      const success = await initRevenueCat();
      if (success) {
        clearInterval(initInterval);
        console.log('✓ RevenueCat ready for purchases');
      }
    } catch (err) {
      retries++;
      if (retries > 10) {
        clearInterval(initInterval);
        console.error('RevenueCat failed to initialize after 10 retries');
      }
    }
  }, 500);

})();
