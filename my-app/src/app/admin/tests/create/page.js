'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function CreateTestPage() {
  const router = useRouter();

  const [blueprints, setBlueprints] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: '',
    blueprintId: '',
    availableFrom: '',
    availableTill: '',
    maxAttempts: 1,
  });

  useEffect(() => {
    loadBlueprints();
  }, []);

  const loadBlueprints = async () => {
    const q = query(
      collection(db, 'examBlueprints'),
      where('active', '==', true)
    );

    const snapshot = await getDocs(q);
    setBlueprints(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.blueprintId) {
      alert('Please fill all required fields');
      return;
    }

    try {
      await addDoc(collection(db, 'testPapers'), {
        title: form.title,
        blueprintId: form.blueprintId,
        availableFrom: form.availableFrom
          ? new Date(form.availableFrom)
          : null,
        availableTill: form.availableTill
          ? new Date(form.availableTill)
          : null,
        maxAttempts: Number(form.maxAttempts),
        status: 'draft',
        createdBy: 'admin',
        createdAt: serverTimestamp(),
      });

      alert('Test created successfully');
      router.push('/admin/tests');
    } catch (error) {
      console.error(error);
      alert('Error creating test');
    }
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>
        Create Test
      </h1>

      {loading ? (
        <p>Loading blueprints...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <Field label="Test Title *">
            <input
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              style={input}
              required
            />
          </Field>

          <Field label="Select Blueprint *">
            <select
              value={form.blueprintId}
              onChange={(e) => handleChange('blueprintId', e.target.value)}
              style={input}
              required
            >
              <option value="">Select Blueprint</option>
              {blueprints.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.examType})
                </option>
              ))}
            </select>
          </Field>

          <Field label="Available From">
            <input
              type="datetime-local"
              value={form.availableFrom}
              onChange={(e) =>
                handleChange('availableFrom', e.target.value)
              }
              style={input}
            />
          </Field>

          <Field label="Available Till">
            <input
              type="datetime-local"
              value={form.availableTill}
              onChange={(e) =>
                handleChange('availableTill', e.target.value)
              }
              style={input}
            />
          </Field>

          <Field label="Max Attempts">
            <input
              type="number"
              min="1"
              value={form.maxAttempts}
              onChange={(e) =>
                handleChange('maxAttempts', e.target.value)
              }
              style={input}
            />
          </Field>

          <button type="submit" style={button}>
            Save Test
          </button>
        </form>
      )}
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
