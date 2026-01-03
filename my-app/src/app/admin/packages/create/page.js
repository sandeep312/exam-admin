'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function CreatePackagePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: '',
    description: '',
    examType: '',
    language: '',
    level: '',
    price: '',
    discountPrice: '',
    currency: 'INR',
    totalTests: '',
    validityDays: '',
    thumbnailUrl: '',
    featured: false,
    order: 1,
    active: true,
  });

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, 'packages'), {
        title: form.title,
        description: form.description,
        examType: form.examType,
        language: form.language,
        level: form.level,
        price: Number(form.price),
        discountPrice: form.discountPrice
          ? Number(form.discountPrice)
          : null,
        currency: form.currency,
        totalTests: Number(form.totalTests),
        validityDays: Number(form.validityDays),
        thumbnailUrl: form.thumbnailUrl,
        featured: form.featured,
        order: Number(form.order),
        active: form.active,
        createdBy: 'admin',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      alert('Package created successfully');
      router.push('/admin/packages');
    } catch (error) {
      console.error(error);
      alert('Error creating package');
    }
  };

  return (
    <div style={{ maxWidth: '700px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>
        Create Package
      </h1>

      <form onSubmit={handleSubmit}>
        <Field label="Title">
          <input
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            required
            style={input}
          />
        </Field>

        <Field label="Description">
          <textarea
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            style={input}
          />
        </Field>

        <Field label="Exam Type">
          <input
            value={form.examType}
            onChange={(e) => handleChange('examType', e.target.value)}
            placeholder="ssc / upsc / bank"
            style={input}
          />
        </Field>

        <Field label="Language">
          <input
            value={form.language}
            onChange={(e) => handleChange('language', e.target.value)}
            placeholder="english / hindi / both"
            style={input}
          />
        </Field>

        <Field label="Level">
          <input
            value={form.level}
            onChange={(e) => handleChange('level', e.target.value)}
            placeholder="Beginner / Advanced"
            style={input}
          />
        </Field>

        <Field label="Price">
          <input
            type="number"
            value={form.price}
            onChange={(e) => handleChange('price', e.target.value)}
            required
            style={input}
          />
        </Field>

        <Field label="Discount Price">
          <input
            type="number"
            value={form.discountPrice}
            onChange={(e) => handleChange('discountPrice', e.target.value)}
            style={input}
          />
        </Field>

        <Field label="Total Tests">
          <input
            type="number"
            value={form.totalTests}
            onChange={(e) => handleChange('totalTests', e.target.value)}
            style={input}
          />
        </Field>

        <Field label="Validity (Days)">
          <input
            type="number"
            value={form.validityDays}
            onChange={(e) => handleChange('validityDays', e.target.value)}
            style={input}
          />
        </Field>

        <Field label="Thumbnail URL">
          <input
            value={form.thumbnailUrl}
            onChange={(e) => handleChange('thumbnailUrl', e.target.value)}
            style={input}
          />
        </Field>

        <Field>
          <label>
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => handleChange('featured', e.target.checked)}
            />{' '}
            Featured Package
          </label>
        </Field>

        <Field label="Display Order">
          <input
            type="number"
            value={form.order}
            onChange={(e) => handleChange('order', e.target.value)}
            style={input}
          />
        </Field>

        <button type="submit" style={button}>
          Save Package
        </button>
      </form>
    </div>
  );
}

/* ---------------- COMPONENTS & STYLES ---------------- */

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '15px' }}>
      {label && <label>{label}</label>}
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
  padding: '10px 15px',
  background: 'black',
  color: 'white',
  border: 'none',
  cursor: 'pointer',
};
