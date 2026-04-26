// ── iap.js — RevenueCat integration for IFC ──────────────────────────────────
// Bridges to @revenuecat/purchases-capacitor via the Capacitor native plugin.
// The native iOS plugin registers itself as window.Capacitor.Plugins.Purchases.
// We never use ESM imports — all calls go through the Capacitor bridge directly.

const IFC_RC_KEY   = 'appl_sjSqUMsEbQgRgGTvYEvvmzFcecQ';

// Product IDs exactly as defined in App Store Connect
const RC_PRODUCTS = {
  autowav:    'com.paulus.laststandcommand.autowav',
  quickbuy:   'com.paulus.laststandcommand.quickbuy',
  supporter:  'com.paulus.laststandcommand.supporter',
  commander:  'com.paulus.laststandcommand.commander',
};

// localStorage keys (already used by the rest of the app)
const RC_KEYS = {
  autowav:    'ifc_autowav',
  quickbuy:   'ifc_quickbuy',
  supporter:  'ifc_iap_supporter',
  commander:  'ifc_iap_commander',
};

// ── Get the native Purchases plugin via Capacitor bridge ──────────────────────
function _rcPlugin() {
  try {
    const p = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Purchases;
    if (!p) console.warn('[IAP] RevenueCat Capacitor plugin not available');
    return p || null;
  } catch(e) {
    console.warn('[IAP] Error accessing RevenueCat plugin:', e.message);
    return null;
  }
}

// ── Initialize RevenueCat on app start ───────────────────────────────────────
async function rcInitialize() {
  const rc = _rcPlugin();
  if (!rc) return;
  try {
    await rc.configure({ apiKey: IFC_RC_KEY });
    console.log('[IAP] RevenueCat initialized');
    // Restore any existing purchases silently on init
    await rcRestoreSilent();
  } catch(e) {
    console.warn('[IAP] Configure error:', e.message);
  }
}

// ── Purchase a product by store ID ───────────────────────────────────────────
async function rcPurchase(productId) {
  const rc = _rcPlugin();
  if (!rc) {
    showToast('Store unavailable — try again later');
    return false;
  }
  try {
    showToast('Opening purchase…');
    // Get offerings — try 'default' first, fall back to current
    const offeringsResult = await rc.getOfferings();
    const offering = (offeringsResult.all && offeringsResult.all['default'])
                   || offeringsResult.current;
    if (!offering) {
      // No offerings configured — go direct to product purchase
      const result = await rc.purchaseStoreProduct({ product: { identifier: productId } });
      return _rcHandleResult(result);
    }
    // Find matching package by product identifier
    const pkg = offering.availablePackages.find(function(p) {
      return p.product && p.product.identifier === productId;
    });
    if (!pkg) {
      // Fallback: try purchaseStoreProduct directly
      const result = await rc.purchaseStoreProduct({ product: { identifier: productId } });
      return _rcHandleResult(result);
    }
    const result = await rc.purchasePackage({ aPackage: pkg });
    return _rcHandleResult(result);
  } catch(e) {
    if (e.code === 'PURCHASE_CANCELLED') {
      showToast('Purchase cancelled');
    } else {
      console.warn('[IAP] Purchase error:', e.message);
      showToast('Purchase failed — ' + (e.userInfo || e.message || 'unknown error'));
    }
    return false;
  }
}

// ── Handle successful purchase result ────────────────────────────────────────
function _rcHandleResult(result) {
  const info = result && (result.customerInfo || result.purchaserInfo);
  if (!info) return false;
  _rcApplyEntitlements(info);
  return true;
}

// ── Apply entitlements from CustomerInfo to local state ──────────────────────
function _rcApplyEntitlements(info) {
  const active = (info.entitlements && info.entitlements.active) || {};
  // Check each product entitlement — entitlement IDs match product IDs in RC dashboard
  const hasAutowav   = !!(active['autowav']   || active['com.paulus.laststandcommand.autowav']);
  const hasQuickbuy  = !!(active['quickbuy']  || active['com.paulus.laststandcommand.quickbuy']);
  const hasSupporter = !!(active['supporter'] || active['com.paulus.laststandcommand.supporter']);
  const hasCommander = !!(active['commander'] || active['com.paulus.laststandcommand.commander']);

  // Commander includes all lower tiers
  const effectiveSupporter = hasSupporter || hasCommander;
  const effectiveAutowav   = hasAutowav   || hasCommander;
  const effectiveQuickbuy  = hasQuickbuy  || hasCommander;

  if (hasAutowav)        localStorage.setItem(RC_KEYS.autowav,   '1');
  if (effectiveQuickbuy) localStorage.setItem(RC_KEYS.quickbuy,  '1');
  if (effectiveSupporter)localStorage.setItem(RC_KEYS.supporter, '1');
  if (hasCommander)      localStorage.setItem(RC_KEYS.commander, '1');

  // Apply to live game state
  _restoreIAPPurchases();

  if (hasCommander)       { haptic('success'); showToast('👑 Commander Edition unlocked!'); }
  else if (effectiveSupporter) { haptic('success'); showToast('🎖 Supporter Pack unlocked!'); }
  else if (effectiveAutowav)   { haptic('success'); showToast('⚡ Auto-Wave unlocked!'); }
  else if (effectiveQuickbuy)  { haptic('success'); showToast('⚡ Quick Buy unlocked!'); }

  // Re-render store to show owned state
  if (typeof renderStoreSheet === 'function') renderStoreSheet();
  if (typeof updateHUD === 'function') updateHUD();
}

// ── Restore purchases (user-initiated) ───────────────────────────────────────
async function rcRestore() {
  const rc = _rcPlugin();
  if (!rc) { showToast('Store unavailable — try again later'); return; }
  try {
    showToast('Restoring purchases…');
    const result = await rc.restorePurchases();
    const info = result && (result.customerInfo || result.purchaserInfo);
    if (info) {
      _rcApplyEntitlements(info);
      showToast('Purchases restored');
    } else {
      showToast('No purchases found');
    }
  } catch(e) {
    console.warn('[IAP] Restore error:', e.message);
    showToast('Restore failed — check connection');
  }
}

// ── Silent restore on init — no toasts ───────────────────────────────────────
async function rcRestoreSilent() {
  const rc = _rcPlugin();
  if (!rc) return;
  try {
    const result = await rc.getCustomerInfo();
    const info = result && (result.customerInfo || result.purchaserInfo);
    if (info) _rcApplyEntitlements(info);
  } catch(e) {
    console.warn('[IAP] Silent restore error:', e.message);
  }
}
