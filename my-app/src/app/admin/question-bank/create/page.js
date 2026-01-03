'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function CreateQuestionPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctOptionIndex: 0,
    questionType: 'MCQ_SINGLE',
    subject: '',
    topic: '',
    difficulty: 'Easy',
    language: 'english',
  });

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

    // Basic validation
    if (
      !form.questionText ||
      form.options.some(opt => opt.trim() === '') ||
      form.subject.trim() === ''
    ) {
      alert('Please fill all required fields');
      return;
    }

    try {
      await addDoc(collection(db, 'questionBank'), {
        questionText: form.questionText,
        options: form.options,
        correctOptionIndex: Number(form.correctOptionIndex),
        questionType: form.questionType,
        subject: form.subject,
        topic: form.topic,
        difficulty: form.difficulty,
        language: form.language,
        active: true,
        createdBy: 'admin',
        createdAt: serverTimestamp(),
      });

      alert('Question added successfully');
      router.push('/admin/questions');
    } catch (error) {
      console.error('Error adding question:', error);
      alert('Error saving question');
    }
  };

  return (
    <div style={{ maxWidth: '700px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>
        Add Question
      </h1>

      <form onSubmit={handleSubmit}>
        <Field label="Question Text *">
          <textarea
            value={form.questionText}
            onChange={(e) => handleChange('questionText', e.target.value)}
            style={input}
            required
          />
        </Field>

        <Field label="Options *">
          {form.options.map((opt, idx) => (
            <input
              key={idx}
              placeholder={`Option ${idx + 1}`}
              value={opt}
              onChange={(e) => handleOptionChange(idx, e.target.value)}
              style={input}
              required
            />
          ))}
        </Field>

        <Field label="Correct Option">
          <select
            value={form.correctOptionIndex}
            onChange={(e) => handleChange('correctOptionIndex', e.target.value)}
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
            required
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

       

        <button type="submit" style={button}>
          Save Question
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
