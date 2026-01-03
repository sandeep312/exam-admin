'use client';

import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function CreateExamPage() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    examType: '',
    totalDurationMinutes: '',
    totalMarks: '',
    totalQuestions: '',
    marksForEachQuestion: '',
    negativeMarking: 0,
    sectionWiseTimer: true,
    shuffleQuestions: true,
    shuffleOptions: true,
  });

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, 'examBlueprints'), {
        name: form.name,
        description: form.description,
        examType: form.examType,
        totalDurationMinutes: Number(form.totalDurationMinutes),
        totalMarks: Number(form.totalMarks),
        totalQuestions: Number(form.totalQuestions),
        marksForEachQuestion: Number(form.marksForEachQuestion),
        negativeMarking: Number(form.negativeMarking),
        sectionWiseTimer: form.sectionWiseTimer,
        shuffleQuestions: form.shuffleQuestions,
        shuffleOptions: form.shuffleOptions,
        active: true,
        createdBy: 'admin',
        createdAt: serverTimestamp(),
      });

      alert('Exam Blueprint created successfully');
      setForm({
        name: '',
        description: '',
        examType: '',
        totalDurationMinutes: '',
        totalMarks: '',
        totalQuestions: '',
        marksForEachQuestion: '',
        negativeMarking: 0,
        sectionWiseTimer: true,
        shuffleQuestions: true,
        shuffleOptions: true,
      });
    } catch (error) {
      console.error('Error creating exam blueprint:', error);
      alert('Error creating exam blueprint');
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>
        Create Exam Blueprint
      </h1>

      <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
        <Field label="Blueprint Name">
          <input value={form.name} onChange={(e) => handleChange('name', e.target.value)} style={input} required />
        </Field>

        <Field label="Description">
          <textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} style={input} />
        </Field>

        <Field label="Exam Type">
          <input value={form.examType} onChange={(e) => handleChange('examType', e.target.value)} style={input} />
        </Field>

        <Field label="Total Duration (minutes)">
          <input type="number" value={form.totalDurationMinutes} onChange={(e) => handleChange('totalDurationMinutes', e.target.value)} style={input} />
        </Field>

        <Field label="Total Marks">
          <input type="number" value={form.totalMarks} onChange={(e) => handleChange('totalMarks', e.target.value)} style={input} />
        </Field>

         <Field label="Total Questions">
          <input type="number" value={form.totalQuestions} onChange={(e) => handleChange('totalQuestions', e.target.value)} style={input} />
        </Field>

        <Field label="Marks For Each Question">
          <input type="number" value={form.marksForEachQuestion} onChange={(e) => handleChange('marksForEachQuestion', e.target.value)} style={input} />
        </Field>

        <Field label="Negative Marking">
          <input type="number" step="0.25" value={form.negativeMarking} onChange={(e) => handleChange('negativeMarking', e.target.value)} style={input} />
        </Field>

<Field label="instructions">
          <input type="text" value={form.instructions} onChange={(e) => handleChange('instructions', e.target.value)} style={input} />
        </Field>

        <label>
          <input type="checkbox" checked={form.sectionWiseTimer} onChange={(e) => handleChange('sectionWiseTimer', e.target.checked)} /> Section-wise Timer
        </label>
        <br />

        <label>
          <input type="checkbox" checked={form.shuffleQuestions} onChange={(e) => handleChange('shuffleQuestions', e.target.checked)} /> Shuffle Questions
        </label>
        <br />

        <label>
          <input type="checkbox" checked={form.shuffleOptions} onChange={(e) => handleChange('shuffleOptions', e.target.checked)} /> Shuffle Options
        </label>
        <br /><br />

        <button type="submit" style={button}>Save Blueprint</button>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '15px' }}>
      <label>{label}</label>
      {children}
    </div>
  );
}

const input = { width: '100%', padding: '8px', marginTop: '5px' };
const button = { padding: '10px', background: 'black', color: 'white', border: 'none' };
