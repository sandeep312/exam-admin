'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function TestInstructionsPage() {
  const { testPaperId } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [test, setTest] = useState(null);
  const [blueprint, setBlueprint] = useState(null);
  const [sections, setSections] = useState([]);

  useEffect(() => {
    if (!testPaperId) return;
    loadInstructions();
  }, [testPaperId]);

  const loadInstructions = async () => {
    try {
      /* -------- LOAD TEST -------- */
      const testSnap = await getDoc(doc(db, 'testPapers', testPaperId));
      if (!testSnap.exists()) {
        setError('Invalid test');
        setLoading(false);
        return;
      }

      const testData = testSnap.data();
      setTest(testData);

      /* -------- LOAD BLUEPRINT -------- */
      const bpSnap = await getDoc(
        doc(db, 'examBlueprints', testData.blueprintId)
      );
      if (!bpSnap.exists()) {
        setError('Invalid exam blueprint');
        setLoading(false);
        return;
      }

      const bpData = bpSnap.data();
      setBlueprint(bpData);

      /* -------- LOAD SECTIONS -------- */
      const sectionSnap = await getDocs(
        query(
          collection(db, 'examSections'),
          where('blueprintId', '==', testData.blueprintId)
        )
      );

      setSections(
        sectionSnap.docs.map(d => ({
          id: d.id,
          ...d.data(),
        }))
      );

      setLoading(false);
    } catch (e) {
      console.error(e);
      setError('Failed to load instructions');
      setLoading(false);
    }
  };

  if (loading) return <p>Loading instructions…</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>
        {test.title}
      </h1>

      <p style={{ marginTop: '5px', color: '#555' }}>
        Exam Type: <strong>{blueprint.examType}</strong>
      </p>

      <hr style={{ margin: '20px 0' }} />

      {/* -------- EXAM OVERVIEW -------- */}
      <h2>Exam Overview</h2>

      <ul style={{ lineHeight: '1.8' }}>
        <li>Total Duration: {blueprint.totalDurationMinutes} minutes</li>
        <li>Total Marks: {blueprint.totalMarks}</li>
        <li>Negative Marking: {blueprint.negativeMarking}</li>
        <li>Section-wise Timer: {blueprint.sectionWiseTimer ? 'Yes' : 'No'}</li>
        <li>Shuffle Questions: {blueprint.shuffleQuestions ? 'Yes' : 'No'}</li>
        <li>Shuffle Options: {blueprint.shuffleOptions ? 'Yes' : 'No'}</li>
      </ul>

      {/* -------- SECTIONS -------- */}
      <h2 style={{ marginTop: '25px' }}>Sections</h2>

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginTop: '10px',
        }}
      >
        <thead>
          <tr>
            <th style={th}>Section</th>
            <th style={th}>Questions</th>
            <th style={th}>Marks / Q</th>
            <th style={th}>Time (mins)</th>
          </tr>
        </thead>
        <tbody>
          {sections.map(s => (
            <tr key={s.id}>
              <td style={td}>{s.sectionName}</td>
              <td style={td}>{s.totalQuestions}</td>
              <td style={td}>{s.marksPerQuestion}</td>
              <td style={td}>{s.durationMinutes}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* -------- INSTRUCTIONS -------- */}
      <h2 style={{ marginTop: '25px' }}>Instructions</h2>

      <div
        style={{
          padding: '15px',
          background: '#f9f9f9',
          border: '1px solid #ddd',
          borderRadius: '6px',
          whiteSpace: 'pre-line',
        }}
      >
        {blueprint.instructions || 'No instructions provided.'}
      </div>

      {/* -------- START EXAM -------- */}
      <button
        onClick={() =>
          router.push(`/student/tests/${testPaperId}`)
        }
        style={{
          marginTop: '30px',
          padding: '12px 18px',
          background: 'black',
          color: 'white',
          border: 'none',
          fontSize: '16px',
          cursor: 'pointer',
        }}
      >
        Start Exam
      </button>
    </div>
  );
}

/* -------- STYLES -------- */

const th = {
  textAlign: 'left',
  borderBottom: '1px solid #ccc',
  padding: '10px',
};

const td = {
  borderBottom: '1px solid #eee',
  padding: '10px',
};
