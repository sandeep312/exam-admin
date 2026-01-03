'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function TestPapersPage() {
  const [testPapers, setTestPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestPapers = async () => {
      try {
        const q = query(
          collection(db, 'testPapers'),
          orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTestPapers(data);
      } catch (error) {
        console.error('Error fetching test papers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestPapers();
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>
        Test Papers
      </h1>

      {loading ? (
        <p>Loading test papers...</p>
      ) : testPapers.length === 0 ? (
        <p>No test papers found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Title</th>
              <th style={th}>Status</th>
              <th style={th}>Available From</th>
              <th style={th}>Available Till</th>
              <th style={th}>Max Attempts</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {testPapers.map((paper) => (
              <tr key={paper.id}>
                <td style={td}>{paper.title}</td>
                <td style={td}>{paper.status}</td>
                <td style={td}>
                  {paper.availableFrom
                    ? new Date(paper.availableFrom.seconds * 1000).toLocaleString()
                    : '-'}
                </td>
                <td style={td}>
                  {paper.availableTill
                    ? new Date(paper.availableTill.seconds * 1000).toLocaleString()
                    : '-'}
                </td>
                <td style={td}>{paper.maxAttempts}</td>
                <td style={td}>
                  <a
                    href={`/admin/exams/test-papers/questions?testPaperId=${paper.id}`}
                    style={{ marginRight: '10px' }}
                  >
                    Attach Questions
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const th = {
  textAlign: 'left',
  borderBottom: '1px solid #ccc',
  padding: '10px',
};

const td = {
  borderBottom: '1px solid #eee',
  padding: '10px',
};
