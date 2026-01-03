'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function SectionsPage() {
  const searchParams = useSearchParams();
  const blueprintId = searchParams.get('blueprintId');

  const [sections, setSections] = useState([]);

  const addSection = () => {
    setSections([
      ...sections,
      {
        sectionName: '',
        sectionCode: '',
        durationMinutes: '',
        marksPerQuestion: '',
        negativeMarks: '',
        totalQuestions: '',
      },
    ]);
  };

  const updateSection = (index, field, value) => {
    const updated = [...sections];
    updated[index][field] = value;
    setSections(updated);
  };

  const saveSections = async () => {
    if (!blueprintId) {
      alert('Blueprint ID missing');
      return;
    }

    try {
      for (let i = 0; i < sections.length; i++) {
        const s = sections[i];

        await addDoc(collection(db, 'examSections'), {
          blueprintId,
          sectionName: s.sectionName,
          sectionCode: s.sectionCode,
          durationMinutes: Number(s.durationMinutes),
          marksPerQuestion: Number(s.marksPerQuestion),
          negativeMarks: Number(s.negativeMarks),
          totalQuestions: Number(s.totalQuestions),
          order: i + 1,
          active: true,
          createdAt: serverTimestamp(),
        });
      }

      alert('Sections saved successfully');
      setSections([]);
    } catch (error) {
      console.error('Error saving sections:', error);
      alert('Error saving sections');
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>
        Exam Sections
      </h1>

      {sections.map((section, index) => (
        <div
          key={index}
          style={{
            border: '1px solid #ddd',
            padding: '15px',
            marginBottom: '15px',
          }}
        >
          <h3>Section {index + 1}</h3>

          <input
            placeholder="Section Name"
            value={section.sectionName}
            onChange={(e) => updateSection(index, 'sectionName', e.target.value)}
            style={input}
          />

          <input
            placeholder="Section Code (e.g. QUANT)"
            value={section.sectionCode}
            onChange={(e) => updateSection(index, 'sectionCode', e.target.value)}
            style={input}
          />

          <input
            placeholder="Duration (minutes)"
            type="number"
            value={section.durationMinutes}
            onChange={(e) => updateSection(index, 'durationMinutes', e.target.value)}
            style={input}
          />

          <input
            placeholder="Marks per Question"
            type="number"
            value={section.marksPerQuestion}
            onChange={(e) => updateSection(index, 'marksPerQuestion', e.target.value)}
            style={input}
          />

          <input
            placeholder="Negative Marks"
            type="number"
            value={section.negativeMarks}
            onChange={(e) => updateSection(index, 'negativeMarks', e.target.value)}
            style={input}
          />

          <input
            placeholder="Total Questions"
            type="number"
            value={section.totalQuestions}
            onChange={(e) => updateSection(index, 'totalQuestions', e.target.value)}
            style={input}
          />
        </div>
      ))}

      <button onClick={addSection} style={button}>
        + Add Section
      </button>

      {sections.length > 0 && (
        <button onClick={saveSections} style={{ ...button, marginLeft: '10px' }}>
          Save Sections
        </button>
      )}
    </div>
  );
}

const input = {
  display: 'block',
  width: '100%',
  padding: '8px',
  marginTop: '8px',
};

const button = {
  padding: '10px',
  background: 'black',
  color: 'white',
  border: 'none',
  marginTop: '15px',
};
