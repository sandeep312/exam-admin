'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DEMO_STUDENT_ID } from '@/lib/demoUser';

export default function StudentPackagesPage() {
  const router = useRouter();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);

      const now = Timestamp.now();

      /* ---------- USER PACKAGES ---------- */
      const upSnap = await getDocs(
        query(
          collection(db, 'userPackages'),
          where('userId', '==', DEMO_STUDENT_ID),
          where('active', '==', true),
          where('expiryDate', '>', now)
        )
      );

      if (upSnap.empty) {
        setPackages([]);
        setLoading(false);
        return;
      }

      const packageIds = upSnap.docs
        .map(d => d.data().packageId)
        .filter(Boolean);

      if (packageIds.length === 0) {
        setPackages([]);
        setLoading(false);
        return;
      }

      /* ---------- LOAD PACKAGE DETAILS ---------- */
      const pkgSnap = await getDocs(
        query(
          collection(db, 'packages'),
          where('__name__', 'in', packageIds)
        )
      );

      setPackages(
        pkgSnap.docs.map(d => ({
          id: d.id,
          ...d.data(),
        }))
      );

      setLoading(false);
    } catch (error) {
      console.error('Error loading student packages:', error);
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>
        My Packages
      </h1>

      {loading ? (
        <p>Loading your packages...</p>
      ) : packages.length === 0 ? (
        <p>You do not have any active packages.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '20px',
            marginTop: '20px',
          }}
        >
          {packages.map(p => (
            <div
              key={p.id}
              style={{
                padding: '20px',
                background: '#fff',
                borderRadius: '6px',
                boxShadow: '0 0 4px rgba(0,0,0,0.1)',
              }}
            >
              <h3>{p.title}</h3>
              <p style={{ color: '#555' }}>{p.description}</p>

              <p style={{ marginTop: '10px' }}>
                <strong>Validity:</strong> {p.validityDays} days
              </p>

              <button
                onClick={() =>
                  router.push(`/student/packages/${p.id}/tests`)
                }
                style={{
                  marginTop: '12px',
                  padding: '8px 12px',
                  background: 'black',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                View Tests
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
