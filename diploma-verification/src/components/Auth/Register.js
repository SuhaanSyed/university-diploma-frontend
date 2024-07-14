import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';

function Register() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');

    const handleRegister = async (e) => {
        e.preventDefault();
        const { user, error } = await supabase.auth.signUp({ email, password });
        if (user) {
            await supabase
                .from('profiles')
                .insert([{ id: user.id, email: user.email, role }]);
            navigate.push('/login');
        } else {
            alert(error.message);
        }
    };

    return (
        <div className="register-container">
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="student">Student</option>
                    <option value="college">College</option>
                    <option value="company">Company</option>
                </select>
                <button type="submit">Register</button>
            </form>
        </div>
    );
}

export default Register;
