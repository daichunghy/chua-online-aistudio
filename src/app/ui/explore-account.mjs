/**
 * Bản đồ khám phá và hồ sơ tài khoản.
 *
 * Mixin của ChuaOnlineApp: 2 method (openExploreModal … openAccountModal).
 * Được gắn vào class trong chua-online-app.mjs qua applyMixins().
 */
import { CHARACTER_PROFILES, PILGRIMAGE_STATIONS, DISCOVERY_ZONES, SHOP_CATALOG, performSpiritualAction, calculateJourneyImprint, getLocalDateKey, STORE_ITEMS_CATALOG, MARKETPLACE_STALL_CATEGORIES, filterMarketplaceItems, purchaseMarketplaceItem, resolveShopeeAffiliateUrl, ensureDailyMissionDate, getQuestsWithProgress, claimQuestReward, encodeProfileBackupCode, decodeProfileBackupCode, COURTYARD_LEAF_SPOTS, NATIONALITY_PROFILES, getNationalityProfile, PILGRIMAGE_MODES, getPilgrimageMode, EIGHTEEN_ARHATS } from './shared.mjs';

export const exploreAccountMethods = {
  openExploreModal(initialSubTab = 'stations', initialArhatIdx = 0) {
    const imprint = calculateJourneyImprint(this.spiritual);
    let currentSub = initialSubTab;
    let shopCatFilter = this.marketStallTab || 'huong_hoa';
    let selectedArhatIdx = Math.max(0, Math.min(17, Number(initialArhatIdx || 0)));

    this.openModal(
      `Khám phá Chùa Vĩnh Tràng (${imprint.litCount}/9 nơi đã ghé)`,
      `
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div class="explore-tabs-bar">
          <button class="explore-sub-btn product-detail-btn" data-sub="stations">🗺️ Bản đồ</button>
          <button class="explore-sub-btn product-detail-btn" data-sub="quests">🎯 Nhiệm vụ</button>
          <button class="explore-sub-btn product-detail-btn" data-sub="shop_offerings">🛍️ Mua đồ &amp; Lễ vật</button>
          <button class="explore-sub-btn product-detail-btn" data-sub="imprint">🪷 Dấu ấn (${imprint.litCount}/9)</button>
          <button class="explore-sub-btn product-detail-btn" data-sub="arhats">🙏 18 vị La Hán</button>
          <button class="explore-sub-btn product-detail-btn" data-sub="sweep">🧹 Quét lá</button>
          <button id="btn-explore-open-interior" class="product-detail-btn" style="background:#784820;">🏛️ Vào Chánh điện</button>
          <button id="btn-explore-open-ugc" class="product-detail-btn" style="background:#C96F4A;">📸 Lưu ảnh</button>
        </div>

        <div id="explore-sub-content"></div>
      </div>
      `
    );

    const renderSub = (sub) => {
      currentSub = sub;
      if (sub !== 'arhats' && this._arhatStageDispose) {
        try {
          this._arhatStageDispose();
        } catch {}
        this._arhatStageDispose = null;
      }
      document.querySelectorAll('.explore-sub-btn').forEach((b) => {
        b.classList.toggle('active', b.getAttribute('data-sub') === sub);
      });
      const box = document.getElementById('explore-sub-content');
      if (!box) return;

      if (sub === 'stations') {
        const curX = this.world3d ? this.world3d.playerPos.x : this.playerPos.x;
        const curZ = this.world3d ? this.world3d.playerPos.z : this.playerPos.z;
        // True-proportion world projection covering x ∈ [-68, +74] and z ∈ [-72, +172] (Temple + Công Viên Vĩnh Tràng + Đường Nguyễn Trung Trực!)
        const mapX = (x) => Math.round(((x + 68) / 142) * 700 + 36);
        const mapY = (z) => Math.round(((z + 72) / 248) * 412 + 24);
        const px = mapX(Math.max(-68, Math.min(74, curX)));
        const py = mapY(Math.max(-72, Math.min(174, curZ)));
        const axisX = mapX(23);

        box.innerHTML = `
          <div style="background:#f6ebd6;border:2px solid #C9962E;border-radius:18px;padding:12px 14px;margin-bottom:12px;box-shadow:inset 0 2px 10px rgba(74,50,34,0.1);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:8px;">
              <div>
                <strong style="font-size:15px;color:#5C381F;">Bản Đồ Thực Tế Chùa Vĩnh Tràng &amp; Công Viên Vĩnh Tràng (TP. Mỹ Tho)</strong>
                <span style="font-size:12px;color:#6E5034;margin-left:8px;">Bấm vào điểm trên bản đồ để đi tới ngay</span>
              </div>
              <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
                <button type="button" id="btn-map-goto-park" class="product-detail-btn" style="width:auto;height:36px;padding:0 14px;font-size:12.5px;background:#1E6B4A;">
                  🌳 Tới Công Viên Vĩnh Tràng
                </button>
                <button type="button" id="btn-map-goto-shop" class="product-detail-btn" style="width:auto;height:36px;padding:0 14px;font-size:12.5px;background:#B84518;">
                  🛍️ Vào Tiệm Tạp Hóa
                </button>
                <div style="font-size:12px;font-weight:700;color:#B84518;background:#fffdf8;padding:4px 10px;border-radius:999px;border:1px solid #C9962E;">
                  ● Vị trí của bạn
                </div>
              </div>
            </div>

            <svg viewBox="0 0 772 460" style="width:100%;height:348px;background:linear-gradient(in oklab 180deg,#d8ebd1 0%,#eee2c7 48%,#e2d6bc 100%);border-radius:14px;border:1.5px solid rgba(120,85,45,0.35);display:block;">
              <!-- Compass Rose -->
              <g transform="translate(734, 34)">
                <circle r="16" fill="rgba(255,250,238,0.88)" stroke="#8B5A2B" stroke-width="1.4"/>
                <text x="0" y="-4" text-anchor="middle" fill="#7E2A22" font-size="9" font-weight="900">Bắc</text>
                <text x="0" y="9" text-anchor="middle" fill="#5C381F" font-size="8" font-weight="700">▲</text>
              </g>

              <!-- 1. KHUÔN VIÊN CHÙA VĨNH TRÀNG (x = -68..68, z = -72..42) -->
              <rect x="${mapX(-68)}" y="${mapY(-72)}" width="${mapX(68) - mapX(-68)}" height="${mapY(42) - mapY(-72)}" rx="10" fill="rgba(255,250,238,0.62)" stroke="#9A7241" stroke-width="2.4"/>

              <!-- Đường dạo nội khu chùa -->
              <rect x="${axisX - 20}" y="${mapY(8)}" width="40" height="${mapY(42) - mapY(8)}" rx="4" fill="#d8ccb8" stroke="#b5a48b" stroke-width="1"/>
              <path d="M ${mapX(-44)} ${mapY(29)} L ${mapX(-24.5)} ${mapY(29)} M ${mapX(-44)} ${mapY(29)} L ${mapX(-44)} ${mapY(-45.5)} L ${mapX(46)} ${mapY(-45.5)} M ${mapX(42.2)} ${mapY(42)} L ${mapX(42.2)} ${mapY(-32)}" stroke="#d8ccb8" stroke-width="8" fill="none" stroke-linecap="round"/>

              <!-- Khu Bắc chùa: Hồ Phóng Sinh, Tổ Đường, Phật Nằm, Bảo Tháp, A Di Đà -->
              <ellipse cx="${mapX(-16)}" cy="${mapY(-56)}" rx="42" ry="12" fill="#2F6F64" stroke="#85C7B8" stroke-width="1.5"/>
              <text x="${mapX(-16)}" y="${mapY(-56) + 3}" text-anchor="middle" fill="#FFF6E5" font-size="8" font-weight="800">Hồ Phóng Sinh</text>

              <rect x="${mapX(-44) - 26}" y="${mapY(-56) - 10}" width="52" height="20" rx="5" fill="#7E2A22" stroke="#FFD875" stroke-width="1.4"/>
              <text x="${mapX(-44)}" y="${mapY(-56) + 3}" text-anchor="middle" fill="#FFD875" font-size="7.5" font-weight="800">Lầu Chuông</text>

              <rect x="${mapX(22) - 36}" y="${mapY(-58) - 11}" width="72" height="22" rx="6" fill="#9E4B2E" stroke="#FFD875" stroke-width="1.5"/>
              <text x="${mapX(22)}" y="${mapY(-58) + 3}" text-anchor="middle" fill="#FFF6E5" font-size="8.2" font-weight="800">Tổ Đường</text>

              <rect x="${mapX(12) - 48}" y="${mapY(-38) - 11}" width="96" height="22" rx="6" fill="#f7efe0" stroke="#C9962E" stroke-width="1.6"/>
              <text x="${mapX(12)}" y="${mapY(-38) + 3}" text-anchor="middle" fill="#4A3222" font-size="8.2" font-weight="800">Phật Niết Bàn 32m</text>

              <circle cx="${mapX(-8)}" cy="${mapY(-37)}" r="12" fill="#e6b84c" stroke="#7E2A22" stroke-width="1.6"/>
              <text x="${mapX(-8)}" y="${mapY(-37) + 2.5}" text-anchor="middle" fill="#241409" font-size="7.2" font-weight="800">Tháp</text>

              <circle cx="${mapX(-9.5)}" cy="${mapY(-21)}" r="14" fill="#fffdf8" stroke="#4E86A8" stroke-width="1.8"/>
              <text x="${mapX(-9.5)}" y="${mapY(-21) + 2.5}" text-anchor="middle" fill="#5C381F" font-size="7.5" font-weight="900">A Di Đà</text>

              <!-- Khu Tây: Vườn Lâm Tỳ Ni, Hòn Non Bộ, Phật Di Lặc -->
              <circle cx="${mapX(-54)}" cy="${mapY(-4)}" r="16" fill="#d9c6a3" stroke="#5C381F" stroke-width="1.5"/>
              <text x="${mapX(-54)}" y="${mapY(-4) + 2.5}" text-anchor="middle" fill="#5C381F" font-size="7.2" font-weight="800">Non Bộ</text>
              <rect x="${mapX(-53.5) - 34}" y="${mapY(22) - 11}" width="68" height="22" rx="6" fill="#F6E9D2" stroke="#5C381F" stroke-width="1.5"/>
              <text x="${mapX(-53.5)}" y="${mapY(22) + 3}" text-anchor="middle" fill="#5C381F" font-size="7.5" font-weight="800">Lâm Tỳ Ni</text>
              <circle cx="${mapX(-24.5)}" cy="${mapY(8)}" r="17" fill="#fffdf8" stroke="#5C381F" stroke-width="1.8"/>
              <text x="${mapX(-24.5)}" y="${mapY(8) + 3}" text-anchor="middle" fill="#5C381F" font-size="7.8" font-weight="800">Di Lặc</text>

              <!-- Chánh Điện Đại Hùng Bửu Điện (Mở rộng 100+ bồ đoàn) -->
              <rect x="${axisX - 52}" y="${mapY(-26)}" width="104" height="${mapY(8) - mapY(-26)}" rx="7" fill="#D9A441" stroke="#7E2A22" stroke-width="2.2"/>
              <text x="${axisX}" y="${mapY(-9)}" text-anchor="middle" fill="#241409" font-size="8.6" font-weight="900">ĐẠI HÙNG BỬU ĐIỆN</text>
              <text x="${axisX}" y="${mapY(-1)}" text-anchor="middle" fill="#4A1A0E" font-size="7.2" font-weight="800">(100+ Bồ đoàn · 18 La Hán)</text>

              <!-- Khu Đông: Nhà Lưu Niệm Walkable (mở rộng), Giảng Đường, Trai Đường -->
              <rect x="${mapX(42.2) - 38}" y="${mapY(-34.2) - 12}" width="76" height="24" rx="6" fill="#C9592E" stroke="#FFF6E5" stroke-width="1.6"/>
              <text x="${mapX(42.2)}" y="${mapY(-34.2) + 3}" text-anchor="middle" fill="#FFF6E5" font-size="7.6" font-weight="900">Tạp Hóa · Lưu Niệm</text>

              <rect x="${mapX(58.5) - 30}" y="${mapY(-18) - 11}" width="60" height="22" rx="6" fill="#8A4A34" stroke="#f6cd72" stroke-width="1.5"/>
              <text x="${mapX(58.5)}" y="${mapY(-18) + 3}" text-anchor="middle" fill="#FFF6E5" font-size="7.6" font-weight="800">Giảng Đường</text>

              <rect x="${mapX(58.5) - 32}" y="${mapY(14) - 11}" width="64" height="22" rx="6" fill="#7A4924" stroke="#FFD875" stroke-width="1.5"/>
              <text x="${mapX(58.5)}" y="${mapY(14) + 3}" text-anchor="middle" fill="#FFF6E5" font-size="7.6" font-weight="800">Trai Đường</text>

              <!-- Hồ Sen Koi & 2 Cổng -->
              <ellipse cx="${mapX(3.5)}" cy="${mapY(31)}" rx="30" ry="12" fill="#3B6E5C" stroke="#8fc9b3" stroke-width="1.5"/>
              <text x="${mapX(3.5)}" y="${mapY(31) + 3}" text-anchor="middle" fill="#FFF6E5" font-size="7.8" font-weight="800">Hồ Sen Koi</text>

              <rect x="${axisX - 42}" y="${mapY(41.5) - 8}" width="84" height="16" rx="4" fill="#7E2A22" stroke="#FFD875" stroke-width="1.6"/>
              <text x="${axisX}" y="${mapY(41.5) + 3}" text-anchor="middle" fill="#FFD875" font-size="7.8" font-weight="900">CỔNG TAM QUAN</text>
              <rect x="${mapX(40.5) - 28}" y="${mapY(41.5) - 8}" width="56" height="16" rx="4" fill="#5C381F" stroke="#FFD875" stroke-width="1.5"/>
              <text x="${mapX(40.5)}" y="${mapY(41.5) + 3}" text-anchor="middle" fill="#FFF6E5" font-size="7.5" font-weight="900">CỔNG PHỤ</text>

              <!-- 2. ĐƯỜNG THẲNG VÀO CHÙA VĨNH TRÀNG (170m từ Cổng Phụ ra Đường Nguyễn Trung Trực) -->
              <rect x="${mapX(32.0)}" y="${mapY(42)}" width="${mapX(49.5) - mapX(32.0)}" height="${mapY(168) - mapY(42)}" fill="#c8beb0" stroke="#9b8d7a" stroke-width="1.2"/>
              <line x1="${mapX(40.7)}" y1="${mapY(48)}" x2="${mapX(40.7)}" y2="${mapY(162)}" stroke="#FFF7E2" stroke-width="1.6" stroke-dasharray="6,6"/>
              <text x="${mapX(40.7)}" y="${mapY(108)}" text-anchor="middle" fill="#4A3222" font-size="7.6" font-weight="800" transform="rotate(-90 ${mapX(40.7)} ${mapY(108)})">ĐƯỜNG VÀO CHÙA VĨNH TRÀNG (170m)</text>

              <!-- 3. CÔNG VIÊN VĨNH TRÀNG THỰC TẾ (OSM way/266761436: x = -26..31.2, z = 54..168) -->
              <g id="map2d-park-zone" style="cursor:pointer;">
                <rect x="${mapX(-26)}" y="${mapY(54)}" width="${mapX(31.2) - mapX(-26)}" height="${mapY(168) - mapY(54)}" rx="10" fill="#A9D396" stroke="#2D6B3D" stroke-width="2.2"/>
                <!-- Đường dạo chữ thập & đường chéo xuyên quảng trường tròn -->
                <line x1="${mapX(8)}" y1="${mapY(55)}" x2="${mapX(8)}" y2="${mapY(167)}" stroke="#E6DAC3" stroke-width="5.5"/>
                <line x1="${mapX(-25)}" y1="${mapY(70)}" x2="${mapX(30.5)}" y2="${mapY(70)}" stroke="#E6DAC3" stroke-width="4.2"/>
                <line x1="${mapX(-25)}" y1="${mapY(104)}" x2="${mapX(30.5)}" y2="${mapY(104)}" stroke="#E6DAC3" stroke-width="5.5"/>
                <line x1="${mapX(-25)}" y1="${mapY(138)}" x2="${mapX(30.5)}" y2="${mapY(138)}" stroke="#E6DAC3" stroke-width="4.2"/>
                <line x1="${mapX(-18)}" y1="${mapY(66)}" x2="${mapX(28)}" y2="${mapY(144)}" stroke="#E6DAC3" stroke-width="3.2"/>
                <line x1="${mapX(28)}" y1="${mapY(66)}" x2="${mapX(-18)}" y2="${mapY(144)}" stroke="#E6DAC3" stroke-width="3.2"/>
                <!-- Quảng trường tròn & Đài phun nước hoa sen -->
                <circle cx="${mapX(8)}" cy="${mapY(104)}" r="22" fill="#E8DBC2" stroke="#B5684A" stroke-width="2.4"/>
                <circle cx="${mapX(8)}" cy="${mapY(104)}" r="10" fill="#4BA3B5" stroke="#FFF6E5" stroke-width="1.6"/>
                <circle cx="${mapX(8)}" cy="${mapY(104)}" r="4" fill="#F08AA8"/>
                <!-- Chòi Lục Giác & Khu Thể Dục Công Viên -->
                <polygon points="${mapX(-8)},${mapY(82) - 10} ${mapX(-8) + 9},${mapY(82) - 5} ${mapX(-8) + 9},${mapY(82) + 5} ${mapX(-8)},${mapY(82) + 10} ${mapX(-8) - 9},${mapY(82) + 5} ${mapX(-8) - 9},${mapY(82) - 5}" fill="#B94B2B" stroke="#FFD875" stroke-width="1.3"/>
                <text x="${mapX(-8)}" y="${mapY(82) + 19}" text-anchor="middle" fill="#214A2B" font-size="7.2" font-weight="800">Chòi Lục Giác</text>
                <rect x="${mapX(19.5) - 16}" y="${mapY(86) - 9}" width="32" height="18" rx="4" fill="#1D5D9B" stroke="#F2C94C" stroke-width="1.3"/>
                <text x="${mapX(19.5)}" y="${mapY(86) + 3}" text-anchor="middle" fill="#FFFFFF" font-size="6.8" font-weight="800">Thể dục</text>
                <text x="${mapX(8)}" y="${mapY(154)}" text-anchor="middle" fill="#144524" font-size="9.2" font-weight="900">CÔNG VIÊN VĨNH TRÀNG (TP. MỸ THO)</text>
                <text x="${mapX(8)}" y="${mapY(163)}" text-anchor="middle" fill="#235733" font-size="7.5" font-weight="700">Đài phun nước hoa sen · Vườn bông giấy · Lối dạo bộ</text>
              </g>

              <!-- 4. PHỐ MỸ THO & BÃI GIỮ XE PHÍA ĐÔNG ĐƯỜNG VÀO CHÙA -->
              <rect x="${mapX(50.5)}" y="${mapY(54)}" width="${mapX(72) - mapX(50.5)}" height="${mapY(166) - mapY(54)}" rx="8" fill="#E9DFC8" stroke="#A6957C" stroke-width="1.4"/>
              <text x="${mapX(61)}" y="${mapY(92)}" text-anchor="middle" fill="#5C381F" font-size="8" font-weight="800">Bãi Giữ Xe</text>
              <text x="${mapX(61)}" y="${mapY(104)}" text-anchor="middle" fill="#5C381F" font-size="8" font-weight="800">&amp; Phố Mỹ Tho</text>

              <!-- 5. ĐƯỜNG NGUYỄN TRUNG TRỰC (TRỤC CHÍNH PHÍA NAM) -->
              <rect x="26" y="${mapY(166)}" width="720" height="24" rx="5" fill="#bfb5a4" stroke="#8B7E6A" stroke-width="1.2"/>
              <text x="386" y="${mapY(166) + 15}" text-anchor="middle" fill="#3B2415" font-size="9.5" font-weight="900">ĐƯỜNG NGUYỄN TRUNG TRỰC · PHƯỜNG 8, TP. MỸ THO, TIỀN GIANG</text>

              ${PILGRIMAGE_STATIONS.map((st) => {
                const pinShift = {
                  cong_tam_quan: { dx: 0, dy: -11 },
                  ho_sen_ca_koi: { dx: 0, dy: -11 },
                  phat_adida: { dx: -16, dy: 0 },
                  phat_di_lac: { dx: 0, dy: -14 },
                  lu_huong_san: { dx: 0, dy: -4 },
                  chanh_dien: { dx: 38, dy: -10 },
                  cua_hang_luu_niem: { dx: -20, dy: -10 },
                  giang_duong: { dx: -18, dy: -10 },
                  phat_niet_ban: { dx: 32, dy: -10 }
                }[st.key] || { dx: 0, dy: -10 };
                const sx = mapX(st.pos.x) + pinShift.dx;
                const sy = mapY(st.pos.z) + pinShift.dy;
                const isAct = this.activeStationKey === st.key;
                return `
                  <g class="map2d-station-pin" data-station-key="${st.key}" style="cursor:pointer;">
                    <circle cx="${sx}" cy="${sy}" r="${isAct ? 9 : 7}" fill="${isAct ? '#C96F4A' : '#5C381F'}" stroke="#FFF6E5" stroke-width="1.8"/>
                    <text x="${sx}" y="${sy + 2.6}" text-anchor="middle" fill="#FFF6E5" font-size="7.6" font-weight="900">${st.id + 1}</text>
                  </g>
                `;
              }).join('')}

              ${DISCOVERY_ZONES.map((dz, idx) => {
                const sx = mapX(dz.pos.x);
                const sy = mapY(dz.pos.z) - 9;
                const isAct = this.activeStationKey === dz.key;
                return `
                  <g class="map2d-station-pin" data-station-key="${dz.key}" style="cursor:pointer;">
                    <circle cx="${sx}" cy="${sy}" r="${isAct ? 8.5 : 6.5}" fill="${isAct ? '#B84518' : '#7E2A22'}" stroke="#FFD875" stroke-width="1.6"/>
                    <text x="${sx}" y="${sy + 2.4}" text-anchor="middle" fill="#FFF6E5" font-size="7.2" font-weight="900">${String.fromCharCode(65 + idx)}</text>
                  </g>
                `;
              }).join('')}

              <g transform="translate(${px}, ${py})">
                <circle r="11" fill="rgba(255, 196, 46, 0.48)"/>
                <circle r="6" fill="#FFD875" stroke="#7E2A22" stroke-width="2.2"/>
              </g>
            </svg>
          </div>

          <div style="font-size:14.5px;font-weight:800;color:#5C381F;margin-bottom:6px;">9 Điểm Hành Hương Chính (Dấu Ấn Sen Vàng)</div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px;">
            ${PILGRIMAGE_STATIONS.map((st) => {
              const visited = this.spiritual.visitedStations.includes(st.id);
              return `
              <div style="background:#fffdf8;border:1.5px solid ${
                visited ? '#5C381F' : 'rgba(140,100,60,0.28)'
              };border-radius:16px;padding:12px 14px;display:flex;flex-direction:column;justify-content:space-between;gap:8px;">
                <div>
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11.5px;font-weight:700;color:#5C381F;">${st.zoneCode}</span>
                    <span style="font-size:11px;font-weight:700;color:${visited ? '#8C5327' : '#8a623c'};">${
                      visited ? 'Đã ghé' : 'Chưa ghé'
                    }</span>
                  </div>
                  <div style="font-size:15px;font-weight:800;margin-top:3px;">${st.name}</div>
                  <p style="font-size:12.5px;color:#52361c;margin-top:4px;line-height:1.4;">${st.subtitle}</p>
                </div>
                <div style="display:flex;gap:5px;flex-wrap:wrap;">
                  <button class="visit-station-btn product-detail-btn" data-station-key="${st.key}" style="flex:1;height:34px;font-size:12px;">
                    Đi tới
                  </button>
                  <button class="teleport-station-btn product-detail-btn" data-station-key="${st.key}" style="width:auto;padding:0 10px;height:34px;font-size:12px;background:#C96F4A;">
                    Tới thẳng
                  </button>
                  <button class="guide-station-btn product-detail-btn" data-guide-station="${st.key}" style="width:auto;padding:0 9px;height:34px;font-size:12px;background:#9A6E1C;" title="Bật tia sáng dẫn đường 3D">
                    🧭 Dẫn đường
                  </button>
                </div>
              </div>
            `;
            }).join('')}
          </div>

          <div style="font-size:14.5px;font-weight:800;color:#7E2A22;margin-bottom:6px;">${DISCOVERY_ZONES.length} Khu Cảnh Quan Mở Rộng Khám Phá</div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
            ${DISCOVERY_ZONES.map((dz, idx) => `
              <div style="background:#fffbf2;border:1.5px solid rgba(190,136,52,0.42);border-radius:16px;padding:12px 14px;display:flex;flex-direction:column;justify-content:space-between;gap:8px;">
                <div>
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:11.5px;font-weight:800;color:#7E2A22;">${dz.zoneCode} · Khu ${String.fromCharCode(65 + idx)}</span>
                    <span style="font-size:11px;font-weight:700;color:#8C5327;">Mở rộng</span>
                  </div>
                  <div style="font-size:14.5px;font-weight:800;margin-top:3px;color:#241409;">${dz.name}</div>
                  <p style="font-size:12px;color:#52361c;margin-top:4px;line-height:1.4;">${dz.subtitle}</p>
                </div>
                <div style="display:flex;gap:5px;flex-wrap:wrap;">
                  <button class="visit-station-btn product-detail-btn" data-station-key="${dz.key}" style="flex:1;height:34px;font-size:12px;">
                    Đi tới
                  </button>
                  <button class="teleport-station-btn product-detail-btn" data-station-key="${dz.key}" style="width:auto;padding:0 10px;height:34px;font-size:12px;background:#7E2A22;">
                    Tới thẳng
                  </button>
                  <button class="guide-station-btn product-detail-btn" data-guide-station="${dz.key}" style="width:auto;padding:0 9px;height:34px;font-size:12px;background:#9A6E1C;" title="Bật tia sáng dẫn đường 3D">
                    🧭 Dẫn đường
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        `;
        box.querySelectorAll('.visit-station-btn, .map2d-station-pin').forEach((b) => {
          b.addEventListener('click', () => {
            const key = b.getAttribute('data-station-key') || 'chanh_dien';
            this.closeModal();
            this.switchScreen('courtyard');
            this.walkToStationIn3D(key);
          });
        });
        box.querySelectorAll('.teleport-station-btn').forEach((b) => {
          b.addEventListener('click', () => {
            const key = b.getAttribute('data-station-key') || 'chanh_dien';
            this.closeModal();
            this.switchScreen('courtyard');
            this.teleportToStationIn3D(key);
          });
        });
        box.querySelectorAll('.guide-station-btn').forEach((b) => {
          b.addEventListener('click', () => {
            const key = b.getAttribute('data-guide-station') || 'chanh_dien';
            this.activateGuidedBeacon(key);
          });
        });
        const goToCongVien = () => {
          this.closeModal();
          this.switchScreen('courtyard');
          if (this.world3d?.insideInterior) this.toggleInteriorHallIn3D(false);
          if (this.world3d?.playerState) {
            this.world3d.cancelAutoWalk?.();
            this.world3d.playerState.x = 26.0;
            this.world3d.playerState.z = 104.0;
            this.world3d.playerState.yaw = -Math.PI / 2;
            this.world3d.cameraBaseYaw = -Math.PI / 2;
            this.world3d.cameraAzimuthOffset = 0;
            this.world3d.syncPlayerTransform?.(true);
            this.world3d.checkStationProximity?.();
            this.world3d.renderFrame?.();
          }
          this.playBellTone(324, 1.8);
          this.showToast(
            '🌳 Công Viên Vĩnh Tràng (Ngoài Chùa)',
            'Đài phun nước hoa sen trung tâm, 4 lối dạo lát đá hướng tâm, chòi lục giác và đường Nguyễn Trung Trực.',
            4200,
            false
          );
        };
        document.getElementById('btn-map-goto-park')?.addEventListener('click', goToCongVien);
        document.getElementById('map2d-park-zone')?.addEventListener('click', goToCongVien);
        document.getElementById('btn-map-goto-shop')?.addEventListener('click', () => {
          this.closeModal();
          this.switchScreen('courtyard');
          if (this.world3d?.insideInterior) this.toggleInteriorHallIn3D(false);
          if (this.world3d?.playerState) {
            this.world3d.cancelAutoWalk?.();
            this.world3d.playerState.x = 42.2;
            this.world3d.playerState.z = -31.8;
            this.world3d.playerState.yaw = Math.PI;
            this.world3d.cameraBaseYaw = Math.PI;
            this.world3d.cameraAzimuthOffset = 0;
            this.world3d.syncPlayerTransform?.(true);
            this.world3d.checkStationProximity?.();
            this.world3d.renderFrame?.();
          }
          this.playMokugyoTap?.();
          this.showToast(
            '🛍️ Bên trong Nhà Lưu Niệm & Tiệm Tạp Hóa',
            'Mời cô bác đi dạo giữa các kệ đặc sản chay Mỹ Tho hoặc bấm [E] để mở quầy hàng & đặt mua Shopee.',
            4200,
            false
          );
        });
      } else if (sub === 'quests') {
        const quests = getQuestsWithProgress(this.activityHub, this.spiritual, this.completedLessons.size);
        box.innerHTML = `
          <div class="activity-banner-row">
            <div>
              <div style="font-size:16px;font-weight:800;color:#FFD875;">🎯 Nhiệm vụ Hành hương &amp; Công đức</div>
              <div style="font-size:13px;color:#FFF6E5;margin-top:2px;">Hoàn thành mỗi việc lành nhận thêm điểm Sen 🪷 và Ngọc 💎 để thỉnh lễ vật, áo tràng.</div>
            </div>
            <div style="display:flex;gap:8px;align-items:center;">
              <span class="store-wallet-pill">🪷 ${this.storeProfile.lotusPoints}</span>
              <span class="store-wallet-pill">💎 ${this.storeProfile.gems}</span>
            </div>
          </div>
          <div class="quests-grid">
            ${quests.map((q) => {
              const pct = Math.min(100, Math.round((q.current / q.target) * 100));
              return `
              <div class="quest-card ${q.claimed ? 'claimed' : q.claimable ? 'claimable' : ''}">
                <div class="quest-card-head">
                  <span class="quest-cat-pill">${q.icon} ${q.category}</span>
                  <span class="quest-reward-text">+${q.rewardLotus} 🪷 · +${q.rewardGems} 💎</span>
                </div>
                <div class="quest-card-title">${q.title}</div>
                <div class="quest-card-desc">${q.desc}</div>
                <div class="quest-progress-track">
                  <div class="quest-progress-fill" style="width:${pct}%"></div>
                </div>
                <div class="quest-card-foot">
                  <span class="quest-progress-lbl">Tiến độ: ${q.current}/${q.target}</span>
                  ${
                    q.claimed
                      ? `<span class="quest-done-tag">✓ Đã nhận thưởng</span>`
                      : q.claimable
                      ? `<button type="button" class="quest-claim-btn" data-explore-claim-quest="${q.id}">🎁 Nhận thưởng</button>`
                      : `<button type="button" class="quest-go-btn" data-explore-go-quest="${q.actionHint}">Làm ngay →</button>`
                  }
                </div>
              </div>`;
            }).join('')}
          </div>
        `;
        box.querySelectorAll('[data-explore-claim-quest]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const qid = btn.getAttribute('data-explore-claim-quest');
            const res = claimQuestReward(
              this.activityHub,
              this.storeProfile,
              this.spiritual,
              this.completedLessons.size,
              qid
            );
            this.activityHub = res.activity;
            this.storeProfile = res.storeProfile;
            this.saveState();
            this.updateActionBadges();
            if (res.ok) {
              this.playBellTone(324, 2.0);
              this.showToast('🎁 Nhận thưởng nhiệm vụ', res.message, 3600, false);
            }
            renderSub('quests');
          });
        });
        box.querySelectorAll('[data-explore-go-quest]').forEach((btn) => {
          btn.addEventListener('click', () => {
            this.executeQuestActionHint(btn.getAttribute('data-explore-go-quest'));
          });
        });
      } else if (sub === 'shop_offerings') {
        const items = filterMarketplaceItems(shopCatFilter);
        box.innerHTML = `
          <div class="activity-banner-row">
            <div>
              <div style="font-size:16px;font-weight:800;color:#FFD875;">🛍️ Mua Đồ Chay · Nhang Đèn · Lễ Vật Dâng Phật</div>
              <div style="font-size:13px;color:#FFF6E5;margin-top:2px;">Dùng điểm Sen 🪷 để thỉnh lễ vật dâng cúng ngay hoặc thêm vào giỏ quà lưu niệm.</div>
            </div>
            <div style="display:flex;gap:8px;align-items:center;">
              <span class="store-wallet-pill">🪷 ${this.storeProfile.lotusPoints}</span>
              <button type="button" id="btn-explore-open-9tab-store" class="quest-claim-btn" style="background:#C96F4A;">Tủ đồ Áo tràng 3D</button>
            </div>
          </div>
          <div class="market-tabs-row">
            ${MARKETPLACE_STALL_CATEGORIES.map((cat) => `
              <button type="button" class="market-tab-pill ${shopCatFilter === cat.id ? 'active' : ''}" data-explore-shop-cat="${cat.id}">
                <span>${cat.icon}</span><span>${cat.label}</span>
              </button>
            `).join('')}
          </div>
          <div class="market-items-grid" style="max-height:46vh;overflow-y:auto;padding-right:4px;">
            ${items.map((item) => {
              const shopee = resolveShopeeAffiliateUrl(item.id, item.name, this.shopeeAffiliateOverrides);
              return `
              <article class="market-item-card">
                <div class="market-item-top">
                  <div class="market-item-icon">
                    ${
                      item.image
                        ? `<img src="${item.image}" alt="${item.name}" class="market-item-thumb-img" onerror="this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='inline';" /><span style="display:none;">${item.icon}</span>`
                        : `<span>${item.icon}</span>`
                    }
                  </div>
                  <div style="flex:1;min-width:0;">
                    <div class="market-item-title">${item.name}</div>
                    <div class="market-item-prices">
                      <span class="market-price-vnd">${item.priceVnd.toLocaleString('vi-VN')}đ</span>
                      <span class="market-price-lotus">🪷 ${item.lotusCost}</span>
                    </div>
                  </div>
                </div>
                <p class="market-item-desc">${item.desc}</p>
                <div class="market-item-actions">
                  <button type="button" class="market-btn-use" data-explore-use="${item.id}">Thỉnh dâng ngay</button>
                  <button type="button" class="market-btn-cart" data-explore-cart="${item.id}">+ Giỏ hàng</button>
                </div>
                <a class="market-btn-shopee" href="${shopee.url}" target="_blank" rel="noopener noreferrer">
                  🛒 ${shopee.label}
                </a>
              </article>
            `;
            }).join('')}
          </div>
        `;
        document.getElementById('btn-explore-open-9tab-store')?.addEventListener('click', () => {
          this.openNineTabStoreModal('ao_trang');
        });
        box.querySelectorAll('[data-explore-shop-cat]').forEach((btn) => {
          btn.addEventListener('click', () => {
            shopCatFilter = btn.getAttribute('data-explore-shop-cat') || 'huong_hoa';
            renderSub('shop_offerings');
          });
        });
        box.querySelectorAll('[data-explore-use]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-explore-use');
            const res = purchaseMarketplaceItem(this.storeProfile, this.spiritual, this.cart, id, 'use_now');
            if (!res.ok) {
              this.showToast('Chưa đủ điểm Sen', res.message, 3200);
              return;
            }
            this.storeProfile = res.storeProfile;
            this.spiritual = res.spiritual;
            this.cart = res.cart;
            this.saveState();
            this.updateActionBadges();
            this.playBellTone(324, 1.8);
            this.showToast('🪷 Đã thỉnh lễ vật', res.message, 3600, false);
            renderSub('shop_offerings');
          });
        });
        box.querySelectorAll('[data-explore-cart]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-explore-cart');
            const res = purchaseMarketplaceItem(this.storeProfile, this.spiritual, this.cart, id, 'cart');
            if (res.ok) {
              this.cart = res.cart;
              this.saveState();
              this.updateActionBadges();
              this.playMokugyoTap();
              this.showToast('🛒 Đã thêm vào giỏ quà', res.message, 2800, false);
            }
          });
        });
      } else if (sub === 'imprint') {
        const curImprint = calculateJourneyImprint(this.spiritual);
        box.innerHTML = `
          <div style="background:#5C381F;color:#FFF6E5;padding:16px 20px;border-radius:18px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;">
            <div>
              <div style="font-size:18px;font-weight:800;color:#FFD875;">Những nơi đã ghé thăm</div>
              <div style="font-size:13.5px;opacity:0.92;margin-top:3px;">Mỗi cánh sen sáng lên khi bạn dạo bước ghé thăm một góc trong khuôn viên Chùa Vĩnh Tràng.</div>
            </div>
            <div style="display:flex;gap:6px;align-items:center;">
              ${curImprint.petals
                .map(
                  (p) =>
                    `<span title="${p.name}" style="font-size:22px;filter:${
                      p.lit ? 'none' : 'grayscale(1) opacity(0.38)'
                    };">🪷</span>`
                )
                .join('')}
            </div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
            ${curImprint.petals
              .map(
                (p) => `
              <div style="background:#fffdf8;border:1.5px solid ${
                p.lit ? '#C9962E' : 'rgba(140,100,60,0.25)'
              };border-radius:14px;padding:12px 14px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <strong style="font-size:14px;color:#5C381F;">${p.pinLabel}</strong>
                  <span style="font-size:12px;font-weight:800;color:${p.lit ? '#C9962E' : '#8a623c'};">
                    ${p.lit ? '🪷 Đã ghé thăm' : '○ Chưa ghé'}
                  </span>
                </div>
                <p style="font-size:12.5px;color:#4A3222;margin-top:5px;line-height:1.4;">${p.subtitle}</p>
              </div>
            `
              )
              .join('')}
          </div>
        `;
      } else if (sub === 'arhats') {
        const renderArhatMuseum = () => {
          const a = EIGHTEEN_ARHATS[selectedArhatIdx] || EIGHTEEN_ARHATS[0];
          box.innerHTML = `
            <div class="arhat-museum-layout">
              <div class="arhat-stage-panel">
                <div class="arhat-3d-viewport">
                  <canvas id="arhat-3d-canvas"></canvas>
                  <span class="profile-stage-hint">Kéo để xoay 360°</span>
                  <span class="arhat-idx-chip">Tôn tượng ${a.id}/18</span>
                </div>
                <button type="button" id="btn-arhat-goto-hall" class="product-detail-btn" style="width:100%;height:44px;background:#7E2A22;">
                  🏛️ Tới tượng trong Chánh điện
                </button>
              </div>

              <div class="arhat-plaque-card">
                <div>
                  <div class="arhat-plaque-eyebrow">Vị thứ ${a.id}/18 · ${a.title}</div>
                  <h4 class="arhat-plaque-name">${a.name}</h4>
                  <div class="arhat-emblem-pill">🪷 Pháp bảo &amp; Linh thú: ${a.emblem}</div>
                  <p class="arhat-plaque-meaning">${a.meaning}</p>
                </div>

                <div class="arhat-plaque-actions">
                  <button type="button" id="btn-arhat-prev" class="daily-dharma-secondary-btn">← Vị trước</button>
                  <button type="button" id="btn-arhat-tts" class="daily-dharma-primary-btn">🔊 Nghe giới thiệu</button>
                  <button type="button" id="btn-arhat-next" class="daily-dharma-secondary-btn">Vị tiếp →</button>
                </div>
              </div>
            </div>

            <div class="arhat-rail-18" role="tablist" aria-label="Chọn 1 trong 18 vị La Hán">
              ${EIGHTEEN_ARHATS.map(
                (item, idx) => `
                <button type="button" class="arhat-rail-btn ${idx === selectedArhatIdx ? 'active' : ''}" data-arhat-jump="${idx}" title="${item.title} — ${item.name}">
                  <span class="arhat-rail-num">${item.id}</span>
                  <span class="arhat-rail-title">${item.title.replace(' La Hán', '')}</span>
                </button>
              `
              ).join('')}
            </div>
          `;

          this.mountArhat3DStage('arhat-3d-canvas', selectedArhatIdx);

          document.getElementById('btn-arhat-prev')?.addEventListener('click', () => {
            selectedArhatIdx = (selectedArhatIdx + 17) % 18;
            this.playMokugyoTap();
            renderArhatMuseum();
          });
          document.getElementById('btn-arhat-next')?.addEventListener('click', () => {
            selectedArhatIdx = (selectedArhatIdx + 1) % 18;
            this.playMokugyoTap();
            renderArhatMuseum();
          });
          document.getElementById('btn-arhat-tts')?.addEventListener('click', () => {
            const text = `Vị thứ ${a.id}: ${a.title}, ${a.name}. Đặc trưng: ${a.emblem}. ${a.meaning}`;
            this.ensureAudioContext();
            const spoke = this.audio?.speakText?.(text, { rate: this.readAlongRate || 1.0, lang: 'vi-VN', pitch: 0.98 });
            this.playBellTone(360, 1.4);
            this.showToast(
              spoke ? `🙏 ${a.title}` : `🙏 ${a.title} (Bản đọc chữ)`,
              spoke ? a.meaning : `${a.meaning} (Thiết bị chưa cài giọng đọc tiếng Việt — mời cô bác đọc nội dung trên thẻ.)`,
              4500,
              false
            );
          });
          document.getElementById('btn-arhat-goto-hall')?.addEventListener('click', () => {
            const targetIdx = selectedArhatIdx;
            this.closeModal();
            this.switchScreen('courtyard');
            if (!this.world3d?.insideInterior) {
              this.toggleInteriorHallIn3D(true);
            }
            setTimeout(() => {
              this.world3d?.focusInteriorArhat?.(targetIdx);
            }, 350);
          });
          box.querySelectorAll('[data-arhat-jump]').forEach((btn) => {
            btn.addEventListener('click', () => {
              selectedArhatIdx = Number(btn.getAttribute('data-arhat-jump') || 0);
              this.playMokugyoTap();
              renderArhatMuseum();
            });
          });
        };
        renderArhatMuseum();
      } else if (sub === 'sweep') {
        const todayKey = getLocalDateKey();
        this.activityHub = ensureDailyMissionDate(this.activityHub, todayKey);
        const collectedIds = this.activityHub?.courtyardTasks?.collectedIds || [];
        box.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:12px;">
            <div class="activity-banner-row">
              <div>
                <div style="font-size:16px;font-weight:800;color:#FFD875;">🍂 Quét Lá Bồ Đề Vàng Sân Chùa (${collectedIds.length}/${COURTYARD_LEAF_SPOTS.length} hôm nay)</div>
                <div style="font-size:13px;color:#FFF6E5;margin-top:2px;">Nhặt trực tiếp lá vàng phát sáng trên sân 3D hoặc bấm đi tới từng điểm (+15 🪷 · +15 XP mỗi lá, cứ 4 lá thưởng thêm +1 💎).</div>
              </div>
              <div class="store-wallet-pill">Tổng đã quét: ${this.activityHub?.courtyardTasks?.totalSwept || this.spiritual.leavesSwept}</div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px;">
              ${COURTYARD_LEAF_SPOTS.map((sp) => {
                const done = collectedIds.includes(sp.id);
                return `
                <div style="background:#fffdf8;border:1.5px solid ${done ? '#3D6B4A' : 'rgba(140,100,60,0.28)'};border-radius:14px;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;gap:10px;">
                  <div>
                    <div style="font-size:13.5px;font-weight:800;color:#5C381F;">${done ? '✓' : '🍂'} ${sp.label}</div>
                    <div style="font-size:12px;color:#6E5034;margin-top:2px;">${done ? 'Đã quét sạch hôm nay' : 'Đang rụng lá vàng trên sân 3D'}</div>
                  </div>
                  ${
                    done
                      ? `<span class="quest-done-tag">Xong</span>`
                      : `<button type="button" class="quest-go-btn" data-sweep-walk="${sp.id}">🚶 Đi quét</button>`
                  }
                </div>`;
              }).join('')}
            </div>
          </div>
        `;
        box.querySelectorAll('[data-sweep-walk]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const lid = btn.getAttribute('data-sweep-walk');
            const spot = COURTYARD_LEAF_SPOTS.find((s) => s.id === lid);
            if (!spot) return;
            this.closeModal();
            this.switchScreen('courtyard');
            if (this.world3d?.insideInterior) this.toggleInteriorHallIn3D(false);
            this.world3d?.walkToPoint?.(spot.pos.x, spot.pos.z, spot.label);
            this.showToast('🍂 Đang đi tới quét lá Bồ Đề', `Bấm trực tiếp vào lá vàng hoặc nhấn [E] khi tới ${spot.label}.`, 3600, false);
          });
        });
      }
    };

    renderSub(initialSubTab);

    document.querySelectorAll('.explore-sub-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sub = btn.getAttribute('data-sub') || 'stations';
        renderSub(sub);
      });
    });

    document.getElementById('btn-explore-open-ugc')?.addEventListener('click', () => {
      this.openUGCStudioModal();
    });

    document.getElementById('btn-explore-open-interior')?.addEventListener('click', () => {
      this.closeModal();
      this.switchScreen('courtyard');
      this.toggleInteriorHallIn3D(true);
    });
  },

  /* ========================================================================
     TÀI KHOẢN, QUỐC TỊCH, ĐOÀN HÀNH HƯƠNG & TỦ ĐỒ 7 NHÂN VẬT 3D
     ======================================================================== */
  openAccountModal() {
    const wearableItems = SHOP_CATALOG.filter((item) =>
      [
        'ao_trang_phat_tu',
        'tui_vai_theu_sen',
        'non_la_theu_sen',
        'khan_ran_nam_bo',
        'trang_hat_go',
        'so_tay_hoa_sen',
        'quat_nan_gio_may',
        'den_hoa_sen_pha_le_3d'
      ].includes(item.id)
    );

    const storeWearables = STORE_ITEMS_CATALOG.filter((item) => {
      const wearableSlot = ['robe', 'hat', 'mat', 'mala', 'handItem', 'instrument', 'cloud', 'pet'].includes(item.slot);
      if (!wearableSlot) return false;
      const owned = (this.storeProfile?.ownedCounts?.[item.id] || 0) > 0;
      const equipped = this.storeProfile?.equipped?.[item.slot] === item.id;
      return owned || equipped;
    });

    const activeProf =
      CHARACTER_PROFILES.find((c) => c.key === this.characterModelKey) || CHARACTER_PROFILES[0];
    const activeNat = getNationalityProfile(this.nationalityId);
    const activeMode = getPilgrimageMode(this.pilgrimageModeId);
    this.profilePreviewPose = this.profilePreviewPose || 'Dung';
    const activeVisual = this.buildStoreVisualPayload();
    const activeOutfitText = activeVisual.robeName
      ? `${activeVisual.robeName}${activeVisual.bag ? ' & Túi vải sen' : ''}`
      : activeProf.outfitName;

    this.openModal(
      'Hồ sơ · Quốc tịch · Đoàn hành hương',
      `
      <div class="profile-modal-layout">
        <div class="profile-stage-card">
          <div class="profile-3d-viewport" id="profile-3d-viewport">
            <canvas id="character-3d-canvas"></canvas>
            <div class="profile-stage-hint">Kéo để xoay 360°</div>
            <div class="profile-pose-pills">
              <button type="button" class="profile-pose-btn ${this.profilePreviewPose === 'Dung' ? 'active' : ''}" data-profile-pose="Dung">Đứng</button>
              <button type="button" class="profile-pose-btn ${this.profilePreviewPose === 'Chắp tay' ? 'active' : ''}" data-profile-pose="Chắp tay">Chắp tay</button>
              <button type="button" class="profile-pose-btn ${this.profilePreviewPose === 'Quỳ' ? 'active' : ''}" data-profile-pose="Quỳ">Quỳ</button>
            </div>
          </div>
          <div class="profile-char-name">${activeNat.flag} ${activeProf.name} (${activeProf.heightLabel})</div>
          <div class="profile-char-sub">${activeOutfitText} · ${activeMode.name}</div>
          <div class="profile-char-switch-row">
            ${CHARACTER_PROFILES.map(
              (c) => `
              <button type="button" class="char-switch-btn ${this.characterModelKey === c.key ? 'active' : ''}" data-char="${c.key}">
                ${c.name.split('(')[0].trim()}
              </button>
            `
            ).join('')}
          </div>
          <button type="button" id="btn-account-replay-arrival" class="quest-go-btn" style="width:100%;min-height:44px;margin-top:8px;">
            🚗 Xem lại xe đưa tới chùa
          </button>
        </div>

        <div class="profile-right-col">
          <div class="profile-stats-banner">
            <div><div class="profile-stat-val">${this.spiritual.bowCount}</div><div class="profile-stat-lbl">Lạy Phật</div></div>
            <div><div class="profile-stat-val">${this.spiritual.incenseOfferings}</div><div class="profile-stat-lbl">Lần dâng hương</div></div>
            <div><div class="profile-stat-val">${this.spiritual.malaCycles * 108 + this.spiritual.malaBeads}</div><div class="profile-stat-lbl">Biến niệm Phật</div></div>
            <div><div class="profile-stat-val">${this.completedLessons.size}/24</div><div class="profile-stat-lbl">Bài đã học</div></div>
          </div>

          <div>
            <div class="profile-wardrobe-heading">Quốc tịch &amp; Truyền thống hành hương (${activeNat.flag} ${activeNat.name.split('—')[0].trim()}):</div>
            <div class="profile-nat-pills">
              ${NATIONALITY_PROFILES.map(
                (n) => `
                <button type="button" class="profile-chip-btn ${this.nationalityId === n.id ? 'active' : ''}" data-acc-nat="${n.id}">
                  ${n.flag} ${n.name.split('—')[0].trim()}
                </button>`
              ).join('')}
            </div>
          </div>

          <div>
            <div class="profile-wardrobe-heading">Chế độ &amp; Bạn đồng hành 3D (${activeMode.companions.length} người đi cùng):</div>
            <div class="profile-mode-pills">
              ${PILGRIMAGE_MODES.map(
                (m) => `
                <button type="button" class="profile-chip-btn ${this.pilgrimageModeId === m.id ? 'active' : ''}" data-acc-mode="${m.id}">
                  ${m.name} (${m.companions.length > 0 ? `${m.companions.length} bạn 3D` : 'Tĩnh tâm'})
                </button>`
              ).join('')}
            </div>
          </div>

          ${
            storeWearables.length > 0
              ? `
              <div>
                <div class="profile-wardrobe-heading" style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
                  <span>Áo tràng &amp; Pháp khí đã thỉnh từ Cửa hàng:</span>
                  <button type="button" id="btn-wardrobe-open-9tab" class="quest-go-btn" style="min-height:32px;font-size:12px;">🛍️ Thỉnh thêm Áo tràng</button>
                </div>
                <div class="profile-wardrobe-grid">
                  ${storeWearables
                    .map((item) => {
                      const active = this.storeProfile?.equipped?.[item.slot] === item.id;
                      const dotHtml = item.swatchHex
                        ? `<span style="width:14px;height:14px;border-radius:50%;background:${item.swatchHex};border:1.5px solid #4A3222;display:inline-block;flex-shrink:0;"></span>`
                        : '';
                      return `
                      <button type="button" class="store-wardrobe-toggle-btn profile-wardrobe-card ${active ? 'active' : ''}" data-store-slot="${item.slot}" data-store-id="${item.id}">
                        <span class="profile-wardrobe-name" style="display:flex;align-items:center;gap:7px;">${dotHtml}<span>${item.name}</span></span>
                        <span class="profile-wardrobe-status">${active ? '✓ Đang mặc' : 'Mặc vào 3D'}</span>
                      </button>
                    `;
                    })
                    .join('')}
                </div>
              </div>
              `
              : `
              <div class="store-quest-cta-strip">
                <span>👕 Cô bác chưa thỉnh thêm Áo tràng mới? Hãy ghé Cửa hàng để xem thử 12 mẫu Áo tràng &amp; Pháp phục 3D!</span>
                <button type="button" id="btn-wardrobe-open-9tab" class="quest-claim-btn">🛍️ Xem 12 mẫu Áo tràng</button>
              </div>
              `
          }

          <div>
            <div class="profile-wardrobe-heading">Hành trang &amp; đồ mang theo mặc định:</div>
            <div class="profile-wardrobe-grid">
              ${wearableItems
                .map((item) => {
                  const active =
                    item.id === 'ao_trang_phat_tu'
                      ? !this.storeProfile?.equipped?.robe && this.spiritual.equippedItems.outfit === 'ao_trang_phat_tu'
                      : Object.values(this.spiritual.equippedItems).includes(item.id);
                  return `
                  <button type="button" class="wardrobe-toggle-btn profile-wardrobe-card ${active ? 'active' : ''}" data-slot="${item.equipSlot}" data-id="${item.id}">
                    <span class="profile-wardrobe-name">${item.name}</span>
                    <span class="profile-wardrobe-status">${active ? '✓ Đang mang' : 'Mang thử'}</span>
                  </button>
                `;
                })
                .join('')}
            </div>
          </div>

          <div class="profile-cta-row">
            <button type="button" id="btn-account-open-dharma" class="product-detail-btn" style="width:100%;background:#5C381F;">Lời dạy hôm nay</button>
            <button type="button" id="btn-account-open-ugc" class="product-detail-btn" style="width:100%;background:#9c4119;">Lưu ảnh kỷ niệm</button>
            <button type="button" id="btn-account-open-shop" class="product-detail-btn" style="width:100%;">Quà lưu niệm</button>
          </div>

          <div class="backup-code-box">
            <div class="backup-code-title">🔐 Sao lưu &amp; Khôi phục Hồ sơ (Mã khôi phục)</div>
            <p class="backup-code-desc">
              Tạo và lưu lại mã <code>VT1-...</code> để khi chuyển sang điện thoại khác cô bác vẫn giữ nguyên số lạy, công đức, áo tràng và bài đã học.
            </p>
            <div class="backup-code-row">
              <button type="button" id="btn-generate-backup-code" class="product-detail-btn" style="width:auto;padding:0 16px;height:38px;font-size:13px;background:#5C381F;">
                📋 Tạo &amp; Sao chép mã
              </button>
              <input id="backup-code-display" type="text" readonly value="${encodeProfileBackupCode({
                characterModelKey: this.characterModelKey,
                spiritual: this.spiritual,
                storeProfile: this.storeProfile,
                activityHub: this.activityHub,
                completedLessons: Array.from(this.completedLessons)
              })}" aria-label="Mã sao lưu hồ sơ của bạn" />
            </div>
            <div class="backup-code-row" style="margin-top:8px;">
              <input id="restore-code-input" type="text" placeholder="Dán mã khôi phục VT1-... tại đây" aria-label="Nhập mã khôi phục" />
              <button type="button" id="btn-restore-backup-code" class="product-detail-btn" style="width:auto;padding:0 16px;height:38px;font-size:13px;background:#9A6E1C;">
                Khôi phục
              </button>
            </div>
          </div>
        </div>
      </div>
      `
    );

    const mountStage = (pose) => {
      this.mountProfileCharacterStage('character-3d-canvas', {
        charKey: this.characterModelKey,
        pose
      });
    };
    mountStage(this.profilePreviewPose);

    document.querySelectorAll('[data-profile-pose]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.profilePreviewPose = btn.getAttribute('data-profile-pose') || 'Dung';
        document.querySelectorAll('[data-profile-pose]').forEach((b) => {
          b.classList.toggle('active', b === btn);
        });
        mountStage(this.profilePreviewPose);
      });
    });

    document.querySelectorAll('.char-switch-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-char') || 'nu';
        this.characterModelKey = key;
        this.world3d?.switchCharacter(key);
        this.syncStoreVisualsTo3D();
        this.saveState();
        this.updateEquippedTags();
        this.syncVisitorPresence?.();
        this.openAccountModal();
      });
    });

    document.querySelectorAll('[data-acc-nat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.nationalityId = btn.getAttribute('data-acc-nat') || 'vn';
        this.syncPilgrimageCompanionsTo3D();
        this.saveState();
        this.syncVisitorPresence?.();
        this.playMokugyoTap();
        this.openAccountModal();
      });
    });

    document.querySelectorAll('[data-acc-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.pilgrimageModeId = btn.getAttribute('data-acc-mode') || 'solo';
        this.syncPilgrimageCompanionsTo3D();
        this.saveState();
        this.playMokugyoTap();
        this.openAccountModal();
      });
    });

    document.getElementById('btn-account-replay-arrival')?.addEventListener('click', () => {
      this.openArrivalPilgrimageModal();
    });

    document.querySelectorAll('.store-wardrobe-toggle-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const slot = btn.getAttribute('data-store-slot');
        const itemId = btn.getAttribute('data-store-id');
        if (!slot || !itemId) return;
        const currentlyEquipped = this.storeProfile.equipped[slot] === itemId;
        this.storeProfile.equipped[slot] = currentlyEquipped ? null : itemId;
        this.storeProfile.tryingItemId = null;
        if (slot === 'robe' && !currentlyEquipped) {
          this.spiritual.equippedItems.outfit = null;
        }
        if (itemId === 'non_la_theu_sen_store') {
          this.spiritual.equippedItems.hat = currentlyEquipped ? null : 'non_la_theu_sen';
        }
        this.saveState();
        this.syncStoreVisualsTo3D();
        this.updateEquippedTags();
        this.playMokugyoTap();
        this.openAccountModal();
      });
    });

    document.querySelectorAll('.wardrobe-toggle-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const slot = btn.getAttribute('data-slot') || 'hand';
        const itemKey = btn.getAttribute('data-id');
        if (itemKey === 'ao_trang_phat_tu') {
          this.storeProfile.equipped.robe = null;
          this.storeProfile.tryingItemId = null;
        }
        const r = performSpiritualAction(this.spiritual, 'EQUIP_ITEM', { slot, itemKey });
        this.spiritual = r.state;
        this.saveState();
        this.syncStoreVisualsTo3D();
        this.updateEquippedTags();
        this.playMokugyoTap();
        this.openAccountModal();
      });
    });

    document.getElementById('btn-wardrobe-open-9tab')?.addEventListener('click', () => {
      this.openNineTabStoreModal('ao_trang');
    });

    document.getElementById('btn-account-open-dharma')?.addEventListener('click', () => {
      this.showDailyDharmaModal({ markSeenToday: false });
    });

    document.getElementById('btn-account-open-ugc')?.addEventListener('click', () => {
      this.openUGCStudioModal();
    });

    document.getElementById('btn-account-open-shop')?.addEventListener('click', () => {
      this.closeModal();
      this.switchScreen('shop');
    });

    document.getElementById('btn-generate-backup-code')?.addEventListener('click', async () => {
      const code = encodeProfileBackupCode({
        characterModelKey: this.characterModelKey,
        spiritual: this.spiritual,
        storeProfile: this.storeProfile,
        activityHub: this.activityHub,
        completedLessons: Array.from(this.completedLessons)
      });
      const disp = document.getElementById('backup-code-display');
      if (disp) disp.value = code;
      try {
        await navigator.clipboard?.writeText(code);
        this.showToast('📋 Đã sao chép mã khôi phục', 'Cô bác hãy dán và lưu giữ mã VT1 này vào ghi chú hoặc Zalo.', 3800, false);
      } catch {
        this.showToast('🔐 Đã tạo mã khôi phục', 'Cô bác hãy chọn toàn bộ ô mã bên cạnh để sao chép nhé.', 3800, false);
      }
    });

    document.getElementById('btn-restore-backup-code')?.addEventListener('click', () => {
      const inp = document.getElementById('restore-code-input');
      const res = decodeProfileBackupCode(inp?.value || '');
      if (!res.ok || !res.data) {
        this.showToast('Chưa khôi phục được', res.message || 'Mã khôi phục không hợp lệ.', 3800, false);
        return;
      }
      this.characterModelKey = res.data.characterModelKey;
      this.spiritual = res.data.spiritual;
      this.storeProfile = res.data.storeProfile;
      this.activityHub = res.data.activityHub;
      this.completedLessons = new Set(res.data.completedLessons);
      this.world3d?.switchCharacter?.(this.characterModelKey);
      this.syncStoreVisualsTo3D();
      this.saveState();
      this.updateActionBadges();
      this.updateEquippedTags();
      this.playBellTone(324, 2.2);
      this.showToast('✅ Đã khôi phục hồ sơ thành công!', 'Toàn bộ công đức, vật phẩm và bài học của cô bác đã trở lại.', 4200, false);
      this.openAccountModal();
    });
  }
};
