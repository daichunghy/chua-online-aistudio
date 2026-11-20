import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  SHOPEE_AFFILIATE_LINKS,
  validateShopeeAffiliateUrl,
  resolveShopeeAffiliateUrl,
  mergeShopeeAffiliateOverrides
} from './modules/shopee-affiliate.mjs';
import {
  RANDOM_ENCOUNTERS,
  CONG_QUA_TASKS,
  HERITAGE_PHOTO_SPOTS,
  createPilgrimageDepthState,
  findNearestRandomEncounter,
  completeRandomEncounter,
  findNearestCongQuaTask,
  completeCongQuaTask,
  matchHeritagePhotoSpot,
  recordHeritagePhoto,
  getPilgrimageDepthSummary
} from './modules/pilgrimage-depth.mjs';
import { MARKETPLACE_STALL_CATALOG, MARKETPLACE_STALL_CATEGORIES, filterMarketplaceItems } from './modules/marketplace.mjs';

describe('Shopee Affiliate Link Manager & Expanded Store Catalog', () => {
  it('validates only safe https Shopee domains and rejects non-Shopee or javascript URLs', () => {
    assert.equal(validateShopeeAffiliateUrl('https://s.shopee.vn/9K8abcXYZ').valid, true);
    assert.equal(validateShopeeAffiliateUrl('https://shope.ee/2A3b4C').valid, true);
    assert.equal(validateShopeeAffiliateUrl('https://shopee.vn/search?keyword=tram').valid, true);
    assert.equal(validateShopeeAffiliateUrl('').valid, true);
    assert.equal(validateShopeeAffiliateUrl('javascript:alert(1)').valid, false);
    assert.equal(validateShopeeAffiliateUrl('http://s.shopee.vn/insecure').valid, false);
    assert.equal(validateShopeeAffiliateUrl('https://evil.example.com/phish').valid, false);
  });

  it('resolves custom Shopee Affiliate overrides first and falls back to clean Shopee VN search URLs', () => {
    const fallback = resolveShopeeAffiliateUrl({ id: 'sap_kho_quet_chay', name: 'Kho Quẹt Chay' });
    assert.equal(fallback.isCustomAffiliate, false);
    assert.match(fallback.url, /^https:\/\/shopee\.vn\/search\?keyword=/);

    const overrides = mergeShopeeAffiliateOverrides({}, {
      sap_kho_quet_chay: 'https://s.shopee.vn/khoquet123',
      sap_nhang_tram: 'javascript:bad()'
    });
    assert.equal(overrides.sap_kho_quet_chay, 'https://s.shopee.vn/khoquet123');
    assert.equal(overrides.sap_nhang_tram, undefined);

    const resolved = resolveShopeeAffiliateUrl('sap_kho_quet_chay', overrides);
    assert.equal(resolved.isCustomAffiliate, true);
    assert.equal(resolved.url, 'https://s.shopee.vn/khoquet123');
    assert.ok('sap_kho_quet_chay' in SHOPEE_AFFILIATE_LINKS);
  });

  it('exposes expanded walkable store catalog with >= 28 authentic items across categories', () => {
    assert.ok(MARKETPLACE_STALL_CATALOG.length >= 28);
    assert.ok(MARKETPLACE_STALL_CATEGORIES.some((c) => c.id === 'phap_phuc'));
    assert.equal(filterMarketplaceItems('all').length, MARKETPLACE_STALL_CATALOG.length);
    assert.ok(filterMarketplaceItems('phap_phuc').length >= 4);
  });
});

describe('Phase 3 Pilgrimage Depth — Encounters, Công Quả & 12 Heritage Photo Spots', () => {
  it('supports all 3 non-violent random encounters with idempotent rewards', () => {
    assert.equal(RANDOM_ENCOUNTERS.length, 3);
    const nearGrandma = findNearestRandomEncounter(11.4, 30.9);
    assert.equal(nearGrandma?.id, 'ba_cu_trang_hat');

    const initial = createPilgrimageDepthState();
    const first = completeRandomEncounter(initial, 'ba_cu_trang_hat');
    assert.equal(first.ok, true);
    assert.equal(first.alreadyCompleted, false);
    assert.ok(first.rewardLotus > 0);

    const second = completeRandomEncounter(first.state, 'ba_cu_trang_hat');
    assert.equal(second.alreadyCompleted, true);
    assert.equal(second.rewardLotus, 0);
  });

  it('supports all 3 Công quả temple volunteer tasks', () => {
    assert.equal(CONG_QUA_TASKS.length, 3);
    const nearCenser = findNearestCongQuaTask(23.1, 17.5);
    assert.equal(nearCenser?.id, 'danh_bong_lu_huong');

    let st = createPilgrimageDepthState();
    for (const task of CONG_QUA_TASKS) {
      const res = completeCongQuaTask(st, task.id);
      assert.equal(res.ok, true);
      assert.equal(res.alreadyCompleted, false);
      st = res.state;
    }
    const summary = getPilgrimageDepthSummary(st);
    assert.equal(summary.congQuaDone, 3);
    assert.equal(summary.congQuaTotal, 3);
  });

  it('matches all 12 Heritage Photo Quest spots across exterior and interior and records album progress', () => {
    assert.equal(HERITAGE_PHOTO_SPOTS.length, 12);
    const parkSpot = matchHeritagePhotoSpot(8.0, 104.0, false);
    assert.equal(parkSpot?.id, 'photo_cong_vien');

    const interiorSpot = matchHeritagePhotoSpot(-44.0, 0.0, true);
    assert.equal(interiorSpot?.id, 'photo_chanh_dien_100');

    const st0 = createPilgrimageDepthState();
    const r1 = recordHeritagePhoto(st0, 'photo_cong_vien', { dateKey: '2026-11-20' });
    assert.equal(r1.isNewSpot, true);
    assert.equal(r1.rewardLotus, 20);
    const r2 = recordHeritagePhoto(r1.state, 'photo_cong_vien', { dateKey: '2026-11-20' });
    assert.equal(r2.isNewSpot, false);
    assert.equal(r2.rewardLotus, 0);
    assert.equal(getPilgrimageDepthSummary(r2.state).photosDone, 1);
  });
});
