'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Truck, User, Mail, Lock, Phone, MapPin, Car, Shield, Clock, UserCheck } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'customer' as 'admin' | 'customer' | 'driver',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    },
    // Driver-specific fields
    licenseNumber: '',
    vehicleInfo: {
      make: '',
      model: '',
      year: new Date().getFullYear(),
      licensePlate: ''
    },
    emergencyContact: {
      name: '',
      phone: ''
    },
    yearsOfExperience: 0,
    backgroundCheckConsent: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else if (name.startsWith('vehicleInfo.')) {
      const vehicleField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        vehicleInfo: {
          ...prev.vehicleInfo,
          [vehicleField]: vehicleField === 'year' ? parseInt(value) : value
        }
      }));
    } else if (name.startsWith('emergencyContact.')) {
      const contactField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [contactField]: value
        }
      }));
    } else {
      const inputElement = e.target as HTMLInputElement;
      const processedValue = type === 'checkbox' ? inputElement.checked 
                           : type === 'number' ? parseInt(value) || 0
                           : name === 'role' ? value as 'admin' | 'customer' | 'driver' 
                           : value;
      
      setFormData(prev => ({
        ...prev,
        [name]: processedValue
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Common validations
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.street.trim()) newErrors['address.street'] = 'Street address is required';
    if (!formData.address.city.trim()) newErrors['address.city'] = 'City is required';
    if (!formData.address.state.trim()) newErrors['address.state'] = 'State is required';
    if (!formData.address.zipCode.trim()) newErrors['address.zipCode'] = 'ZIP code is required';

    // Driver-specific validations
    if (formData.role === 'driver') {
      if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'Driver license number is required';
      if (!formData.vehicleInfo.make.trim()) newErrors['vehicleInfo.make'] = 'Vehicle make is required';
      if (!formData.vehicleInfo.model.trim()) newErrors['vehicleInfo.model'] = 'Vehicle model is required';
      if (!formData.vehicleInfo.licensePlate.trim()) newErrors['vehicleInfo.licensePlate'] = 'License plate is required';
      if (!formData.emergencyContact.name.trim()) newErrors['emergencyContact.name'] = 'Emergency contact name is required';
      if (!formData.emergencyContact.phone.trim()) newErrors['emergencyContact.phone'] = 'Emergency contact phone is required';
      if (formData.yearsOfExperience < 1) newErrors.yearsOfExperience = 'At least 1 year of experience required';
      if (!formData.backgroundCheckConsent) newErrors.backgroundCheckConsent = 'Background check consent is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await register(formData);
      router.push('/dashboard');
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  const isDriver = formData.role === 'driver';

  return (
    <main role="main" className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <header className="text-center">
          <div className="flex justify-center">
            <div className="flex items-center space-x-2">
              <Truck className="h-12 w-12 text-blue-600" aria-hidden="true" />
              <span className="text-3xl font-bold text-gray-900">LogiTrack</span>
            </div>
          </div>
          <h1 className="mt-6 text-3xl font-extrabold text-gray-900">Create your account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline">
              sign in to your existing account
            </Link>
          </p>
        </header>

        <section aria-labelledby="registration-form-heading">
          <h2 id="registration-form-heading" className="sr-only">Registration Form</h2>
          
          <form 
            className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-lg" 
            onSubmit={handleSubmit}
            role="form"
            aria-describedby="form-description"
          >
            <p id="form-description" className="sr-only">
              {isDriver ? 'Complete the form below to register as a driver. All fields marked with * are required.' : 'Complete the form below to create your customer account.'}
            </p>

            {errors.general && (
              <div 
                role="alert" 
                className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm"
                aria-live="polite"
              >
                {errors.general}
              </div>
            )}

            {/* Personal Information Section */}
            <fieldset className="space-y-4">
              <legend className="text-lg font-medium text-gray-900 mb-4">Personal Information</legend>
              
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    aria-invalid={errors.name ? 'true' : 'false'}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                    className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Full Name"
                  />
                </div>
                {errors.name && (
                  <p id="name-error" role="alert" className="mt-1 text-sm text-red-600">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    aria-invalid={errors.email ? 'true' : 'false'}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Email address"
                  />
                </div>
                {errors.email && (
                  <p id="email-error" role="alert" className="mt-1 text-sm text-red-600">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    aria-invalid={errors.phone ? 'true' : 'false'}
                    aria-describedby={errors.phone ? 'phone-error' : undefined}
                    className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Phone number"
                  />
                </div>
                {errors.phone && (
                  <p id="phone-error" role="alert" className="mt-1 text-sm text-red-600">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Role */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  I want to register as *
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="customer">Customer - Request deliveries</option>
                  <option value="driver">Driver - Deliver packages</option>
                </select>
              </div>
            </fieldset>

            {/* Driver-Specific Information */}
            {isDriver && (
              <>
                {/* License Information */}
                <fieldset className="space-y-4 pt-6 border-t border-gray-200">
                  <legend className="text-lg font-medium text-gray-900 mb-4">Driver Information</legend>
                  
                  <div>
                    <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                      Driver License Number *
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Shield className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                      <input
                        id="licenseNumber"
                        name="licenseNumber"
                        type="text"
                        value={formData.licenseNumber}
                        onChange={handleInputChange}
                        required={isDriver}
                        aria-invalid={errors.licenseNumber ? 'true' : 'false'}
                        aria-describedby={errors.licenseNumber ? 'license-error' : undefined}
                        className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Driver License Number"
                      />
                    </div>
                    {errors.licenseNumber && (
                      <p id="license-error" role="alert" className="mt-1 text-sm text-red-600">
                        {errors.licenseNumber}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700">
                      Years of Driving Experience *
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Clock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                      <input
                        id="yearsOfExperience"
                        name="yearsOfExperience"
                        type="number"
                        min="1"
                        max="50"
                        value={formData.yearsOfExperience}
                        onChange={handleInputChange}
                        required={isDriver}
                        aria-invalid={errors.yearsOfExperience ? 'true' : 'false'}
                        aria-describedby={errors.yearsOfExperience ? 'experience-error' : undefined}
                        className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Years of experience"
                      />
                    </div>
                    {errors.yearsOfExperience && (
                      <p id="experience-error" role="alert" className="mt-1 text-sm text-red-600">
                        {errors.yearsOfExperience}
                      </p>
                    )}
                  </div>
                </fieldset>

                {/* Background Check Consent */}
                <fieldset>
                  <legend className="sr-only">Background Check Consent</legend>
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="backgroundCheckConsent"
                        name="backgroundCheckConsent"
                        type="checkbox"
                        checked={formData.backgroundCheckConsent}
                        onChange={handleInputChange}
                        required={isDriver}
                        aria-invalid={errors.backgroundCheckConsent ? 'true' : 'false'}
                        aria-describedby={errors.backgroundCheckConsent ? 'consent-error' : 'consent-description'}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="backgroundCheckConsent" className="font-medium text-gray-700">
                        Background Check Consent *
                      </label>
                      <p id="consent-description" className="text-gray-500">
                        I consent to a background check as required for driver verification.
                      </p>
                      {errors.backgroundCheckConsent && (
                        <p id="consent-error" role="alert" className="text-red-600">
                          {errors.backgroundCheckConsent}
                        </p>
                      )}
                    </div>
                  </div>
                </fieldset>
              </>
            )}

            {/* Address Section */}
            <fieldset className="space-y-3 pt-6 border-t border-gray-200">
              <legend className="block text-sm font-medium text-gray-700">
                <MapPin className="inline h-4 w-4 mr-1" aria-hidden="true" />
                Address Information *
              </legend>
              
              <div>
                <label htmlFor="street" className="sr-only">Street Address</label>
                <input
                  id="street"
                  name="address.street"
                  type="text"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  required
                  aria-invalid={errors['address.street'] ? 'true' : 'false'}
                  aria-describedby={errors['address.street'] ? 'street-error' : undefined}
                  placeholder="Street Address"
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {errors['address.street'] && (
                  <p id="street-error" role="alert" className="text-sm text-red-600">
                    {errors['address.street']}
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="city" className="sr-only">City</label>
                  <input
                    id="city"
                    name="address.city"
                    type="text"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    required
                    aria-invalid={errors['address.city'] ? 'true' : 'false'}
                    aria-describedby={errors['address.city'] ? 'city-error' : undefined}
                    placeholder="City"
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  {errors['address.city'] && (
                    <p id="city-error" role="alert" className="text-sm text-red-600">
                      {errors['address.city']}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="state" className="sr-only">State</label>
                  <input
                    id="state"
                    name="address.state"
                    type="text"
                    value={formData.address.state}
                    onChange={handleInputChange}
                    required
                    aria-invalid={errors['address.state'] ? 'true' : 'false'}
                    aria-describedby={errors['address.state'] ? 'state-error' : undefined}
                    placeholder="State"
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  {errors['address.state'] && (
                    <p id="state-error" role="alert" className="text-sm text-red-600">
                      {errors['address.state']}
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="zipCode" className="sr-only">ZIP Code</label>
                <input
                  id="zipCode"
                  name="address.zipCode"
                  type="text"
                  value={formData.address.zipCode}
                  onChange={handleInputChange}
                  required
                  aria-invalid={errors['address.zipCode'] ? 'true' : 'false'}
                  aria-describedby={errors['address.zipCode'] ? 'zipcode-error' : undefined}
                  placeholder="ZIP Code"
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {errors['address.zipCode'] && (
                  <p id="zipcode-error" role="alert" className="text-sm text-red-600">
                    {errors['address.zipCode']}
                  </p>
                )}
              </div>
            </fieldset>

            {/* Password Section */}
            <fieldset className="space-y-4 pt-6 border-t border-gray-200">
              <legend className="text-lg font-medium text-gray-900 mb-4">Security</legend>
              
              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    aria-invalid={errors.password ? 'true' : 'false'}
                    aria-describedby={errors.password ? 'password-error' : 'password-help'}
                    className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Password"
                  />
                </div>
                <p id="password-help" className="mt-1 text-xs text-gray-500">
                  Must be at least 8 characters with uppercase, lowercase, and number
                </p>
                {errors.password && (
                  <p id="password-error" role="alert" className="mt-1 text-sm text-red-600">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password *
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                    aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                    className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Confirm Password"
                  />
                </div>
                {errors.confirmPassword && (
                  <p id="confirm-password-error" role="alert" className="mt-1 text-sm text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </fieldset>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" role="status" aria-label="Creating account"></div>
                ) : (
                  `Create ${isDriver ? 'Driver' : 'Customer'} Account`
                )}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}