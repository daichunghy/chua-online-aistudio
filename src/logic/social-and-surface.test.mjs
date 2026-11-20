import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectGroundSurface,
  getSurfaceFeedbackProfile,
  mergeBlessingTowerEntries,
  filterBlessingTowerEntries,
  createSocialState,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  sendGiftToFriend,
  claimReceivedGift,
  computeLeaderboard,
  addCommunityPost,
  toggleRejoicePost,
  computeCommunityGoalProgress,
  getUnreadSocialCount,
} from './chua-online-logic.mjs';

test('detectGroundSurface differentiates wood, tile, grass, and gravel accurately', () => {
  // Interior Grand Chánh Điện floor is polished wood
  assert.equal(detectGroundSurface(-28, 0, true), 'wood');
  // Interior Hồ Sen Bộ stone courtyard is tile
  assert.equal(detectGroundSurface(0, 0, true), 'tile');
  // Exterior front Chánh Điện plaza (around Tháp Đèn Cầu An) is tile
  assert.equal(detectGroundSurface(28.2, 15.2, false), 'tile');
  // Exterior dusty 170m approach road is gravel
  assert.equal(detectGroundSurface(40.5, 110, false), 'gravel');
  // Exterior Công Viên Vĩnh Tràng lawn is grass
  assert.equal(detectGroundSurface(-8, 90, false), 'grass');
  // Exterior Công Viên paved central plaza is tile
  assert.equal(detectGroundSurface(8, 104, false), 'tile');
  // West temple garden lawn is grass
  assert.equal(detectGroundSurface(-25, 0, false), 'grass');

  const grassProfile = getSurfaceFeedbackProfile('grass');
  assert.equal(grassProfile.id, 'grass');
  assert.ok(grassProfile.count >= 2);
});

test('mergeBlessingTowerEntries deduplicates and prioritizes user entries', () => {
  const local = [
    { id: 'bt_user_1', devoteeName: 'Nguyễn An', slotNumber: 1, tier: 1, isUserOwned: true, dateKey: '2026-06-01' },
    { id: 'bt_seed_1', devoteeName: 'Diệu Hiền', slotNumber: 18, tier: 3, isUserOwned: false, dateKey: '2026-05-12' },
  ];
  const cloud = [
    { id: 'bt_user_1', devoteeName: 'Nguyễn An', slotNumber: 1, tier: 1, isUserOwned: false, dateKey: '2026-06-01' },
    { id: 'bt_cloud_2', devoteeName: 'Trần Minh', slotNumber: 7, tier: 7, isUserOwned: false, dateKey: '2026-06-02' },
  ];
  const merged = mergeBlessingTowerEntries(local, cloud);
  assert.equal(merged.length, 3);
  assert.equal(merged[0].id, 'bt_user_1');
  assert.equal(merged[0].isUserOwned, true);
  assert.equal(merged[0].syncedCloud, true);

  const filtered = filterBlessingTowerEntries(merged, 'Trần Minh');
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].slotNumber, 7);
});

test('social community friend requests, gifting, leaderboard, and community wishes work end-to-end', () => {
  const social = createSocialState(null, { uid: 'u_test', displayName: 'Minh Khôi' });
  const storeProfile = { meritPoints: 100 };

  assert.ok(social.friendCode.startsWith('VT-'));
  assert.ok(getUnreadSocialCount(social) >= 2);

  // Accept seeded incoming request
  const firstReqId = social.incomingRequests[0].id;
  const acc = acceptFriendRequest(social, firstReqId);
  assert.equal(acc.ok, true);
  assert.equal(social.incomingRequests.length, 0);

  // Add friend by friend code
  const addRes = sendFriendRequest(social, 'VT-5821');
  assert.equal(addRes.ok, true);
  assert.ok(social.friends.some((f) => f.friendCode === 'VT-5821'));

  // Send paid gift & verify merit deduction + sender reward
  const giftRes = sendGiftToFriend(social, storeProfile, addRes.friend.uid, 'nen_tram_huong', 'Chúc bình an!');
  assert.equal(giftRes.ok, true);
  // 100 - 15 + 8 = 93
  assert.equal(storeProfile.meritPoints, 93);
  assert.equal(social.sentGifts.length, 1);

  // Claim received gift
  const receivedId = social.receivedGifts[0].id;
  const claimRes = claimReceivedGift(social, storeProfile, receivedId);
  assert.equal(claimRes.ok, true);
  assert.equal(storeProfile.meritPoints, 99);

  // Remove friend
  const remRes = removeFriend(social, addRes.friend.uid);
  assert.equal(remRes.ok, true);
  assert.equal(social.friends.some((f) => f.uid === addRes.friend.uid), false);

  // Decline non-existent request returns ok: false
  assert.equal(declineFriendRequest(social, 'missing').ok, false);

  // Leaderboard ranks player accurately
  const board = computeLeaderboard(social, { uid: 'u_test', displayName: 'Minh Khôi', meritScore: 600, streakDays: 25 }, 'merit');
  assert.equal(board.rows[0].isPlayer, true);
  assert.equal(board.me.rank, 1);

  // Community post & rejoice toggle
  const postRes = addCommunityPost(social, { uid: 'u_test', displayName: 'Minh Khôi' }, 'Chúc cả nhà an lạc', 'Cầu an');
  assert.equal(postRes.ok, true);
  const initialCount = postRes.post.rejoiceCount;
  toggleRejoicePost(social, postRes.post.id);
  assert.equal(postRes.post.rejoiceCount, initialCount - 1);

  // Co-op goal progress
  const goal = computeCommunityGoalProgress(social, 600);
  assert.ok(goal.pct > 0 && goal.pct <= 100);
});
