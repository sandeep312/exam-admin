'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  where,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AttachQuestionsPage() {
  const searchParams = useSearchParams();
  const testPaperId = searchParams.get('testPaperId');

  const [sections, setSections] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!testPaperId) return;

    const loadData = async () => {
      try {
        // 1️⃣ Load test paper to get blueprintId
        const testPaperRef = doc(db, 'testPapers', testPaperId);
        const testPaperSnap = await getDoc(testPaperRef);

        if (!testPaperSnap.exists()) {
          alert('Invalid test paper');
          return;
        }

        const testPaper = testPaperSnap.data();
        const blueprintId = testPaper.blueprintId;

        // 2️⃣ Load sections using blueprintId
        const sectionSnap = await getDocs(
          query(
            collection(db, 'examSections'),
            where('blueprintId', '==', blueprintId),
            where('active', '==', true)
          )
        );

        setSections(sectionSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // 3️⃣ Load question bank
        const questionSnap = await getDocs(
          query(collection(db, 'questionBank'), where('active', '==', true))
        );

        setQuestions(questionSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error('Error loading data:', error);
        alert('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [testPaperId]);

  const toggleQuestion = (id) => {
    setSelectedQuestions((prev) =>
      prev.includes(id)
        ? prev.filter((q) => q !== id)
        : [...prev, id]
    );
  };

  const saveQuestions = async () => {
    if (!testPaperId || !selectedSection) {
      alert('Select test paper and section');
      return;
    }

    if (selectedQuestions.length === 0) {
      alert('Select at least one question');
      return;
    }

    try {
      for (let i = 0; i < selectedQuestions.length; i++) {
        await addDoc(collection(db, 'testPaperQuestions'), {
          testPaperId,
          sectionId: selectedSection,
          questionId: selectedQuestions[i],
          questionOrder: i + 1,
          active: true,
          createdAt: serverTimestamp(),
        });
      }

      alert('Questions attached successfully');
      setSelectedQuestions([]);
    } catch (error) {
      console.error('Error attaching questions:', error);
      alert('Error attaching questions');
    }
  };

  if (!testPaperId) {
    return <p style={{ color: 'red' }}>Missing testPaperId in URL</p>;
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>
        Attach Questions to Test Paper
      </h1>

      <select
        value={selectedSection}
        onChange={(e) => setSelectedSection(e.target.value)}
        style={input}
      >
        <option value="">Select Section</option>
        {sections.map((s) => (
          <option key={s.id} value={s.id}>
            {s.sectionName}
          </option>
        ))}
      </select>

      <div style={{ marginTop: '20px' }}>
        {questions.map((q) => (
          <label key={q.id} style={{ display: 'block', marginBottom: '6px' }}>
            <input
              type="checkbox"
              checked={selectedQuestions.includes(q.id)}
              onChange={() => toggleQuestion(q.id)}
            />
            {' '}
            {q.questionText}
          </label>
        ))}
      </div>

      {selectedQuestions.length > 0 && (
        <button onClick={saveQuestions} style={button}>
          Save Questions
        </button>
      )}
    </div>
  );
}

const input = { padding: '8px', width: '300px', marginBottom: '10px' };
const button = {
  marginTop: '20px',
  padding: '10px 16px',
  background: 'black',
  color: 'white',
  border: 'none',
};
