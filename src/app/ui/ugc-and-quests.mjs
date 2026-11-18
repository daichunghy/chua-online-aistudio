/**
 * Studio ảnh/UGC, gợi ý nhiệm vụ, đèn chỉ đường.
 *
 * Mixin của ChuaOnlineApp: 3 method (openUGCStudioModal … activateGuidedBeacon).
 * Được gắn vào class trong chua-online-app.mjs qua applyMixins().
 */
import { CHARACTER_PROFILES, findAnyTempleDestination, UGC_BACKDROPS, UGC_POSES, performSpiritualAction, recordSpiritualMilestone, checkUGCMilestoneUnlock, createUGCPost } from './shared.mjs';

export const ugcAndQuestsMethods = {
  /* ========================================================================
     MILESTONE-UNLOCKED USER-PHOTO UPLOAD UGC CHECK-IN STUDIO
     ("Ảnh UGC chỉ chụp khi hoàn thành gì đó, người dùng đưa ảnh vào rồi hệ thống đẩy ảnh check-in với Chùa Vĩnh Tràng")
     ======================================================================== */
  openUGCStudioModal() {
    const milestoneStatus = checkUGCMilestoneUnlock(this.spiritual, this.completedLessons.size);
    let selectedCharMode = 'family_3'; // 'family_3' | 'nu' | 'nam' | 'tre_em'
    let selectedBackdropId = 'live_3d_view'; // 'live_3d_view' or any UGC_BACKDROPS.id
    let selectedPoseId = 'chap_tay_le_phat';

    const live3DSnapshot = this.world3d?.captureSnapshotDataURL?.() || null;

    this.openModal(
      'Ảnh kỷ niệm tại Chùa Vĩnh Tràng',
      `
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div id="ugc-milestone-banner" style="padding:12px 16px;border-radius:16px;border:1.5px solid ${
          milestoneStatus.unlocked ? '#5C381F' : '#d97706'
        };background:${
          milestoneStatus.unlocked
            ? 'linear-gradient(90deg,#F6E9D2 0%,#FFF9EE 100%)'
            : 'linear-gradient(90deg,#fef3c7 0%,#fffbeb 100%)'
        };display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
          <div>
            <div style="font-size:15px;font-weight:800;color:${
              milestoneStatus.unlocked ? '#472915' : '#92400e'
            };">
              ${
                milestoneStatus.unlocked
                  ? `Dấu ấn vừa hoàn thành: "${milestoneStatus.latestMilestone}"`
                  : 'Hãy lễ Phật, dâng hoa hoặc ghé thăm một góc chùa trước khi lưu ảnh kỷ niệm.'
              }
            </div>
            <div style="font-size:13px;color:#4a2f18;margin-top:2px;">
              Chọn ảnh của bạn hoặc gia đình bên phải để ghép cùng khung cảnh Chùa Vĩnh Tràng.
            </div>
          </div>
          ${
            !milestoneStatus.unlocked
              ? `
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <button id="btn-ugc-quick-bow" class="product-detail-btn" style="width:auto;padding:0 14px;height:36px;font-size:12.5px;">Lễ Phật ngay</button>
              <button id="btn-ugc-quick-lotus" class="product-detail-btn" style="width:auto;padding:0 14px;height:36px;font-size:12.5px;background:#8c4b1e;">Dâng hoa sen</button>
            </div>
          `
              : `<span style="padding:5px 12px;border-radius:999px;background:#5C381F;color:#fff;font-size:12px;font-weight:700;">Sẵn sàng lưu ảnh</span>`
          }
        </div>

        <div style="display:grid;grid-template-columns:1.15fr 1fr;gap:18px;align-items:start;">
          <div>
            <div style="position:relative;">
              <canvas id="ugc-composite-canvas" width="760" height="500" style="width:100%;height:auto;border-radius:18px;border:2.5px solid #c8963e;box-shadow:0 12px 30px rgba(0,0,0,0.32);background:#2D1B10;"></canvas>
              <div id="ugc-output-status-badge" style="position:absolute;top:12px;right:12px;background:rgba(71,41,21,0.92);color:#fff;padding:5px 12px;border-radius:999px;font-size:12px;font-weight:700;border:1px solid #f6cd72;">
                ${
                  this.uploadedUserPhotoDataUrl
                    ? '✓ Đã ghép ảnh của bạn'
                    : 'Đang hiển thị khung cảnh chùa'
                }
              </div>
            </div>

            <div style="display:flex;gap:10px;margin-top:10px;">
              <button id="btn-ugc-download" class="product-detail-btn" style="flex:1;height:44px;font-size:14.5px;background:#5C381F;">
                Tải ảnh về máy (.PNG)
              </button>
              <button id="btn-ugc-publish" class="shop-cart-cta" style="flex:1;margin:0;height:44px;font-size:15px;">
                Lưu vào sổ kỷ niệm
              </button>
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:10px;">
            <div class="ugc-upload-dropzone" id="ugc-upload-dropzone">
              <div style="font-size:14px;font-weight:800;color:#472915;">
                1. Chọn ảnh của bạn hoặc gia đình
              </div>
              <p style="font-size:12.5px;color:#3d2410;margin:4px 0 8px;">
                Chọn ảnh từ điện thoại hoặc máy tính để ghép vào khung cảnh Chùa Vĩnh Tràng:
              </p>
              <div style="display:flex;gap:8px;justify-content:center;align-items:center;flex-wrap:wrap;">
                <label for="ugc-user-photo-input" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:999px;background:#5C381F;color:#fff;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(92,56,31,0.3);">
                  Chọn ảnh từ máy
                </label>
                <input id="ugc-user-photo-input" type="file" accept="image/*" style="display:none;" />
                <button type="button" id="btn-ugc-sample-user-1" style="padding:7px 11px;border-radius:999px;border:1.5px solid #8c4b1e;background:#fffdf8;color:#5c3412;font-size:12px;font-weight:700;cursor:pointer;">
                  Ảnh mẫu Phật tử
                </button>
                <button type="button" id="btn-ugc-sample-user-2" style="padding:7px 11px;border-radius:999px;border:1.5px solid #8c4b1e;background:#fffdf8;color:#5c3412;font-size:12px;font-weight:700;cursor:pointer;">
                  Ảnh mẫu Gia đình
                </button>
              </div>
              <div id="ugc-upload-filename" style="margin-top:6px;font-size:12px;font-weight:700;color:#8C5327;">
                ${
                  this.uploadedUserPhotoDataUrl
                    ? '✓ Đã chọn ảnh để ghép'
                    : 'Chưa chọn ảnh riêng (đang dùng ảnh nhân vật đi chùa)'
                }
              </div>
            </div>

            <div>
              <div style="font-size:13.5px;font-weight:800;color:#472915;margin-bottom:5px;">
                2. Chọn góc cảnh chùa:
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
                <button class="ugc-bg-btn" data-bg="live_3d_view" style="padding:8px 10px;border-radius:10px;border:1.5px solid #5C381F;background:#F6E9D2;font-size:12.5px;font-weight:700;text-align:left;cursor:pointer;">
                  Góc nhìn hiện tại
                </button>
                ${UGC_BACKDROPS.map(
                  (b) => `
                  <button class="ugc-bg-btn" data-bg="${b.id}" style="padding:8px 10px;border-radius:10px;border:1.5px solid rgba(130,90,50,0.28);background:#fffdf8;font-size:12.5px;font-weight:700;text-align:left;cursor:pointer;">
                    ${b.name}
                  </button>
                `
                ).join('')}
              </div>
            </div>

            <div>
              <div style="font-size:13.5px;font-weight:800;color:#472915;margin-bottom:5px;">
                3. Nhân vật đi cùng:
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
                ${[
                  { id: 'family_3', label: 'Gia đình 3 người' },
                  { id: 'nu', label: 'Phật tử Nữ' },
                  { id: 'nam', label: 'Phật tử Nam' },
                  { id: 'tre_em', label: 'Em bé' }
                ]
                  .map(
                    (m, i) => `
                  <button class="ugc-char-btn" data-cmode="${m.id}" style="padding:7px 10px;border-radius:10px;border:1.5px solid ${
                      i === 0 ? '#5C381F' : 'rgba(130,90,50,0.28)'
                    };background:${i === 0 ? '#F6E9D2' : '#fffdf8'};font-size:12px;font-weight:700;text-align:left;cursor:pointer;">
                    ${m.label}
                  </button>
                `
                  )
                  .join('')}
              </div>
            </div>

            <div style="display:flex;gap:8px;">
              <input id="ugc-author-input" type="text" placeholder="Tên người đi chùa" value="Phật tử Tâm An" style="width:40%;padding:9px 11px;border-radius:10px;border:1px solid #bfa07a;font-size:13px;" />
              <input id="ugc-wish-input" type="text" placeholder="Lời chúc hoặc lời cầu nguyện..." value="Về thăm Chùa Vĩnh Tràng — Cầu mong gia đình bình an." style="flex:1;padding:9px 11px;border-radius:10px;border:1px solid #bfa07a;font-size:13px;" />
            </div>
          </div>
        </div>

        <div style="margin-top:8px;border-top:1.5px solid rgba(140,100,60,0.25);padding-top:12px;">
          <div style="font-size:15.5px;font-weight:800;color:#472915;margin-bottom:8px;">
            Sổ kỷ niệm đi chùa (${this.ugcGallery.length} bức ảnh)
          </div>
          <div id="ugc-gallery-feed" style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;"></div>
        </div>
      </div>
      `
    );

    // Quick unlock ritual buttons if user opened modal before completing a milestone
    document.getElementById('btn-ugc-quick-bow')?.addEventListener('click', () => {
      const r = performSpiritualAction(this.spiritual, 'LE_PHAT');
      this.spiritual = r.state;
      this.saveState();
      this.updateActionBadges();
      this.world3d?.playPlayerBowAnimation();
      this.playBellTone(216, 2.5);
      this.openUGCStudioModal();
    });

    document.getElementById('btn-ugc-quick-lotus')?.addEventListener('click', () => {
      const r = performSpiritualAction(this.spiritual, 'DANG_HOA');
      this.spiritual = r.state;
      this.saveState();
      this.updateActionBadges();
      this.world3d?.placeLotusOfferingIn3D();
      this.playBellTone(324, 2.2);
      this.openUGCStudioModal();
    });

    const renderGalleryFeed = () => {
      const feed = document.getElementById('ugc-gallery-feed');
      if (!feed) return;
      feed.innerHTML = this.ugcGallery
        .slice(0, 6)
        .map(
          (post) => `
          <div style="background:#fffdf8;border:1px solid rgba(140,100,60,0.28);border-radius:14px;padding:10px 12px;display:flex;flex-direction:column;justify-content:space-between;gap:6px;">
            <div>
              <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;">
                <span style="font-size:13px;font-weight:800;color:#5C381F;">${post.author}</span>
                <span style="font-size:11px;font-weight:700;color:#8c4b1e;background:#fef3db;padding:2px 7px;border-radius:999px;">✓ ${
                  post.milestoneBadge || 'Lễ Phật'
                }</span>
              </div>
              <div style="font-size:11.5px;color:#8c4b1e;margin-top:2px;">${post.createdAt}</div>
              <p style="font-size:12.5px;color:#3d2410;margin-top:4px;line-height:1.4;">"${post.wishText}"</p>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;">
              <span style="font-size:11.5px;font-weight:700;color:#6b4522;">${
                post.userPhotoUploaded ? 'Ảnh chụp tại chùa' : 'Ảnh lưu niệm'
              }</span>
              <button class="ugc-like-btn" data-post-id="${post.id}" style="padding:3px 9px;border-radius:999px;border:1px solid #c8963e;background:#fef3db;color:#7a4414;font-size:11.5px;font-weight:800;cursor:pointer;">
                🙏 Tùy hỷ (${post.likes})
              </button>
            </div>
          </div>
        `
        )
        .join('');

      feed.querySelectorAll('.ugc-like-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const pid = btn.getAttribute('data-post-id');
          const found = this.ugcGallery.find((p) => p.id === pid);
          if (found) {
            found.likes += 1;
            this.saveState();
            this.playBellTone(360, 1.2);
            renderGalleryFeed();
          }
        });
      });
    };

    const drawComposite = () => {
      const canvas = document.getElementById('ugc-composite-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;

      const curMilestone = checkUGCMilestoneUnlock(this.spiritual, this.completedLessons.size);
      const backdropObj =
        UGC_BACKDROPS.find((b) => b.id === selectedBackdropId) || UGC_BACKDROPS[0];
      const poseObj = UGC_POSES.find((p) => p.id === selectedPoseId) || UGC_POSES[0];
      const authorText =
        document.getElementById('ugc-author-input')?.value || 'Phật tử Tâm An';
      const wishText =
        document.getElementById('ugc-wish-input')?.value ||
        'Kính lễ Phật tại Chùa Vĩnh Tràng';

      const bgSrc =
        selectedBackdropId === 'live_3d_view' && live3DSnapshot
          ? live3DSnapshot
          : backdropObj.src;

      const bgImg = new Image();
      bgImg.src = bgSrc;
      bgImg.onload = () => {
        ctx.clearRect(0, 0, w, h);
        // Draw temple background scene
        if (selectedBackdropId === 'live_3d_view' && live3DSnapshot) {
          ctx.drawImage(bgImg, 0, 0, w, h);
        } else {
          ctx.drawImage(bgImg, 0, 65, bgImg.width, bgImg.height * 0.62, 0, 0, w, h);
        }

        // Warm golden temple atmosphere vignette
        const grad = ctx.createLinearGradient(0, h * 0.48, 0, h);
        grad.addColorStop(0, 'rgba(36, 20, 9, 0)');
        grad.addColorStop(1, 'rgba(30, 16, 7, 0.94)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Draw Ornate Golden Border Around Check-in Postcard
        ctx.strokeStyle = 'rgba(236, 192, 91, 0.85)';
        ctx.lineWidth = 4;
        ctx.strokeRect(10, 10, w - 20, h - 20);

        // Top Golden Temple Stamp + Completed Milestone Badge
        ctx.fillStyle = 'rgba(71, 41, 21, 0.94)';
        ctx.strokeStyle = '#f3c65f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(22, 20, 495, 42, 21);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px "Be Vietnam Pro", sans-serif';
        ctx.fillText('🪷 CHÙA VĨNH TRÀNG · ẢNH KỶ NIỆM', 36, 46);

        // Milestone Achievement Ribbon under header
        const milestoneLabel = curMilestone.unlocked
          ? `✨ ${curMilestone.latestMilestone}`
          : 'Kỷ niệm về thăm Chùa Vĩnh Tràng';
        ctx.fillStyle = 'rgba(158, 56, 16, 0.92)';
        ctx.strokeStyle = '#fbe09c';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(22, 70, 380, 32, 16);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fff7df';
        ctx.font = 'bold 13px "Be Vietnam Pro", sans-serif';
        ctx.fillText(milestoneLabel.slice(0, 48), 36, 91);

        // Foreground Portrait: User's Uploaded Photo (Primary) + 3D Companion Badge
        const primaryPortraitSrc =
          this.uploadedUserPhotoDataUrl ||
          (selectedCharMode === 'family_3'
            ? '/Thiết kế giao diện/Nhân vật 3D/anh-xem-truoc-3d-all-nguoi-that.png'
            : (
                CHARACTER_PROFILES.find((c) => c.key === selectedCharMode) ||
                CHARACTER_PROFILES[0]
              ).previewImg);

        const userImg = new Image();
        userImg.src = primaryPortraitSrc;
        userImg.onload = () => {
          // Large Golden Lotus Arch Portrait Frame on Right Foreground
          const pw = 230;
          const ph = 265;
          const px = w - pw - 28;
          const py = h - ph - 86;

          ctx.save();
          // Outer golden glow frame
          ctx.fillStyle = '#fff9ed';
          ctx.strokeStyle = '#e5b24c';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.roundRect(px - 6, py - 6, pw + 12, ph + 12, 24);
          ctx.fill();
          ctx.stroke();

          ctx.beginPath();
          ctx.roundRect(px, py, pw, ph, 18);
          ctx.clip();

          // Aspect-fill user photo cleanly inside portrait frame
          const imgRatio = userImg.width / Math.max(1, userImg.height);
          const boxRatio = pw / ph;
          let sx = 0,
            sy = 0,
            sw = userImg.width,
            sh = userImg.height;
          if (imgRatio > boxRatio) {
            sw = userImg.height * boxRatio;
            sx = (userImg.width - sw) * 0.5;
          } else {
            sh = userImg.width / boxRatio;
            sy = (userImg.height - sh) * 0.2;
          }
          ctx.drawImage(userImg, sx, sy, sw, sh, px, py, pw, ph);
          ctx.restore();

          // Label badge below portrait frame ("Ảnh Check-in của bạn tại Chùa Vĩnh Tràng")
          ctx.fillStyle = '#5C381F';
          ctx.strokeStyle = '#f6cd72';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(px + 10, py + ph - 18, pw - 20, 28, 14);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px "Be Vietnam Pro", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(
            this.uploadedUserPhotoDataUrl
              ? 'Ảnh của bạn'
              : 'Chùa Vĩnh Tràng',
            px + pw / 2,
            py + ph
          );
          ctx.textAlign = 'left';

          // Bottom Calligraphy Blessing Banner
          ctx.fillStyle = '#f8d278';
          ctx.font = 'bold 17px "Be Vietnam Pro", sans-serif';
          ctx.fillText(`${authorText} · ${poseObj.label}`, 26, h - 52);

          ctx.fillStyle = '#fff9ee';
          ctx.font = '500 14.5px "Be Vietnam Pro", sans-serif';
          ctx.fillText(`"${wishText.slice(0, 74)}"`, 26, h - 26);
        };
      };
    };

    const handleUserImageDataUrl = (dataUrl, labelText) => {
      this.uploadedUserPhotoDataUrl = dataUrl;
      // Ensure at least 1 milestone is recorded when user uploads photo
      if (!checkUGCMilestoneUnlock(this.spiritual, this.completedLessons.size).unlocked) {
        this.spiritual = recordSpiritualMilestone(
          this.spiritual,
          'Lưu ảnh kỷ niệm tại Chùa Vĩnh Tràng'
        );
      }
      this.saveState();
      this.updateUGCMilestoneHUD();

      const statusBadge = document.getElementById('ugc-output-status-badge');
      if (statusBadge) {
        statusBadge.textContent = '✓ Đã ghép ảnh của bạn vào Chùa Vĩnh Tràng!';
        statusBadge.style.background = '#b84518';
      }
      const fnEl = document.getElementById('ugc-upload-filename');
      if (fnEl) {
        fnEl.textContent = `✓ Đã nhận ảnh: ${labelText} — Ảnh kỷ niệm đã được ghép bên trái.`;
      }
      this.playBellTone(324, 2.0);
      drawComposite();
      this.showToast(
        'Đã ghép ảnh kỷ niệm Chùa Vĩnh Tràng',
        'Ảnh của bạn đã được ghép vào khung cảnh Chùa Vĩnh Tràng.',
        4500
      );
    };

    // File input upload handler
    document.getElementById('ugc-user-photo-input')?.addEventListener('change', (e) => {
      const file = e.target?.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          handleUserImageDataUrl(reader.result, file.name);
        }
      };
      reader.readAsDataURL(file);
    });

    // Quick sample portrait buttons (for 1-click user testing)
    document.getElementById('btn-ugc-sample-user-1')?.addEventListener('click', () => {
      handleUserImageDataUrl(
        '/public/assets/aistudio/image_8f6004e3.png',
        'Ảnh chân dung Phật tử áo lam'
      );
    });

    document.getElementById('btn-ugc-sample-user-2')?.addEventListener('click', () => {
      handleUserImageDataUrl(
        '/Thiết kế giao diện/Nhân vật 3D/anh-xem-truoc-3d-all-nguoi-that.png',
        'Ảnh gia đình 3 người hành hương'
      );
    });

    drawComposite();
    renderGalleryFeed();

    document.querySelectorAll('.ugc-char-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedCharMode = btn.getAttribute('data-cmode') || 'family_3';
        document.querySelectorAll('.ugc-char-btn').forEach((b) => {
          const act = b.getAttribute('data-cmode') === selectedCharMode;
          b.style.background = act ? '#F6E9D2' : '#fffdf8';
          b.style.borderColor = act ? '#5C381F' : 'rgba(130,90,50,0.28)';
        });
        drawComposite();
      });
    });

    document.querySelectorAll('.ugc-bg-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedBackdropId = btn.getAttribute('data-bg') || 'live_3d_view';
        document.querySelectorAll('.ugc-bg-btn').forEach((b) => {
          const act = b.getAttribute('data-bg') === selectedBackdropId;
          b.style.background = act ? '#F6E9D2' : '#fffdf8';
          b.style.borderColor = act ? '#5C381F' : 'rgba(130,90,50,0.28)';
        });
        drawComposite();
      });
    });

    document.getElementById('ugc-author-input')?.addEventListener('input', drawComposite);
    document.getElementById('ugc-wish-input')?.addEventListener('input', drawComposite);

    document.getElementById('btn-ugc-download')?.addEventListener('click', () => {
      const canvas = document.getElementById('ugc-composite-canvas');
      if (!canvas) return;
      const link = document.createElement('a');
      link.download = `checkin-chua-vinh-trang-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      this.showToast(
        'Đã tải ảnh kỷ niệm Chùa Vĩnh Tràng',
        'Ảnh kỷ niệm của bạn đã được lưu về máy.',
        3600
      );
    });

    document.getElementById('btn-ugc-publish')?.addEventListener('click', () => {
      const curM = checkUGCMilestoneUnlock(this.spiritual, this.completedLessons.size);
      const post = createUGCPost({
        author: document.getElementById('ugc-author-input')?.value,
        charMode: selectedCharMode,
        backdropId: selectedBackdropId,
        poseId: selectedPoseId,
        milestoneBadge: curM.latestMilestone || 'Lễ Phật Tam Bái',
        userPhotoUploaded: Boolean(this.uploadedUserPhotoDataUrl),
        wishText: document.getElementById('ugc-wish-input')?.value
      });
      this.ugcGallery.unshift(post);
      this.saveState();
      this.playBellTone(324, 2.0);
      renderGalleryFeed();
      this.showToast(
        'Đã lưu vào sổ kỷ niệm Chùa Vĩnh Tràng',
        `Cảm ơn ${post.author} đã chia sẻ bức ảnh kỷ niệm.`,
        4200
      );
    });
  },

  /* ========================================================================
     KHÁM PHÁ MODAL (Bản đồ · Nhiệm vụ · Mua đồ & Lễ vật · Dấu Ấn · 18 La Hán · Quét lá)
     ======================================================================== */
  executeQuestActionHint(actionHint) {
    this.closeModal();
    if (actionHint === 'checkin') {
      this.openActivityHubModal('checkin');
    } else if (actionHint === 'le_phat') {
      this.switchScreen('courtyard');
      this.triggerLePhat();
    } else if (actionHint === 'dang_huong') {
      this.switchScreen('courtyard');
      this.triggerDangHuong();
    } else if (actionHint === 'dang_hoa') {
      this.switchScreen('courtyard');
      this.triggerDangHoa();
    } else if (actionHint === 'niem_phat') {
      this.switchScreen('courtyard');
      this.triggerNiemPhat();
    } else if (actionHint === 'dharma_quote') {
      this.showDailyDharmaModal({ markSeenToday: false });
    } else if (actionHint === 'share') {
      this.openActivityHubModal('share_feedback');
    } else if (actionHint === 'explore') {
      this.openExploreModal('stations');
    } else if (actionHint === 'lecture') {
      this.switchScreen('lecture');
    } else if (actionHint === 'courtyard_leaf') {
      this.openExploreModal('sweep');
    } else if (actionHint === 'garden') {
      this.openTempleGardenModal(0);
    } else if (actionHint === 'bell_rhythm') {
      this.openBellRhythmModal();
    } else if (actionHint === 'heritage') {
      this.openHeritageBookModal();
    }
  },

  activateGuidedBeacon(stationKey) {
    if (!stationKey) {
      this.activeGuidedBeacon = null;
      this.world3d?.setGuidedBeacon?.(null);
      return;
    }
    const dest = findAnyTempleDestination(stationKey);
    this.activeGuidedBeacon = stationKey;
    this.world3d?.setGuidedBeacon?.(stationKey);
    this.closeModal();
    this.switchScreen('courtyard');
    if (this.world3d?.insideInterior) {
      this.toggleInteriorHallIn3D(false);
    }
    this.showToast(
      `🧭 Đang bật cột sáng dẫn đường tới ${dest?.name || 'điểm hành hương'}`,
      'Nhìn theo tia sáng vàng trên bầu trời 3D để đi tới tận nơi!',
      4200,
      false
    );
  }
};
