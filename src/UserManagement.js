import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const UserManagement = () => {
  //const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    birthday: '',
    country: '',
  });
  const [admins, setAdmins] = useState([]);
  const [moderators, setModerators] = useState([]);
  const [developers, setDevelopers] = useState([]);


  useEffect(() => {
    fetchUsers();
    fetchAdmins();
    fetchModerators();
    fetchDevelopers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      if (error) {
        throw error;
      } 
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error.message);
    }
  };

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase.from('Admin').select('user_id');
      if (error) {
        throw error;
      }
      setAdmins(data.map((admin) => admin.user_id));
    } catch (error) {
      console.error('Error fetching admins:', error.message);
    }
  };

  const fetchModerators = async () => {
    try {
      const { data, error } = await supabase.from('Moderators').select('user_id');
      if (error) {
        throw error;
      }
      setModerators(data.map((moderator) => moderator.user_id));
    } catch (error) {
      console.error('Error fetching moderators:', error.message);
    }
  };

  const fetchDevelopers = async () => {
    try {
      const { data, error } = await supabase.from('devs').select('user_id');
      if (error) {
        throw error;
      }
      setDevelopers(data.map((developer) => developer.user_id));
    } catch (error) {
      console.error('Error fetching developers:', error.message);
    }
  };

  const handleInputChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
        const { error } = await supabase.auth.signUp({
          email: newUser.email,
          password: newUser.password,
          options: {
            data: {
              user_name: newUser.username,
              first_name: newUser.first_name,
              last_name: newUser.last_name,
              country: newUser.country,
              birthday: newUser.birthday
            },
          },
        });
      if (error) {
        throw error;
      }
      setNewUser({
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        birthday: '',
        country: '',
      });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error.message);
    }
  };

  const handleUpdateUser = async (userId) => {
    try {
      const nonEmptyFields = Object.fromEntries(
        Object.entries(newUser).filter(([key, value]) => value.trim() !== '')
      );

      const { error } = await supabase
        .from('profiles')
        .update(nonEmptyFields)
        .eq('id', userId);
      if (error) {
        throw error;
      } else {
        setNewUser({
          username: '',
          first_name: '',
          last_name: '',
          email: '',
          password: '',
          birthday: '',
          country: '',
        });
      }
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) {
        throw error;
      }
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error.message);
    }
  };

  return (
    <div>
      <h2>User Management</h2>
      <form onSubmit={handleCreateUser}>
        <h3>Create User</h3>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={newUser.username}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="first_name"
          placeholder="First name"
          value={newUser.first_name}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="last_name"
          placeholder="Last name"
          value={newUser.last_name}
          onChange={handleInputChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={newUser.email}
          onChange={handleInputChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={newUser.password}
          onChange={handleInputChange}
        />
        <input
          type="date"
          name="birthday"
          placeholder="Birthdate"
          value={newUser.birthday}
          onChange={handleInputChange}
        />
        <select id="country" name="country" value={newUser.country} onChange={handleInputChange} required>
          <option value="">Select Country</option>
          <option value="USA">United States</option>
          <option value="UK">United Kingdom</option>
          {/* Add more countries as needed */}
        </select>
        <button type="submit">Create User</button>
      </form>
      <h3>Users</h3>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Birthdate</th>
            <th>Country</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Moderator</th>
            <th>Developer</th>
            <th>Admin</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.birthday}</td>
              <td>{user.country}</td>
              <td>{user.first_name}</td>
              <td>{user.last_name}</td>
              <td>
                <input type="checkbox" checked={admins.includes(user.id)} readOnly />
              </td>
              <td>
                <input type="checkbox" checked={moderators.includes(user.id)} readOnly />
              </td>
              <td>
                <input type="checkbox" checked={developers.includes(user.id)} readOnly />
              </td>
              <td>
                <button onClick={() => handleUpdateUser(user.id)}>
                  Update
                </button>
                <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;