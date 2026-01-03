'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  collection,
  getDocs,
  getDoc,
  query,
  where,
  doc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ExamEnginePage() {
  const { attemptId } = useParams();
  const initializedRef = useRef(false);
  const timerRef = useRef(null);

  /* ---------------- STATE ---------------- */
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [test, setTest] = useState(null);
  const [pkg, setPkg] = useState(null);
  const [blueprint, setBlueprint] = useState(null);

  const [sections, setSections] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [globalRemaining, setGlobalRemaining] = useState(null);
  const [sectionRemaining, setSectionRemaining] = useState(null);

  /* ---------------- DERIVED ---------------- */
  const hasSectionTiming = sections.some(s => s.durationMinutes);

  /* ---------------- LOAD ENGINE ---------------- */
  useEffect(() => {
    if (!attemptId || initializedRef.current) return;
    initializedRef.current = true;
    loadEngine();
  }, [attemptId]);

  const loadEngine = async () => {
    try {
      setLoading(true);

      const attemptSnap = await getDoc(doc(db, 'examAttempts', attemptId));
      if (!attemptSnap.exists()) throw new Error('Invalid attempt');
      const attempt = attemptSnap.data();

      const testSnap = await getDoc(doc(db, 'testPapers', attempt.testPaperId));
      const testData = testSnap.data();
      setTest(testData);

      const blueprintSnap = await getDoc(
        doc(db, 'examBlueprints', testData.blueprintId)
      );
      if (blueprintSnap.exists()) {
        const bp = blueprintSnap.data();
        setBlueprint(bp);
        if (bp.totalDurationMinutes) {
          setGlobalRemaining(bp.totalDurationMinutes * 60);
        }
      }

      if (attempt.packageId) {
        const pkgSnap = await getDoc(doc(db, 'packages', attempt.packageId));
        if (pkgSnap.exists()) setPkg(pkgSnap.data());
      }

      const sectionSnap = await getDocs(
        query(
          collection(db, 'examSections'),
          where('blueprintId', '==', testData.blueprintId)
        )
      );

      const sectionList = sectionSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => a.sectionName.localeCompare(b.sectionName));
      setSections(sectionList);

      const tpqSnap = await getDocs(
        query(
          collection(db, 'testPaperQuestions'),
          where('testPaperId', '==', attempt.testPaperId),
          where('active', '==', true)
        )
      );

      const tpqList = tpqSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const qIds = [...new Set(tpqList.map(q => q.questionId))];

      const qbSnap = await getDocs(
        query(collection(db, 'questionBank'), where('__name__', 'in', qIds))
      );

      const qbMap = {};
      qbSnap.docs.forEach(d => (qbMap[d.id] = { id: d.id, ...d.data() }));

      const finalQuestions = [];
      sectionList.forEach(section => {
        tpqList
          .filter(q => q.sectionId === section.id)
          .sort((a, b) => a.questionOrder - b.questionOrder)
          .forEach(q => {
            if (qbMap[q.questionId]) {
              finalQuestions.push({
                ...qbMap[q.questionId],
                sectionId: section.id,
              });
            }
          });
      });

      setQuestions(finalQuestions);

      const firstSection = sectionList.find(s =>
        finalQuestions.some(q => q.sectionId === s.id)
      );
      if (firstSection?.durationMinutes) {
        setSectionRemaining(firstSection.durationMinutes * 60);
      }

      setCurrentQuestionIndex(0);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setError('Failed to load exam');
      setLoading(false);
    }
  };

  /* ---------------- AUTO SUBMIT ---------------- */
  const handleAutoSubmit = () => {
    alert('Time up! Exam auto-submitted.');
  };

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (globalRemaining === null && sectionRemaining === null) return;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setGlobalRemaining(prev => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });

      setSectionRemaining(prev =>
        prev === null ? null : Math.max(prev - 1, 0)
      );
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [globalRemaining, sectionRemaining]);

  /* ---------------- HELPERS ---------------- */
  const currentQuestion = questions[currentQuestionIndex];
  const currentSection = sections.find(
    s => s.id === currentQuestion?.sectionId
  );

  const formatTime = seconds => {
    if (seconds == null) return '--:--';

    if (seconds >= 3600) {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(
        2,
        '0'
      )}:${String(s).padStart(2, '0')}`;
    } else {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
  };

  const getPaletteColor = q => {
    const a = answers[q.id];
    if (a?.isMarkedForReview && a?.selectedOptionIndex != null) return '#ff9800';
    if (a?.isMarkedForReview) return '#9c27b0';
    if (a?.selectedOptionIndex != null) return '#4caf50';
    return '#eee';
  };

  /* ---------------- RENDER ---------------- */
  if (loading) return <p>Loading exam…</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* LEFT PANEL */}
      <div style={{ flex: 3, padding: 20 }}>
        {/* HEADER */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr 1fr',
            alignItems: 'center',
            borderBottom: '1px solid #ddd',
            paddingBottom: 10,
            marginBottom: 20,
          }}
        >
          <strong>LOGO</strong>

          <div style={{ textAlign: 'center' }}>
            <h2 style={{ margin: 0 }}>{test?.title}</h2>
            {pkg && <div>{pkg.title}</div>}
          </div>

          <div style={{ textAlign: 'right' }}>
            {globalRemaining !== null && (
              <div
                style={{
                  fontSize: hasSectionTiming ? 14 : 22,
                  fontWeight: hasSectionTiming ? 'normal' : 'bold',
                  color: globalRemaining <= 300 ? 'red' : '#000',
                }}
              >
                ⏱ {formatTime(globalRemaining)}
              </div>
            )}

            {hasSectionTiming &&
              sectionRemaining > 0 &&
              currentSection?.durationMinutes && (
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 13,
                    color: sectionRemaining <= 300 ? 'red' : '#000',
                    fontWeight:
                      sectionRemaining <= 300 ? 'bold' : 'normal',
                  }}
                >
                  📘 {currentSection.sectionName}:{' '}
                  {formatTime(sectionRemaining)}
                </div>
              )}
          </div>
        </div>
        {/* SECTION TABS */}
        <div style={{ marginBottom: 20 }}>
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() =>
                setCurrentQuestionIndex(
                  questions.findIndex(q => q.sectionId === s.id)
                )
              }
              style={{
                marginRight: 8,
                padding: '6px 12px',
                background:
                  currentQuestion?.sectionId === s.id ? '#000' : '#eee',
                color:
                  currentQuestion?.sectionId === s.id ? '#fff' : '#000',
                border: 'none',
              }}
            >
              {s.sectionName}
            </button>
          ))}
        </div>

        {/* QUESTION */}
        {currentQuestion && (
          <>
            <h3>
              Q{currentQuestionIndex + 1}. {currentQuestion.questionText}
            </h3>

            {/* OPTIONS */}
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {currentQuestion.options.map((opt, i) => (
                <li
                  key={i}
                  style={{
                    padding: 10,
                    marginBottom: 8,
                    border: '1px solid #ccc',
                  }}
                >
                  <label>
                    <input
                      type="radio"
                      name={`q-${currentQuestion.id}`}
                      checked={
                        answers[currentQuestion.id]?.selectedOptionIndex === i
                      }
                      onChange={() =>
                        setAnswers(prev => ({
                          ...prev,
                          [currentQuestion.id]: {
                            ...(prev[currentQuestion.id] || {}),
                            selectedOptionIndex: i,
                          },
                        }))
                      }
                      style={{ marginRight: 8 }}
                    />
                    {opt}
                  </label>
                </li>
              ))}
            </ul>

            {/* ACTION BUTTONS */}
            <div style={{ marginTop: 12 }}>
              <button
                onClick={() =>
                  setAnswers(prev => ({
                    ...prev,
                    [currentQuestion.id]: {
                      ...prev[currentQuestion.id],
                      selectedOptionIndex: null,
                    },
                  }))
                }
              >
                Clear Answer
              </button>
              <button
                onClick={() =>
                  setAnswers(prev => ({
                    ...prev,
                    [currentQuestion.id]: {
                      ...(prev[currentQuestion.id] || {}),
                      isMarkedForReview:
                        !prev[currentQuestion.id]?.isMarkedForReview,
                    },
                  }))
                }
                style={{ marginLeft: 10 }}
              >
                {answers[currentQuestion.id]?.isMarkedForReview
                  ? 'Unmark Review'
                  : 'Mark for Review'}
              </button>
            </div>

            {/* NAVIGATION */}
            <div style={{ marginTop: 20 }}>
              <button
                onClick={() =>
                  setCurrentQuestionIndex(i => Math.max(i - 1, 0))
                }
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentQuestionIndex(i =>
                    Math.min(i + 1, questions.length - 1)
                  )
                }
                disabled={currentQuestionIndex === questions.length - 1}
                style={{ marginLeft: 10 }}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {/* RIGHT PANEL */}
      <div
        style={{
          flex: 1,
          borderLeft: '1px solid #ddd',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h4>Questions</h4>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 6,
            maxHeight: '50vh',
            overflowY: 'auto',
          }}
        >
          {questions.map((q, i) => (
            <button
              key={`${q.id}-${i}`}
              onClick={() => setCurrentQuestionIndex(i)}
              style={{
                height: 36,
                background: getPaletteColor(q),
                color: getPaletteColor(q) === '#eee' ? '#000' : '#fff',
                border:
                  i === currentQuestionIndex
                    ? '2px solid #000'
                    : '1px solid #ccc',
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 12, marginTop: 10 }}>
          <div><span style={{ background: '#eee', padding: '0 8px' }} /> Not Visited</div>
          <div><span style={{ background: '#4caf50', padding: '0 8px' }} /> Answered</div>
          <div><span style={{ background: '#9c27b0', padding: '0 8px' }} /> Review</div>
          <div><span style={{ background: '#ff9800', padding: '0 8px' }} /> Ans + Review</div>
        </div>

        <button
          onClick={() => alert('Submit')}
          style={{
            marginTop: 10,
            padding: 10,
            background: '#000',
            color: '#fff',
          }}
        >
          Submit Exam
        </button>
      </div>
      </div>
   
  );
}
