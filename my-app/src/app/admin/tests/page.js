'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  orderBy,
  query,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function TestsPage() {
  const [tests, setTests] = useState([]);
  const [blueprintMap, setBlueprintMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTests();
  }, []);

  /* ---------------- LOAD TESTS + BLUEPRINTS ---------------- */
  const loadTests = async () => {
    // Load tests
    const testSnap = await getDocs(
      query(collection(db, 'testPapers'), orderBy('createdAt', 'desc'))
    );

    const testsData = testSnap.docs.map(d => ({
      id: d.id,
      ...d.data(),
    }));
    setTests(testsData);

    // Load blueprints for name lookup
    const bpSnap = await getDocs(collection(db, 'examBlueprints'));
    const map = {};
    bpSnap.docs.forEach(d => {
      map[d.id] = d.data().name;
    });
    setBlueprintMap(map);

    setLoading(false);
  };

  /* ---------------- PUBLISH / UNPUBLISH ---------------- */
  const togglePublishStatus = async (id, currentStatus) => {
    const action = currentStatus === 'published' ? 'Unpublish' : 'Publish';

    if (!window.confirm(`${action} this test?`)) return;

    await updateDoc(doc(db, 'testPapers', id), {
      status: currentStatus === 'published' ? 'draft' : 'published',
    });

    alert(`Test ${action}ed successfully`);
    loadTests();
  };

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '15px' }}>
        Tests
      </h1>

      {/* CREATE TEST */}
      <a
        href="/admin/tests/create"
        style={{
          display: 'inline-block',
          marginBottom: '20px',
          padding: '10px 15px',
          background: 'black',
          color: 'white',
          textDecoration: 'none',
        }}
      >
        + Create Test
      </a>

      {loading ? (
        <p>Loading tests...</p>
      ) : tests.length === 0 ? (
        <p>No tests found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Title</th>
              <th style={th}>Blueprint</th>
              <th style={th}>Status</th>
              <th style={th}>Available From</th>
              <th style={th}>Available Till</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {tests.map((t) => (
              <tr key={t.id}>
                <td style={td}>{t.title}</td>

                {/* Blueprint Name */}
                <td style={td}>
                  {blueprintMap[t.blueprintId] || '—'}
                </td>

                <td style={td}>
                  {t.status === 'published' ? 'Published' : 'Draft'}
                </td>

                <td style={td}>
                  {t.availableFrom
                    ? new Date(t.availableFrom.seconds * 1000).toLocaleString()
                    : '-'}
                </td>

                <td style={td}>
                  {t.availableTill
                    ? new Date(t.availableTill.seconds * 1000).toLocaleString()
                    : '-'}
                </td>

                <td style={td}>
                  {/* Preview Eye */}
                  <a
                    href={`/admin/tests/preview?testPaperId=${t.id}`}
                    title="Preview Test"
                    style={{ marginRight: '12px', fontSize: '18px' }}
                  >
                    👁️
                  </a>

                  {/* Attach Questions */}
                  <a
                    href={`/admin/tests/questions?testPaperId=${t.id}`}
                    style={{ marginRight: '12px' }}
                  >
                    Attach Questions
                  </a>

                  {/* Publish Toggle */}
                  <button
                    onClick={() => togglePublishStatus(t.id, t.status)}
                    style={{
                      ...linkBtn,
                      color: t.status === 'published' ? 'red' : 'green',
                    }}
                  >
                    {t.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const th = {
  textAlign: 'left',
  borderBottom: '1px solid #ccc',
  padding: '10px',
};

const td = {
  borderBottom: '1px solid #eee',
  padding: '10px',
};

const linkBtn = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontWeight: 'bold',
};
