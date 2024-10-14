import React, { useState } from 'react';
import LayoutLogin from "./../../components/Layout/LayoutLogin";
import axios from "axios";
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from "react-hot-toast";
import { useAuth } from '../../context/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import "./Login.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [auth, setAuth] = useAuth();
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Form submission function
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(
                `${process.env.REACT_APP_API}/api/users/login`, {
                email,
                password,
            });
            if (res && res.data.success) {
                toast.success(res.data.message);
                setAuth({
                    ...auth,
                    user: res.data.user,
                    token: res.data.token,
                });
                localStorage.setItem("auth", JSON.stringify(res.data));
                navigate(location.state || '/');
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error('Something went wrong');
        }
    };

    return (
        <div className='login-body'>
            <LayoutLogin title="Sign in">
                <div className='login-container'>
                    <h2 className='login-heading'>Sign In</h2>
                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="login-field mb-3">
                            <label htmlFor="login-email" className="login-label">Email address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="login-input form-control"
                                id="login-email"
                                placeholder='Enter your username'
                                required
                            />
                        </div>
                        <div className="login-field mb-3">
                            <label htmlFor="login-password" className="login-label">Password</label>
                            <div className="login-password-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="login-input form-control"
                                    id="login-password"
                                    placeholder='Enter your password'
                                    required
                                />
                                {password && (
                                    <span onClick={togglePasswordVisibility} className="login-password-toggle-icon">
                                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                    </span>
                                )}
                            </div>
                        </div>
                        <button type="submit" className="btn login-submit-btn">
                            Sign In
                        </button>
                        <div className="login-forgot-password-container">
                            <Link to="/forgot-password" className="login-forgot-password-link">
                                Forgotten password?
                            </Link>
                        </div>
                        <div className="login-register-container">
                            <span>Don't have an account yet? </span>
                            <Link to="/register" className="login-register-link">
                                Register with Competition
                            </Link>
                        </div>
                    </form>
                </div>
            </LayoutLogin>
        </div>
    );
};

export default Login;
