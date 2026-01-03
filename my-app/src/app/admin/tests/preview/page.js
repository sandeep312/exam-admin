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

export default function PreviewTestPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const testPaperId = searchParams.get('testPaperId');

  const [test, setTest] = useState(null);
  const [blueprint, setBlueprint] = useState(null);
  const [sections, setSections] = useState([]);
  const [questionsMap, setQuestionsMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!testPaperId) return;

    const loadPreview = async () => {
      /* -------- Load Test -------- */
      const testSnap = await getDoc(doc(db, 'testPapers', testPaperId));
      if (!testSnap.exists()) return;

      const testData = testSnap.data();
      setTest(testData);

      /* -------- Load Blueprint -------- */
      const bpSnap = await getDoc(
        doc(db, 'examBlueprints', testData.blueprintId)
      );
      setBlueprint(bpSnap.data());

      /* -------- Load Sections -------- */
      const sectionSnap = await getDocs(
        query(
          collection(db, 'examSections'),
          where('blueprintId', '==', testData.blueprintId)
        )
      );

      const sectionList = sectionSnap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      }));
      setSections(sectionList);

      /* -------- Load Test Questions -------- */
      const tpqSnap = await getDocs(
        query(
          collection(db, 'testPaperQuestions'),
          where('testPaperId', '==', testPaperId)
        )
      );

      const questionIds = tpqSnap.docs.map(d => d.data().questionId);

      if (questionIds.length === 0) {
        setLoading(false);
        return;
      }

      /* -------- Load Questions -------- */
      const qbSnap = await getDocs(collection(db, 'questionBank'));

      const qMap = {};
      qbSnap.docs.forEach(d => {
        if (questionIds.includes(d.id)) {
          qMap[d.id] = d.data();
        }
      });

      setQuestionsMap(qMap);
      setLoading(false);
    };

    loadPreview();
  }, [testPaperId]);

  if (loading) {
    return <p>Loading preview...</p>;
  }

  if (!test || !blueprint) {
    return <p>Invalid test</p>;
  }

  return (
    <div style={{ maxWidth: '900px' }}>
      {/* BACK BUTTON */}
      <button
        onClick={() => router.push('/admin/tests')}
        style={{
          marginBottom: '15px',
          padding: '6px 12px',
          background: '#f5f5f5',
          border: '1px solid #ccc',
          cursor: 'pointer',
        }}
      >
        ← Back to Tests
      </button>

      <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>
        {test.title}
      </h1>

      <p style={{ marginTop: '5px', color: '#555' }}>
        Blueprint: <strong>{blueprint.name}</strong>
      </p>

      <hr style={{ margin: '20px 0' }} />

      {sections.map((section, idx) => (
        <div key={section.id} style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '22px' }}>
            Section {idx + 1}: {section.sectionName}
          </h2>

          <p style={{ color: '#666' }}>
            Questions: {section.totalQuestions} | Marks/Q:{' '}
            {section.marksPerQuestion}
          </p>

          {Object.entries(questionsMap).map(([qid, q], qIdx) => (
            <div
              key={qid}
              style={{
                marginTop: '15px',
                padding: '10px',
                border: '1px solid #ddd',
              }}
            >
              <p>
                <strong>Q{qIdx + 1}.</strong> {q.questionText}
              </p>

              <ul style={{ paddingLeft: '20px' }}>
                {q.options.map((opt, i) => (
                  <li key={i}>{opt}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
