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

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPackages();
  }, []);

  /* ---------------- LOAD PACKAGES ---------------- */
  const loadPackages = async () => {
    const q = query(
      collection(db, 'packages'),
      orderBy('order', 'asc')
    );

    const snapshot = await getDocs(q);
    setPackages(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  /* ---------------- ACTIVATE / DEACTIVATE ---------------- */
  const toggleActive = async (id, currentStatus) => {
    const action = currentStatus ? 'Deactivate' : 'Activate';

    if (!window.confirm(`${action} this package?`)) return;

    await updateDoc(doc(db, 'packages', id), {
      active: !currentStatus,
    });

    alert(`Package ${action}d successfully`);
    loadPackages();
  };

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '15px' }}>
        Packages
      </h1>

      {/* CREATE PACKAGE */}
      <a
        href="/admin/packages/create"
        style={{
          display: 'inline-block',
          marginBottom: '20px',
          padding: '10px 15px',
          background: 'black',
          color: 'white',
          textDecoration: 'none',
        }}
      >
        + Create Package
      </a>

      {loading ? (
        <p>Loading packages...</p>
      ) : packages.length === 0 ? (
        <p>No packages found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Title</th>
              <th style={th}>Exam Type</th>
              <th style={th}>Price</th>
              <th style={th}>Discount</th>
              <th style={th}>Validity</th>
              <th style={th}>Featured</th>
              <th style={th}>Status</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {packages.map((p) => (
              <tr key={p.id}>
                <td style={td}>{p.title}</td>
                <td style={td}>{p.examType}</td>

                <td style={td}>
                  {p.currency} {p.price}
                </td>

                <td style={td}>
                  {p.discountPrice
                    ? `${p.currency} ${p.discountPrice}`
                    : '-'}
                </td>

                <td style={td}>{p.validityDays} days</td>

                <td style={td}>{p.featured ? 'Yes' : 'No'}</td>

                <td style={td}>{p.active ? 'Active' : 'Inactive'}</td>

                {/* ACTIONS */}
                <td style={td}>
                  <a
                    href={`/admin/packages/view?packageId=${p.id}`}
                    style={{ marginRight: '12px' }}
                  >
                    View
                  </a>

                  <a
                    href={`/admin/packages/tests?packageId=${p.id}`}
                    style={{ marginRight: '12px' }}
                  >
                    Attach Tests
                  </a>

                  <a
                    href={`/admin/packages/edit?id=${p.id}`}
                    style={{ marginRight: '12px' }}
                  >
                    Edit
                  </a>

<a
  href="/admin/packages/assign"
  style={{ marginRight: '12px' }}
>
  Assign to User
</a>


                  <button
                    onClick={() => toggleActive(p.id, p.active)}
                    style={{
                      ...linkBtn,
                      color: p.active ? 'red' : 'green',
                    }}
                  >
                    {p.active ? 'Deactivate' : 'Activate'}
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
