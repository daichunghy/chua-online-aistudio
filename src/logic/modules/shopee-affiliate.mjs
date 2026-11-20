/**
 * Quản lý liên kết Shopee Affiliate cho Nhà Lưu Niệm & Tiệm Tạp Hóa Chùa Vĩnh Tràng.
 *
 * HƯỚNG DẪN GẮN LINK SHOPEE AFFILIATE SAU NÀY:
 * 1. Dán trực tiếp link rút gọn Shopee Affiliate (ví dụ: "https://s.shopee.vn/xxxx")
 *    vào đúng mã sản phẩm trong bảng SHOPEE_AFFILIATE_LINKS bên dưới; HOẶC
 * 2. Bấm nút "⚙️ Gắn link Shopee" ngay trong cửa sổ Tiệm Tạp Hóa để dán và lưu nhanh.
 */

export const SHOPEE_AFFILIATE_LINKS = {
  // === 1. HƯƠNG, ĐÈN & HOA LỄ ===
  sap_nhang_tram: '',
  sap_hoa_sen_tuoi: '',
  sap_mam_ngu_qua: '',
  sap_nhang_vong_khuynh_diep: '',
  sap_cap_den_cay_sen: '',
  sap_tram_nu_thac_khoi: '',

  // === 2. LƯU NIỆM & VĂN HÓA PHẨM ===
  sap_quat_nan_gio_may: '',
  sap_non_la_theu_sen: '',
  sap_trang_hat_go: '',
  sap_gio_may_tre_sen: '',
  sap_khan_ran_nam_bo: '',
  sap_tui_vai_di_chua: '',
  sap_my_nghe_go_dua: '',
  sap_tuong_di_lac_mini: '',
  sap_kinh_sach_niem_phat: '',
  sap_dau_gio_thao_duoc: '',

  // === 3. PHÁP PHỤC & ĐỒ TU HỌC ===
  sap_ao_trang_lam: '',
  sap_bo_doan_thien: '',
  sap_mo_go_tung_kinh: '',
  sap_den_hoa_sen_led: '',

  // === 4. KHO QUẸT CHAY, ĐẶC SẢN MIỀN TÂY & GIẢI KHÁT ===
  sap_kho_quet_chay: '',
  sap_chao_mon_chay: '',
  sap_tuong_hot_muoi_me_chay: '',
  sap_dua_xiem_my_tho: '',
  sap_nuoc_suoi_khan_lanh: '',
  sap_tra_tac_mat_ong: '',
  sap_sam_bo_luong_bi_dao: '',
  sap_banh_bo_thot_not: '',
  sap_banh_pia_chay: '',
  sap_hat_sen_say_gion: '',
  sap_tra_sen_dong_thap: '',
  sap_mut_dua_non_my_tho: '',

  // === CATALOG TỦ ĐỒ / CỬA HÀNG CHÍNH ===
  so_tay_hoa_sen: '',
  trang_hat_go: '',
  buu_thiep_chua: '',
  tui_vai_theu_sen: '',
  non_la_theu_sen: '',
  khan_ran_nam_bo: '',
  combo_qua_que_mien_tay: '',
  quat_nan_gio_may: '',
  ao_trang_phat_tu: '',
  bo_kinh_phap_cu: '',
  mo_go_mit_cham_rong: '',
  chuong_dong_bat_nha: '',
  toa_sen_ngoi_thien: '',
  bo_am_tra_sen_gom: ''
};

export const SHOPEE_AFFILIATE_KEYWORDS = {
  sap_nhang_tram: 'nhang tram huong sach khong hoa chat',
  sap_hoa_sen_tuoi: 'hoa sen lua trang tri ban tho',
  sap_mam_ngu_qua: 'mam bong go dung ngu qua ban tho',
  sap_nhang_vong_khuynh_diep: 'nhang vong tram huong it khoi',
  sap_cap_den_cay_sen: 'nen hoa sen sap bo thuc vat',
  sap_tram_nu_thac_khoi: 'tram nu thac khoi tram huong tu nhien',
  sap_quat_nan_gio_may: 'quat nan tre thu cong truyen thong',
  sap_non_la_theu_sen: 'non la hue ve hoa sen',
  sap_trang_hat_go: 'trang hat go bo de 108 hat',
  sap_gio_may_tre_sen: 'gio may tre dan di le chua',
  sap_khan_ran_nam_bo: 'khan ran nam bo theu hoa sen',
  sap_tui_vai_di_chua: 'tui vai bo canvas theu hoa sen di chua',
  sap_my_nghe_go_dua: 'chen dua go dua my nghe ben tre',
  sap_tuong_di_lac_mini: 'tuong phat di lac mini go mit',
  sap_kinh_sach_niem_phat: 'sach kinh nhat tung chu to',
  sap_dau_gio_thao_duoc: 'dau gio thao duoc thien nhien',
  sap_ao_trang_lam: 'ao trang lam di chua phat tu',
  sap_bo_doan_thien: 'bo doan ngoi thien hoa sen',
  sap_mo_go_tung_kinh: 'mo go mit tung kinh',
  sap_den_hoa_sen_led: 'den hoa sen pha le ban tho',
  sap_kho_quet_chay: 'kho quet chay nam huong tieu xanh',
  sap_chao_mon_chay: 'chao mon chay mien tay',
  sap_tuong_hot_muoi_me_chay: 'muoi me dau phong chay rong bien',
  sap_dua_xiem_my_tho: 'keo dua ben tre nuoc dua xiem',
  sap_nuoc_suoi_khan_lanh: 'binh giu nhiet hoa sen di chua',
  sap_tra_tac_mat_ong: 'tra tac mat ong giai nhiet',
  sap_sam_bo_luong_bi_dao: 'tra bi dao hat chia mia lau',
  sap_banh_bo_thot_not: 'banh bo thot not mien tay',
  sap_banh_pia_chay: 'banh pia chay dau xanh sau rieng',
  sap_hat_sen_say_gion: 'hat sen say gion dong thap',
  sap_tra_sen_dong_thap: 'tra sen dong thap thuong hang',
  sap_mut_dua_non_my_tho: 'mut dua non ben tre it ngot'
};

