'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DEMO_STUDENT_ID } from '@/lib/demoUser';

export default function StartTestPage() {
  const { testPaperId } = useParams();
  const router = useRouter();

  const hasStartedRef = useRef(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    startTest();
  }, []);

  const startTest = async () => {
    try {
      /* ---------- LOAD TEST ---------- */
      const testRef = doc(db, 'testPapers', testPaperId);
      const testSnap = await getDoc(testRef);

      if (!testSnap.exists()) {
        setError('Invalid test');
        return;
      }

      const test = testSnap.data();

      if (!test.blueprintId) {
        setError('Test is missing blueprint');
        return;
      }

      if (test.status !== 'published') {
        setError('Test is not published');
        return;
      }

      const now = new Date();
      if (
        (test.availableFrom && test.availableFrom.toDate() > now) ||
        (test.availableTill && test.availableTill.toDate() < now)
      ) {
        setError('Test is not currently available');
        return;
      }

      /* ---------- RESUME EXISTING ATTEMPT ---------- */
      const existingSnap = await getDocs(
        query(
          collection(db, 'examAttempts'),
          where('userId', '==', DEMO_STUDENT_ID),
          where('testPaperId', '==', testPaperId),
          where('status', '==', 'in_progress')
        )
      );

      if (!existingSnap.empty) {
        router.push(
          `/student/attempts/${existingSnap.docs[0].id}/engine`
        );
        return;
      }

      /* ---------- CHECK MAX ATTEMPTS ---------- */
      const allAttemptsSnap = await getDocs(
        query(
          collection(db, 'examAttempts'),
          where('userId', '==', DEMO_STUDENT_ID),
          where('testPaperId', '==', testPaperId)
        )
      );

      if (allAttemptsSnap.size >= test.maxAttempts) {
        setError('Maximum attempts reached');
        return;
      }

      /* ---------- CREATE NEW ATTEMPT ---------- */
      const attemptRef = await addDoc(collection(db, 'examAttempts'), {
        userId: DEMO_STUDENT_ID,
        testPaperId,
        blueprintId: test.blueprintId, // ✅ FIXED
        status: 'in_progress',
        startedAt: serverTimestamp(),
        createdAt: serverTimestamp(),

        totalQuestions: 0,
        attemptedQuestions: 0,
        correctAnswers: 0,
        score: 0,
        accuracy: 0,
      });

      router.push(`/student/attempts/${attemptRef.id}/engine`);
    } catch (err) {
      console.error('START TEST ERROR:', err);
      setError('Failed to start test');
    }
  };

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return <p>Preparing your test…</p>;
}
