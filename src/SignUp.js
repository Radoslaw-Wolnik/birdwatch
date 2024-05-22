import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './SignUp.css';
import { supabase } from './supabaseClient'; // Import the Supabase client instance

const SignUp = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    birthday: '',
    country: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null); // Add a state for error handling

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    console.log(formData.birthday)
    e.preventDefault();

    // Perform client-side validation if needed

    try {
      const { user, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            user_name: formData.username,
            first_name: formData.first_name,
            last_name: formData.last_name,
            country: formData.country,
            birthday: formData.birthday
          },
        },
      });

      if (error) {
        // Handle sign-up error
        setError(error.message);
      } else {
        // Handle successful sign-up, e.g., show a success message or redirect
        console.log('Sign-up successful:', user);
      }
    } catch (err) {
      // Handle any other errors
      setError(err.message);
    }
  };

  return (
    <div className="signup">
      <main>
        <section>
          <h2>Sign Up</h2>
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleSubmit}>

            <label htmlFor="first_name">Fisrt Name:</label>
            <input type="text" id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} required />

            <label htmlFor="username">Last Name:</label>
            <input type="text" id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} required />

            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />

            <label htmlFor="username">Username:</label>
            <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} required />
            
            <label htmlFor="password">Password:</label>
            <input type={showPassword ? 'text' : 'password'} id="password" name="password" value={formData.password} onChange={handleChange} required />
            <div className="password-wrapper">
              <label htmlFor="showPassword">Show Password</label>
              <input type="checkbox" id="showPassword" checked={formData.showPassword} onChange={toggleShowPassword} />
            </div>
            
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
            

            <label htmlFor="birthday">Birthday:</label>
            <input type="date" id="birthday" name="birthday" value={formData.birthday} onChange={handleChange} required />
            
            <label htmlFor="country">Country:</label>
            <select id="country" name="country" value={formData.country} onChange={handleChange} required>
              <option value="">Select Country</option>
              <option value="USA">United States</option>
              <option value="UK">United Kingdom</option>
              {/* Add more countries as needed */}
            </select>
            
            <button type="submit">Sign In</button>
          </form>
          <p>
            Already have an account? <Link to="/login">Log In</Link>
          </p>
        </section>
      </main>
    </div>
  );
};

export default SignUp;