const ALLOWED_SHOPEE_HOSTS = new Set([
  'shopee.vn',
  'www.shopee.vn',
  's.shopee.vn',
  'shope.ee',
  'shp.ee',
  'vn.shp.ee'
]);

/**
 * Kiểm tra link Shopee Affiliate hợp lệ (chỉ chấp nhận https tới domain Shopee chính thức).
 */
export function validateShopeeAffiliateUrl(rawUrl) {
  const trimmed = String(rawUrl || '').trim();
  if (!trimmed) return { valid: true, normalized: '' };
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:') {
      return { valid: false, reason: 'Chỉ chấp nhận đường dẫn https:// chính thức của Shopee.' };
    }
    const host = parsed.hostname.toLowerCase();
    const isAllowed =
      ALLOWED_SHOPEE_HOSTS.has(host) ||
      host.endsWith('.shopee.vn') ||
      host.endsWith('.shp.ee');
    if (!isAllowed) {
      return {
        valid: false,
        reason: 'Đường dẫn phải thuộc tên miền Shopee (shopee.vn, s.shopee.vn, shope.ee, vn.shp.ee).'
      };
    }
    return { valid: true, normalized: parsed.toString() };
  } catch {
    return { valid: false, reason: 'Định dạng đường dẫn chưa hợp lệ.' };
  }
}

/**
 * Trả về đường dẫn Shopee Affiliate cho một món hàng.
 * Ưu tiên: (1) Link user đã gắn trong customOverrides -> (2) SHOPEE_AFFILIATE_LINKS -> (3) Link tìm kiếm Shopee VN.
 */
export function resolveShopeeAffiliateUrl(productOrId, customOverrides = {}) {
  const id = typeof productOrId === 'string' ? productOrId : String(productOrId?.id || '');
  const name = typeof productOrId === 'object' && productOrId ? String(productOrId.name || '') : '';

  const customCandidate = customOverrides && typeof customOverrides === 'object' ? customOverrides[id] : '';
  const customCheck = validateShopeeAffiliateUrl(customCandidate);
  if (customCheck.valid && customCheck.normalized) {
    return {
      url: customCheck.normalized,
      isCustomAffiliate: true,
      label: 'Mua Shopee (Affiliate)'
    };
  }

  const staticCandidate = SHOPEE_AFFILIATE_LINKS[id] || '';
  const staticCheck = validateShopeeAffiliateUrl(staticCandidate);
  if (staticCheck.valid && staticCheck.normalized) {
    return {
      url: staticCheck.normalized,
      isCustomAffiliate: true,
      label: 'Mua Shopee (Affiliate)'
    };
  }

  const keyword = SHOPEE_AFFILIATE_KEYWORDS[id] || name || 'do phat giao chua vinh trang';
  const searchUrl = `https://shopee.vn/search?keyword=${encodeURIComponent(keyword)}`;
  return {
    url: searchUrl,
    isCustomAffiliate: false,
    label: 'Xem trên Shopee'
  };
}

/**
 * Gộp link Shopee Affiliate mới vào map overrides (immutable, chỉ giữ link hợp lệ).
 */
export function mergeShopeeAffiliateOverrides(existing = {}, updates = {}) {
  const next = {};
  if (existing && typeof existing === 'object') {
    for (const [k, v] of Object.entries(existing)) {
      const check = validateShopeeAffiliateUrl(v);
      if (check.valid && check.normalized) next[k] = check.normalized;
    }
  }
  if (updates && typeof updates === 'object') {
    for (const [k, v] of Object.entries(updates)) {
      const trimmed = String(v || '').trim();
      if (!trimmed) {
        delete next[k];
      } else {
        const check = validateShopeeAffiliateUrl(trimmed);
        if (check.valid && check.normalized) next[k] = check.normalized;
      }
    }
  }
  return next;
}
