import React, { useState } from 'react';
import LayoutLogin from "./../../components/Layout/LayoutLogin";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import "./Register.css";

const Register = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [street, setStreet] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [city, setCity] = useState("");
    const [country, setCountry] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Toggle confirm password visibility
    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    // Form submission function
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (password !== confirmPassword) {
                toast.error("Passwords do not match");
                return;
            }

            const res = await axios.post(
                `${process.env.REACT_APP_API}/api/users/register`, {
                    firstName,
                    lastName,
                    email,
                    password,
                    confirmPassword,
                    phone,
                    street,
                    postalCode,
                    city,
                    country
                }
            );

            if (res && res.data.success) {
                toast.success(res.data.message);
                navigate('/login');
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error('Something went wrong');
        }
    };

    return (
        <div className='regbody'>
            <LayoutLogin title="Register">
                <div className='register'>
                    <form onSubmit={handleSubmit}>
                        <h1 className='reg-title'>Join us now</h1>
                        <div className="regdiv mb-3">
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="reginput form-control"
                                id="firstName"
                                placeholder='Firstname'
                                required
                            />
                        </div>
                        <div className="regdiv2 mb-3">
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="reginput form-control"
                                id="lastName"
                                placeholder='Lastname'
                                required
                            />
                        </div>
                        <div className="regdiv3 mb-3">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="reginput form-control"
                                id="email"
                                placeholder='Email address'
                                required
                            />
                        </div>
                        <div className="regdiv4 mb-3">
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="reginput form-control"
                                    id="password"
                                    placeholder='Password'
                                    required
                                />
                                {password && (
                                    <span onClick={togglePasswordVisibility} className="password-toggle-icon">
                                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="regdiv5 mb-3">
                            <div className="password-wrapper">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="reginput form-control"
                                    id="confirmPassword"
                                    placeholder='Confirm Password'
                                    required
                                />
                                {confirmPassword && (
                                    <span onClick={toggleConfirmPasswordVisibility} className="password-toggle-icon">
                                        <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="regdiv6 mb-3">
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="reginput form-control"
                                id="phone"
                                placeholder='Phone number'
                                required
                            />
                        </div>
                        <div className="regdiv7 mb-3">
                            <input
                                type="text"
                                value={street}
                                onChange={(e) => setStreet(e.target.value)}
                                className="reginput form-control"
                                id="street"
                                placeholder='Street and Number'
                                required
                            />
                        </div>
                        <div className="regdiv8 mb-3">
                            <input
                                type="text"
                                value={postalCode}
                                onChange={(e) => setPostalCode(e.target.value)}
                                className="reginput form-control"
                                id="postalCode"
                                placeholder='Postal Code'
                                required
                            />
                        </div>
                        <div className="regdiv9 mb-3">
                            <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="reginput form-control"
                                id="city"
                                placeholder='City'
                                required
                            />
                        </div>
                        <div className="regdiv10 mb-3">
                            <input
                                type="text"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="reginput form-control"
                                id="country"
                                placeholder='Country'
                                required
                            />
                        </div>
                        <button type="submit" className="regbtn btn">
                            Let's go
                        </button>
                        <div className='logindiv'>
                            <Link to="/login" className='login-link'>
                                Already have an account? Login here
                            </Link>
                        </div>
                    </form>
                </div>
            </LayoutLogin>
        </div>
    );
};

export default Register;
