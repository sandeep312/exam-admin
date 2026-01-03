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

export default function QuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    const q = query(
      collection(db, 'questionBank'),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    setQuestions(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  const toggleQuestionStatus = async (id, currentStatus) => {
  const action = currentStatus ? 'Deactivate' : 'Activate';

  if (!window.confirm(`${action} this question?`)) return;

  await updateDoc(doc(db, 'questionBank', id), {
    active: !currentStatus,
  });

  alert(`Question ${action}d successfully`);
  loadQuestions();
};


  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '15px' }}>
        Question Bank
      </h1>

      {/* CREATE BUTTON ABOVE TABLE */}
      <a
        href="/admin/question-bank/create"
        style={{
          display: 'inline-block',
          marginBottom: '20px',
          padding: '10px 15px',
          background: 'black',
          color: 'white',
          textDecoration: 'none',
        }}
      >
        + Create Question
      </a>

      {loading ? (
        <p>Loading questions...</p>
      ) : questions.length === 0 ? (
        <p>No questions found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Question</th>
              <th style={th}>Subject</th>
              <th style={th}>Difficulty</th>
              <th style={th}>Marks</th>
              <th style={th}>Status</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {questions.map((q) => (
              <tr key={q.id}>
                <td style={td}>{q.questionText}</td>
                <td style={td}>{q.subject}</td>
                <td style={td}>{q.difficulty}</td>
                <td style={td}>{q.marks}</td>
                <td style={td}>{q.active ? 'Active' : 'Inactive'}</td>
                <td style={td}>
                  <a
                    href={`/admin/question-bank/edit?id=${q.id}`}
                    style={{ marginRight: '10px' }}
                  >
                    Edit
                  </a>
                 <button
  onClick={() => toggleQuestionStatus(q.id, q.active)}
  style={{
    ...linkBtn,
    color: q.active ? 'red' : 'green',
  }}
>
  {q.active ? 'Deactivate' : 'Activate'}
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
  color: 'red',
  cursor: 'pointer',
};
