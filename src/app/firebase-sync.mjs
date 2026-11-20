import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  limit,
  onSnapshot,
  serverTimestamp,
  increment
} from 'firebase/firestore';

export const OperationType = Object.freeze({
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write'
});

let firebaseApp = null;
let firebaseAuth = null;
let firestoreDb = null;
let initPromise = null;

export function handleFirestoreError(error, operationType, path) {
  const user = firebaseAuth?.currentUser || null;
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: user?.uid || null,
      email: user?.email || null,
      emailVerified: Boolean(user?.emailVerified),
      isAnonymous: Boolean(user?.isAnonymous),
      tenantId: user?.tenantId || null,
      providerInfo: (user?.providerData || []).map((provider) => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      }))
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  return errInfo;
}

export async function initFirebaseClient() {
  if (firestoreDb && firebaseAuth) {
    return { app: firebaseApp, auth: firebaseAuth, db: firestoreDb, ready: true };
  }
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const resp = await fetch('/firebase-applet-config.json', { cache: 'no-cache' });
      if (!resp.ok) {
        throw new Error(`Unable to load firebase-applet-config.json (${resp.status})`);
      }
      const config = await resp.json();
      firebaseApp = getApps().length > 0 ? getApps()[0] : initializeApp(config);
      firebaseAuth = getAuth(firebaseApp);
      firestoreDb = config.firestoreDatabaseId
        ? getFirestore(firebaseApp, config.firestoreDatabaseId)
        : getFirestore(firebaseApp);

      // Verify connectivity to Firestore on boot
      try {
        await getDocFromServer(doc(firestoreDb, 'test', 'connection'));
      } catch (err) {
        if (err instanceof Error && err.message.includes('the client is offline')) {
          console.error('Please check your Firebase configuration (Firestore client offline).');
        }
      }

      return { app: firebaseApp, auth: firebaseAuth, db: firestoreDb, ready: true };
    } catch (err) {
      console.warn('[firebase-sync] Running in offline local mode:', err?.message || err);
      return { app: null, auth: null, db: null, ready: false };
    }
  })();

  return initPromise;
}

export function getFirebaseAuthInstance() {
  return firebaseAuth;
}

export async function subscribeAuthState(callback) {
  const { auth, ready } = await initFirebaseClient();
  if (!ready || !auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, (user) => {
    callback(user || null);
  });
}

export async function signInWithGooglePopup() {
  const { auth, ready } = await initFirebaseClient();
  if (!ready || !auth) {
    throw new Error('Dịch vụ đồng bộ đám mây tạm chưa sẵn sàng.');
  }
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const cred = await signInWithPopup(auth, provider);
  return cred.user;
}

export async function signOutGoogleAccount() {
  const { auth, ready } = await initFirebaseClient();
  if (!ready || !auth) return;
  await signOut(auth);
}

function toTimestampMs(val) {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  if (typeof val.toMillis === 'function') return val.toMillis();
  if (typeof val.seconds === 'number') return val.seconds * 1000;
  return 0;
}

