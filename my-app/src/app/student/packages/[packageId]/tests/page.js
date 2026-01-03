'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function StudentPackageTestsPage() {
  const router = useRouter();
  const params = useParams();
  const packageId = params.packageId;

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!packageId) return;
    loadTests();
  }, [packageId]);

  const loadTests = async () => {
    try {
      setLoading(true);

      /* -------- STEP 1: GET packageTests -------- */
      const ptSnap = await getDocs(
        query(
          collection(db, 'packageTests'),
          where('packageId', '==', packageId),
          where('active', '==', true)
        )
      );

      if (ptSnap.empty) {
        setTests([]);
        setLoading(false);
        return;
      }

      const testPaperIds = ptSnap.docs
        .map(d => d.data().testPaperId)
        .filter(Boolean);

      if (testPaperIds.length === 0) {
        setTests([]);
        setLoading(false);
        return;
      }

      /* -------- STEP 2: GET testPapers -------- */
      const tpSnap = await getDocs(
        query(
          collection(db, 'testPapers'),
          where('__name__', 'in', testPaperIds),
          where('status', '==', 'published')
        )
      );

      const testList = tpSnap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      }));

      setTests(testList);
      setLoading(false);
    } catch (error) {
      console.error('Error loading package tests:', error);
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>
        Tests in this Package
      </h1>

      {loading ? (
        <p>Loading tests...</p>
      ) : tests.length === 0 ? (
        <p>No tests available in this package.</p>
      ) : (
        <div
          style={{
            marginTop: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {tests.map(test => (
            <div
              key={test.id}
              style={{
                padding: '20px',
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: '6px',
              }}
            >
              <h3>{test.title}</h3>

              <p style={{ color: '#555' }}>
                Duration: {test.totalDurationMinutes} mins
              </p>

              <p style={{ color: '#555' }}>
                Max Attempts: {test.maxAttempts}
              </p>

              <button
                onClick={() =>
                  router.push(`/student/tests/${test.id}/instructions`)
                }
                style={{
                  marginTop: '10px',
                  padding: '8px 12px',
                  background: 'black',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Start Test
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
