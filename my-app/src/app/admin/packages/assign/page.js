'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AssignPackagePage() {
  const [users, setUsers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [validityDays, setValidityDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const usersSnap = await getDocs(collection(db, 'users'));
    const packagesSnap = await getDocs(collection(db, 'packages'));

    setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setPackages(
      packagesSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(p => p.active === true)
    );

    setLoading(false);
  };

  const assignPackage = async () => {
    if (!selectedUser || !selectedPackage) {
      alert('Select both user and package');
      return;
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + Number(validityDays));

    await addDoc(collection(db, 'userPackages'), {
      userId: selectedUser,
      packageId: selectedPackage,
      active: true,
      assignedByAdmin: true,
      purchaseDate: serverTimestamp(),
      expiryDate,
    });

    alert('Package assigned successfully');
    setSelectedUser('');
    setSelectedPackage('');
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: '500px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>
        Assign Package to User
      </h1>

      <div style={field}>
        <label>User</label>
        <select
          value={selectedUser}
          onChange={e => setSelectedUser(e.target.value)}
          style={input}
        >
          <option value="">Select User</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>
              {u.name || u.email || u.id}
            </option>
          ))}
        </select>
      </div>

      <div style={field}>
        <label>Package</label>
        <select
          value={selectedPackage}
          onChange={e => setSelectedPackage(e.target.value)}
          style={input}
        >
          <option value="">Select Package</option>
          {packages.map(p => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </div>

      <div style={field}>
        <label>Validity (days)</label>
        <input
          type="number"
          value={validityDays}
          onChange={e => setValidityDays(e.target.value)}
          style={input}
        />
      </div>

      <button onClick={assignPackage} style={button}>
        Assign Package
      </button>
    </div>
  );
}

/* -------- STYLES -------- */

const field = { marginBottom: '15px' };
const input = { width: '100%', padding: '8px', marginTop: '5px' };
const button = {
  padding: '10px 15px',
  background: 'black',
  color: 'white',
  border: 'none',
  cursor: 'pointer',
};
