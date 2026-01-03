'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ViewPackagePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const packageId = searchParams.get('packageId');

  const [pkg, setPkg] = useState(null);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!packageId) return;
    loadData();
  }, [packageId]);

  const loadData = async () => {
    try {
      /* -------- PACKAGE -------- */
      const pkgSnap = await getDoc(doc(db, 'packages', packageId));
      if (!pkgSnap.exists()) {
        setLoading(false);
        return;
      }
      setPkg(pkgSnap.data());

      /* -------- PACKAGE TEST LINKS -------- */
      const ptSnap = await getDocs(
        query(
          collection(db, 'packageTests'),
          where('packageId', '==', packageId)
        )
      );

      const links = ptSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(l => l.active === true);

      if (links.length === 0) {
        setTests([]);
        setLoading(false);
        return;
      }

      /* -------- ALL TEST PAPERS -------- */
      const tpSnap = await getDocs(collection(db, 'testPapers'));

      const testMap = {};
      tpSnap.docs.forEach(d => {
        testMap[d.id] = { id: d.id, ...d.data() };
      });

      /* -------- MERGE + SORT -------- */
      const merged = links
        .map(l => ({
          ...l,
          test: testMap[l.testPaperId],
        }))
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      setTests(merged);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  if (loading) return <p>Loading package...</p>;
  if (!pkg) return <p>Invalid package</p>;

  return (
    <div style={{ maxWidth: '900px' }}>
      <button onClick={() => router.push('/admin/packages')}>
        ← Back
      </button>

      <h1 style={{ fontSize: '26px', fontWeight: 'bold' }}>
        {pkg.title}
      </h1>

      <p><b>Exam:</b> {pkg.examType}</p>
      <p><b>Language:</b> {pkg.language}</p>
      <p><b>Level:</b> {pkg.level}</p>
      <p><b>Validity:</b> {pkg.validityDays} days</p>
      <p><b>Price:</b> {pkg.currency} {pkg.price}</p>
      <p><b>Status:</b> {pkg.active ? 'Active' : 'Inactive'}</p>

      <hr />

      <h2>
        Tests in this Package ({tests.length})
      </h2>

      {tests.length === 0 ? (
        <p>No tests attached.</p>
      ) : (
        <ul>
          {tests.map((t, i) => (
            <li key={t.id}>
              <b>{i + 1}. {t.test?.title}</b>
              <span style={{ marginLeft: 10 }}>
                ({t.test?.status})
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
