'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function EditQuestionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const questionId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctOptionIndex: 0,
    questionType: 'MCQ_SINGLE',
    subject: '',
    topic: '',
    difficulty: 'Easy',
    language: 'english',
    marks: 1,
    active: true,
  });

  useEffect(() => {
    if (!questionId) return;

    const loadQuestion = async () => {
      try {
        const ref = doc(db, 'questionBank', questionId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          alert('Question not found');
          router.push('/admin/question-bank');
          return;
        }

        const data = snap.data();

        setForm({
          questionText: data.questionText || '',
          options: data.options || ['', '', '', ''],
          correctOptionIndex: data.correctOptionIndex ?? 0,
          questionType: data.questionType || 'MCQ_SINGLE',
          subject: data.subject || '',
          topic: data.topic || '',
          difficulty: data.difficulty || 'Easy',
          language: data.language || 'english',
          marks: data.marks || 1,
          active: data.active ?? true,
        });
      } catch (error) {
        console.error(error);
        alert('Failed to load question');
      } finally {
        setLoading(false);
      }
    };

    loadQuestion();
  }, [questionId, router]);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleOptionChange = (index, value) => {
    const updated = [...form.options];
    updated[index] = value;
    setForm({ ...form, options: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.questionText ||
      form.options.some(opt => opt.trim() === '') ||
      !form.subject
    ) {
      alert('Please fill all required fields');
      return;
    }

    try {
      await updateDoc(doc(db, 'questionBank', questionId), {
        questionText: form.questionText,
        options: form.options,
        correctOptionIndex: Number(form.correctOptionIndex),
        questionType: form.questionType,
        subject: form.subject,
        topic: form.topic,
        difficulty: form.difficulty,
        language: form.language,
        marks: Number(form.marks),
        active: form.active,
        updatedAt: serverTimestamp(),
      });

      alert('Question updated successfully');
      router.push('/admin/questions');
    } catch (error) {
      console.error(error);
      alert('Error updating question');
    }
  };

  if (loading) {
    return <p>Loading question...</p>;
  }

  return (
    <div style={{ maxWidth: '700px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>
        Edit Question
      </h1>

      <form onSubmit={handleSubmit}>
        <Field label="Question Text *">
          <textarea
            value={form.questionText}
            onChange={(e) => handleChange('questionText', e.target.value)}
            style={input}
          />
        </Field>

        <Field label="Options *">
          {form.options.map((opt, idx) => (
            <input
              key={idx}
              value={opt}
              onChange={(e) => handleOptionChange(idx, e.target.value)}
              placeholder={`Option ${idx + 1}`}
              style={input}
            />
          ))}
        </Field>

        <Field label="Correct Option">
          <select
            value={form.correctOptionIndex}
            onChange={(e) =>
              handleChange('correctOptionIndex', e.target.value)
            }
            style={input}
          >
            <option value={0}>Option 1</option>
            <option value={1}>Option 2</option>
            <option value={2}>Option 3</option>
            <option value={3}>Option 4</option>
          </select>
        </Field>

        <Field label="Subject *">
          <input
            value={form.subject}
            onChange={(e) => handleChange('subject', e.target.value)}
            style={input}
          />
        </Field>

        <Field label="Topic">
          <input
            value={form.topic}
            onChange={(e) => handleChange('topic', e.target.value)}
            style={input}
          />
        </Field>

        <Field label="Difficulty">
          <select
            value={form.difficulty}
            onChange={(e) => handleChange('difficulty', e.target.value)}
            style={input}
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </Field>

        <Field label="Language">
          <select
            value={form.language}
            onChange={(e) => handleChange('language', e.target.value)}
            style={input}
          >
            <option value="english">English</option>
            <option value="hindi">Hindi</option>
            <option value="bilingual">Bilingual</option>
          </select>
        </Field>

        <Field label="Marks">
          <input
            type="number"
            value={form.marks}
            onChange={(e) => handleChange('marks', e.target.value)}
            style={input}
          />
        </Field>

        <button type="submit" style={button}>
          Update Question
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '15px' }}>
      <label style={{ fontWeight: 'bold' }}>{label}</label>
      {children}
    </div>
  );
}

const input = {
  width: '100%',
  padding: '8px',
  marginTop: '5px',
};

const button = {
  padding: '10px 16px',
  background: 'black',
  color: 'white',
  border: 'none',
};
