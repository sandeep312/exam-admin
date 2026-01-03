'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AttachTestsToPackagePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const packageId = searchParams.get('packageId');

  const [packageData, setPackageData] = useState(null);
  const [tests, setTests] = useState([]);
  const [attachedTestIds, setAttachedTestIds] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!packageId) return;
    loadData();
  }, [packageId]);

  const loadData = async () => {
    try {
      setLoading(true);

      /* -------- Package -------- */
      const pkgSnap = await getDocs(
        query(collection(db, 'packages'), where('__name__', '==', packageId))
      );
      pkgSnap.forEach(d => setPackageData({ id: d.id, ...d.data() }));

      /* -------- All Tests -------- */
      const testSnap = await getDocs(collection(db, 'testPapers'));
      const allTests = testSnap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      }));
      setTests(allTests);

      /* -------- Already Attached -------- */
      const ptSnap = await getDocs(
        query(
          collection(db, 'packageTests'),
          where('packageId', '==', packageId),
          where('active', '==', true)
        )
      );

      const attached = ptSnap.docs.map(d => d.data().testPaperId);
      setAttachedTestIds(attached);
      setSelected(attached);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const save = async () => {
    for (let i = 0; i < selected.length; i++) {
      if (attachedTestIds.includes(selected[i])) continue;

      await addDoc(collection(db, 'packageTests'), {
        packageId,
        testPaperId: selected[i],
        order: i + 1,
        active: true,
        createdAt: serverTimestamp(),
      });
    }

    alert('Tests attached successfully');
    router.push('/admin/packages');
  };

  if (!packageId) return <p>Invalid package</p>;
  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>
        Attach Tests to Package
      </h1>

      {packageData && (
        <p style={{ color: '#555' }}>
          Package: <strong>{packageData.title}</strong>
        </p>
      )}

      <hr style={{ margin: '15px 0' }} />

      {tests.map(t => (
        <label key={t.id} style={{ display: 'block', marginBottom: '8px' }}>
          <input
            type="checkbox"
            checked={selected.includes(t.id)}
            onChange={() => toggle(t.id)}
          />{' '}
          {t.title}
        </label>
      ))}

      <button
        onClick={save}
        style={{
          marginTop: '20px',
          padding: '10px 15px',
          background: 'black',
          color: 'white',
          border: 'none',
        }}
      >
        Save Tests
      </button>
    </div>
  );
}