export async function loadCloudPassport(uid) {
  const { db, ready } = await initFirebaseClient();
  if (!ready || !db || !uid) return null;

  const result = {
    profile: null,
    temples: {},
    journalEntries: []
  };

  try {
    const profileRef = doc(db, 'users', uid);
    const profileSnap = await getDoc(profileRef);
    if (profileSnap.exists()) {
      result.profile = profileSnap.data();
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${uid}`);
  }

  try {
    const templesSnap = await getDocs(collection(db, 'users', uid, 'temples'));
    templesSnap.forEach((docSnap) => {
      const data = docSnap.data();
      result.temples[docSnap.id] = {
        ...data,
        updatedAtMs: toTimestampMs(data.updatedAt)
      };
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, `users/${uid}/temples`);
  }

  try {
    const journalSnap = await getDocs(
      query(collection(db, 'users', uid, 'journalEntries'), limit(80))
    );
    journalSnap.forEach((docSnap) => {
      const data = docSnap.data();
      result.journalEntries.push({
        id: docSnap.id,
        templeId: data.templeId || 'vinh_trang',
        text: data.text || '',
        mood: data.mood || 'an_lac',
        moodLabel: data.moodLabel || 'An lạc',
        stationLabel: data.stationLabel || 'Chùa Vĩnh Tràng',
        dateKey: data.dateKey || '',
        createdAt: toTimestampMs(data.createdAt) || Date.now()
      });
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, `users/${uid}/journalEntries`);
  }

  return result;
}

export async function saveCloudPilgrimProfile(uid, profile = {}) {
  const { db, ready } = await initFirebaseClient();
  if (!ready || !db || !uid) return false;
  const path = `users/${uid}`;
  const ref = doc(db, 'users', uid);
  try {
    const existing = await getDoc(ref);
    const payload = {
      uid,
      displayName: String(profile.displayName || 'Phật tử hữu duyên').trim().slice(0, 64) || 'Phật tử hữu duyên',
      characterModelKey: String(profile.characterModelKey || 'nu').slice(0, 40),
      nationalityId: String(profile.nationalityId || 'vn').slice(0, 32),
      elderFontScale: Math.max(0.85, Math.min(1.5, Number(profile.elderFontScale) || 1.0)),
      readAlongRate: Math.max(0.6, Math.min(1.4, Number(profile.readAlongRate) || 0.85)),
      activeTempleId: String(profile.activeTempleId || 'vinh_trang').replace(/[^a-z0-9_]/g, '').slice(0, 48) || 'vinh_trang',
      updatedAt: serverTimestamp()
    };
    if (existing.exists() && existing.data()?.createdAt) {
      payload.createdAt = existing.data().createdAt;
      await setDoc(ref, payload);
    } else {
      payload.createdAt = serverTimestamp();
      await setDoc(ref, payload);
    }
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    return false;
  }
}

export async function saveCloudTempleProgress(uid, templeId, record) {
  const { db, ready } = await initFirebaseClient();
  if (!ready || !db || !uid || !templeId || !record) return false;
  const cleanTempleId = String(templeId).replace(/[^a-z0-9_]/g, '').slice(0, 48) || 'vinh_trang';
  const path = `users/${uid}/temples/${cleanTempleId}`;
  const ref = doc(db, 'users', uid, 'temples', cleanTempleId);

  try {
    const existing = await getDoc(ref);
    const gardenStateJson = JSON.stringify({
      gardenSlots: record.gardenSlots || [],
      bloomedKeepsakes: (record.bloomedKeepsakes || []).slice(0, 40)
    }).slice(0, 8192);

    const payload = {
      ownerUid: uid,
      templeId: cleanTempleId,
      visitedStations: (record.visitedStations || []).slice(0, 40),
      heritageStamps: (record.heritageStamps || []).slice(0, 30),
      arhatStamps: (record.arhatStamps || []).slice(0, 30),
      practicedDays: (record.practicedDays || []).slice(0, 400),
      dailyOracleDateKey: String(record.dailyOracleDateKey || '').slice(0, 10),
      dailyOracleId: String(record.dailyOracleId || '').slice(0, 48),
      gardenStateJson,
      updatedAt: serverTimestamp()
    };

    if (existing.exists() && existing.data()?.createdAt) {
      payload.createdAt = existing.data().createdAt;
      await setDoc(ref, payload);
    } else {
      payload.createdAt = serverTimestamp();
      await setDoc(ref, payload);
    }
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    return false;
  }
}

export async function saveCloudJournalEntry(uid, entry) {
  const { db, ready } = await initFirebaseClient();
  if (!ready || !db || !uid || !entry?.text) return false;
  const safeId = String(entry.id || `entry_${Date.now().toString(36)}`)
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 96);
  const path = `users/${uid}/journalEntries/${safeId}`;
  const ref = doc(db, 'users', uid, 'journalEntries', safeId);

  try {
    await setDoc(ref, {
      ownerUid: uid,
      templeId: String(entry.templeId || 'vinh_trang').replace(/[^a-z0-9_]/g, '').slice(0, 48) || 'vinh_trang',
      text: String(entry.text).trim().slice(0, 600),
      mood: String(entry.mood || 'an_lac').slice(0, 32),
      moodLabel: String(entry.moodLabel || 'An lạc').slice(0, 48),
      stationLabel: String(entry.stationLabel || 'Chùa Vĩnh Tràng').slice(0, 80),
      dateKey: String(entry.dateKey || '').slice(0, 10),
      createdAt: serverTimestamp()
    });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
    return false;
  }
}

export async function subscribeCommunityLanterns(templeId, onUpdate) {
  const { db, ready } = await initFirebaseClient();
  if (!ready || !db) return () => {};
  const cleanTempleId = String(templeId || 'vinh_trang').replace(/[^a-z0-9_]/g, '') || 'vinh_trang';
  const q = query(
    collection(db, 'templeLanterns'),
    where('templeId', '==', cleanTempleId),
    limit(28)
  );

  return onSnapshot(
    q,
    (snap) => {
      const lanterns = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        lanterns.push({
          id: docSnap.id,
          templeId: d.templeId || cleanTempleId,
          authorUid: d.authorUid || '',
          authorName: d.authorName || 'Phật tử hữu duyên',
          nationalityId: d.nationalityId || 'vn',
          wishText: d.wishText || '',
          wish: d.wishText || '',
          colorHex: d.colorHex || '#f4a261',
          pondX: typeof d.pondX === 'number' ? d.pondX : undefined,
          pondZ: typeof d.pondZ === 'number' ? d.pondZ : undefined,
          blessCount: Number(d.blessCount) || 0,
          createdAtMs: toTimestampMs(d.createdAt),
          isCloud: true
        });
      });
      lanterns.sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));
      onUpdate(lanterns);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'templeLanterns');
    }
  );
}

export async function postCommunityLantern(uid, lantern = {}) {
  const { db, ready } = await initFirebaseClient();
  if (!ready || !db || !uid) {
    throw new Error('Cần đăng nhập Google để thả Hoa Đăng lên hồ cộng đồng.');
  }
  const lanternId = `lantern_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  const path = `templeLanterns/${lanternId}`;
  const ref = doc(db, 'templeLanterns', lanternId);
  const angle = Math.random() * Math.PI * 2;
  const radius = 1.8 + Math.random() * 3.4;
  const hex = /^#[0-9a-fA-F]{6}$/.test(String(lantern.colorHex || ''))
    ? lantern.colorHex
    : '#f4a261';

  try {
    await setDoc(ref, {
      templeId: String(lantern.templeId || 'vinh_trang').replace(/[^a-z0-9_]/g, '').slice(0, 48) || 'vinh_trang',
      authorUid: uid,
      authorName: String(lantern.authorName || 'Phật tử hữu duyên').trim().slice(0, 60) || 'Phật tử hữu duyên',
      nationalityId: String(lantern.nationalityId || 'vn').slice(0, 32),
      wishText: String(lantern.wishText || 'Cầu nguyện gia đình bình an, thân tâm thường an lạc.').trim().slice(0, 240),
      colorHex: hex,
      pondX: Number((Math.cos(angle) * radius).toFixed(2)),
      pondZ: Number((Math.sin(angle) * radius).toFixed(2)),
      blessCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return lanternId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
    throw err;
  }
}

export async function blessCommunityLantern(lanternId) {
  const { db, ready } = await initFirebaseClient();
  if (!ready || !db || !lanternId) {
    throw new Error('Cần đăng nhập Google để gửi lời tùy hỷ.');
  }
  const path = `templeLanterns/${lanternId}`;
  const ref = doc(db, 'templeLanterns', lanternId);
  try {
    await updateDoc(ref, {
      blessCount: increment(1),
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
    throw err;
  }
}

export async function subscribeCloudBlessingTower(templeId, onUpdate) {
  const { db, ready } = await initFirebaseClient();
  if (!ready || !db) return () => {};
  const cleanTempleId = String(templeId || 'vinh_trang').replace(/[^a-z0-9_]/g, '') || 'vinh_trang';
  const q = query(
    collection(db, 'blessingTowerEntries'),
    where('templeId', '==', cleanTempleId),
    limit(108)
  );
  return onSnapshot(
    q,
    (snap) => {
      const entries = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        entries.push({
          id: docSnap.id,
          devoteeName: d.devoteeName || 'Phật tử hữu duyên',
          birthYear: d.birthYear || '',
          familyNote: d.familyNote || '',
          categoryId: d.categoryId || 'binh_an',
          wishText: d.wishText || '',
          slotNumber: Number(d.slotNumber) || 1,
          tier: Number(d.tier) || 1,
          dateKey: d.dateKey || '',
          createdAt: toTimestampMs(d.createdAt) || Date.now(),
          isCloud: true
        });
      });
      entries.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      onUpdate(entries);
    },
    (err) => {
      const code = err?.code || '';
      if (code === 'permission-denied' || String(err?.message || '').includes('Missing or insufficient permissions')) {
        console.info('[firebase-sync] blessingTowerEntries cloud feed using local storage fallback until rules are deployed.');
        return;
      }
      handleFirestoreError(err, OperationType.LIST, 'blessingTowerEntries');
    }
  );
}

export async function postCloudBlessingTowerEntry(uid, entry = {}) {
  const { db, ready } = await initFirebaseClient();
  if (!ready || !db || !uid) return false;
  const safeId = String(entry.id || `bt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`)
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 96);
  const path = `blessingTowerEntries/${safeId}`;
  try {
    await setDoc(doc(db, 'blessingTowerEntries', safeId), {
      templeId: String(entry.templeId || 'vinh_trang').replace(/[^a-z0-9_]/g, '').slice(0, 48) || 'vinh_trang',
      authorUid: uid,
      devoteeName: String(entry.devoteeName || 'Phật tử hữu duyên').trim().slice(0, 80),
      birthYear: String(entry.birthYear || '').trim().slice(0, 8),
      familyNote: String(entry.familyNote || '').trim().slice(0, 120),
      categoryId: String(entry.categoryId || 'binh_an').slice(0, 32),
      wishText: String(entry.wishText || 'Cầu nguyện thân tâm an lạc.').trim().slice(0, 260),
      slotNumber: Math.max(1, Math.min(108, Math.round(Number(entry.slotNumber) || 1))),
      tier: Math.max(1, Math.min(13, Math.round(Number(entry.tier) || 1))),
      dateKey: String(entry.dateKey || '').slice(0, 10),
      createdAt: serverTimestamp()
    });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
    return false;
  }
}

export async function saveCloudPublicProfile(uid, profile = {}) {
  const { db, ready } = await initFirebaseClient();
  if (!ready || !db || !uid) return false;
  const path = `publicProfiles/${uid}`;
  const ref = doc(db, 'publicProfiles', uid);
  try {
    const existing = await getDoc(ref);
    const payload = {
      uid,
      displayName: String(profile.name || profile.displayName || 'Phật tử Tâm An').trim().slice(0, 64) || 'Phật tử Tâm An',
      friendCode: String(profile.friendCode || 'VT-1849').slice(0, 16),
      charKey: String(profile.charKey || 'nu').slice(0, 32),
      merit: Math.max(0, Math.min(1000000, Math.round(Number(profile.merit) || 0))),
      streakDays: Math.max(0, Math.min(3650, Math.round(Number(profile.streakDays) || 1))),
      giftsSent: Math.max(0, Math.min(10000, Math.round(Number(profile.giftsSent) || 0))),
      currentArea: String(profile.currentArea || 'Sân Chùa Vĩnh Tràng').slice(0, 80),
      updatedAt: serverTimestamp()
    };
    if (existing.exists() && existing.data()?.createdAt) {
      payload.createdAt = existing.data().createdAt;
    } else {
      payload.createdAt = serverTimestamp();
    }
    await setDoc(ref, payload);
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    return false;
  }
}

export async function postCloudGiftTransaction(uid, tx = {}) {
  const { db, ready } = await initFirebaseClient();
  if (!ready || !db || !uid) return false;
  const safeId = String(tx.id || `gift_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`)
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 96);
  const path = `giftTransactions/${safeId}`;
  try {
    await setDoc(doc(db, 'giftTransactions', safeId), {
      fromUid: uid,
      fromName: String(tx.fromName || 'Phật tử Tâm An').trim().slice(0, 64),
      toId: String(tx.toId || 'friend').slice(0, 128),
      toName: String(tx.toName || 'Đạo hữu').trim().slice(0, 64),
      giftId: String(tx.giftId || 'gift_sen').slice(0, 48),
      giftName: String(tx.giftName || 'Đóa Sen Tươi').trim().slice(0, 80),
      message: String(tx.message || 'Kính chúc đạo hữu an lạc.').trim().slice(0, 240),
      lotusCost: Math.max(0, Math.min(5000, Math.round(Number(tx.lotusCost) || 0))),
      createdAt: serverTimestamp()
    });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
    return false;
  }
}

export async function postCloudCommunityPost(uid, post = {}) {
  const { db, ready } = await initFirebaseClient();
  if (!ready || !db || !uid) return false;
  const safeId = String(post.id || `post_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`)
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 96);
  const path = `communityPosts/${safeId}`;
  try {
    await setDoc(doc(db, 'communityPosts', safeId), {
      templeId: String(post.templeId || 'vinh_trang').replace(/[^a-z0-9_]/g, '').slice(0, 48) || 'vinh_trang',
      authorUid: uid,
      authorName: String(post.authorName || 'Phật tử Tâm An').trim().slice(0, 64),
      charKey: String(post.charKey || 'nu').slice(0, 32),
      area: String(post.area || 'Chùa Vĩnh Tràng').slice(0, 80),
      text: String(post.text || '').trim().slice(0, 240),
      rejoiceCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
    return false;
  }
}
