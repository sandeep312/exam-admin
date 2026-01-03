'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const q = query(
          collection(db, 'examBlueprints'),
          orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setExams(data);
      } catch (error) {
        console.error('Error fetching exam blueprints:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>
        Exam Blueprints
      </h1>

      {/* Create Blueprint Button */}
      <a
        href="/admin/exams/create"
        style={{
          display: 'inline-block',
          marginBottom: '20px',
          padding: '10px 15px',
          background: 'black',
          color: 'white',
          textDecoration: 'none',
        }}
      >
        + Create Blueprint
      </a>

      {loading ? (
        <p>Loading exams...</p>
      ) : exams.length === 0 ? (
        <p>No exam blueprints found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Name</th>
              <th style={th}>Exam Type</th>
              <th style={th}>Duration</th>
              <th style={th}>Total Marks</th>
              <th style={th}>Status</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {exams.map((exam) => (
              <tr key={exam.id}>
                <td style={td}>{exam.name}</td>
                <td style={td}>{exam.examType}</td>
                <td style={td}>{exam.totalDurationMinutes} min</td>
                <td style={td}>{exam.totalMarks}</td>
                <td style={td}>{exam.active ? 'Active' : 'Inactive'}</td>
                <td style={td}>
                  <a
                    href={`/admin/exams/sections?blueprintId=${exam.id}`}
                    style={{ marginRight: '10px' }}
                  >
                    Sections
                  </a>


                  <a href="#">Edit</a>
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
