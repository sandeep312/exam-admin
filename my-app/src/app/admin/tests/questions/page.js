'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AttachQuestionsPage() {
  const searchParams = useSearchParams();
  const testPaperId = searchParams.get('testPaperId');

  const [blueprintId, setBlueprintId] = useState(null);
  const [sections, setSections] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [sectionCount, setSectionCount] = useState(0);

  /* ---------------- LOAD TEST → BLUEPRINT ---------------- */
  useEffect(() => {
    if (!testPaperId) return;

    const loadTest = async () => {
      const snap = await getDocs(
        query(collection(db, 'testPapers'), where('__name__', '==', testPaperId))
      );
      if (!snap.empty) {
        setBlueprintId(snap.docs[0].data().blueprintId);
      }
    };

    loadTest();
  }, [testPaperId]);

  /* ---------------- LOAD SECTIONS + QUESTIONS ---------------- */
  useEffect(() => {
    if (!blueprintId) return;

    const loadData = async () => {
      const sectionSnap = await getDocs(
        query(
          collection(db, 'examSections'),
          where('blueprintId', '==', blueprintId)
        )
      );

      setSections(sectionSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const questionSnap = await getDocs(
        query(collection(db, 'questionBank'), where('active', '==', true))
      );

      setQuestions(questionSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    loadData();
  }, [blueprintId]);

  /* ---------------- COUNT QUESTIONS IN SECTION ---------------- */
  useEffect(() => {
    if (!selectedSection) return;

    const countQuestions = async () => {
      const snap = await getDocs(
        query(
          collection(db, 'testPaperQuestions'),
          where('testPaperId', '==', testPaperId),
          where('sectionId', '==', selectedSection)
        )
      );
      setSectionCount(snap.size);
    };

    countQuestions();
  }, [selectedSection, testPaperId]);

  /* ---------------- TOGGLE QUESTION ---------------- */
  const toggleQuestion = (id) => {
    setSelectedQuestions(prev =>
      prev.includes(id)
        ? prev.filter(q => q !== id)
        : [...prev, id]
    );
  };

  /* ---------------- SAVE QUESTIONS WITH LIMIT CHECK ---------------- */
  const saveQuestions = async () => {
    const section = sections.find(s => s.id === selectedSection);
    const maxAllowed = section.totalQuestions;

    if (sectionCount + selectedQuestions.length > maxAllowed) {
      alert(
        `Section limit exceeded.\nAllowed: ${maxAllowed}\nAlready added: ${sectionCount}`
      );
      return;
    }

    for (let i = 0; i < selectedQuestions.length; i++) {
      await addDoc(collection(db, 'testPaperQuestions'), {
        testPaperId,
        sectionId: selectedSection,
        questionId: selectedQuestions[i],
        questionOrder: sectionCount + i + 1,
        marks: section.marksPerQuestion,
        active: true,
        createdAt: serverTimestamp(),
      });
    }

    alert('Questions added successfully');
    setSelectedQuestions([]);
    setSectionCount(sectionCount + selectedQuestions.length);
  };

  return (
    <div>
      <h1 style={{ fontSize: '26px', fontWeight: 'bold' }}>
        Attach Questions to Test
      </h1>

      <p style={{ marginTop: '10px' }}>
        Section Questions: {sectionCount}
      </p>

      <select
        value={selectedSection}
        onChange={(e) => setSelectedSection(e.target.value)}
        style={input}
      >
        <option value="">Select Section</option>
        {sections.map(s => (
          <option key={s.id} value={s.id}>
            {s.sectionName} (Max {s.totalQuestions})
          </option>
        ))}
      </select>

      <div style={{ marginTop: '20px' }}>
        {questions.map(q => (
          <label key={q.id} style={{ display: 'block' }}>
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

const input = {
  padding: '8px',
  width: '300px',
  marginTop: '15px',
};

const button = {
  marginTop: '20px',
  padding: '10px',
  background: 'black',
  color: 'white',
  border: 'none',
};
