'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Icon } from '@iconify-icon/react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { RegisterData } from '@/types';
import { PasswordStrengthInfo } from '@/lib/password-strength';

type UserRole = 'customer' | 'driver';

interface AddressData extends Record<string, unknown> {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface VehicleInfoData extends Record<string, unknown> {
  make: string;
  model: string;
  year: string;
  licensePlate: string;
}

interface EmergencyContactData extends Record<string, unknown> {
  name: string;
  phone: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  address: AddressData;
  // Driver-specific fields
  licenseNumber?: string;
  vehicleInfo?: VehicleInfoData;
  emergencyContact?: EmergencyContactData;
  yearsExperience?: string;
  backgroundCheckConsent?: boolean;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
    },
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrengthInfo | null>(null);

  const { register } = useAuth();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name.includes('.')) {
      const [parent, child, grandchild] = name.split('.');
      setFormData((prev) => {
        const currentParent = prev[parent as keyof FormData];

        if (typeof currentParent === 'object' && currentParent !== null) {
          const parentObj = currentParent as Record<string, unknown>;

          return {
            ...prev,
            [parent]: {
              ...parentObj,
              ...(grandchild
                ? {
                    [child]: {
                      ...(typeof parentObj[child] === 'object' && parentObj[child] !== null
                        ? (parentObj[child] as Record<string, unknown>)
                        : {}),
                      [grandchild]: value,
                    },
                  }
                : {
                    [child]: value,
                  }),
            },
          };
        }

        return prev;
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setFormData((prev) => ({
      ...prev,
      role,
      // Clear driver-specific fields when switching to customer
      ...(role === 'customer'
        ? {
            licenseNumber: undefined,
            vehicleInfo: undefined,
            emergencyContact: undefined,
            yearsExperience: undefined,
            backgroundCheckConsent: undefined,
          }
        : {
            licenseNumber: '',
            vehicleInfo: { make: '', model: '', year: '', licensePlate: '' },
            emergencyContact: { name: '', phone: '' },
            yearsExperience: '',
            backgroundCheckConsent: false,
          }),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate password strength before submission
    if (!passwordStrength || !passwordStrength.isValid) {
      setError('Password is too weak. Please choose a stronger password.');
      setLoading(false);
      return;
    }

    try {
      // Transform form data to match RegisterData interface
      const submitData: RegisterData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        address: {
          street: formData.address.street,
          city: formData.address.city,
          state: formData.address.state,
          zipCode: formData.address.zipCode,
          country: formData.address.country,
        },
        ...(formData.role === 'driver' && {
          licenseNumber: formData.licenseNumber,
          vehicleInfo: formData.vehicleInfo
            ? {
                make: formData.vehicleInfo.make,
                model: formData.vehicleInfo.model,
                year: formData.vehicleInfo.year
                  ? isNaN(parseInt(formData.vehicleInfo.year, 10))
                    ? undefined
                    : parseInt(formData.vehicleInfo.year, 10)
                  : undefined,
                licensePlate: formData.vehicleInfo.licensePlate,
              }
            : undefined,
          emergencyContact: formData.emergencyContact,
          yearsOfExperience: formData.yearsExperience
            ? parseInt(formData.yearsExperience, 10)
            : undefined,
          backgroundCheckConsent: formData.backgroundCheckConsent,
        }),
      };

      await register(submitData);
      router.push('/dashboard');
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      role="main"
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 text-center">
          <div className="flex justify-center">
            <div className="flex items-center space-x-2">
              <Icon
                icon="solar:delivery-outline"
                className="text-5xl text-blue-600"
                aria-hidden="true"
              />
              <span className="text-3xl font-bold text-gray-900">LogiTrack</span>
            </div>
          </div>
          <h1 className="mt-6 text-3xl font-extrabold text-gray-900">Create your account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500 focus:underline focus:outline-none"
            >
              sign in to your existing account
            </Link>
          </p>
        </header>

        <section aria-labelledby="registration-form-heading">
          <h2 id="registration-form-heading" className="sr-only">
            Registration Form
          </h2>

          <form
            className="space-y-6 rounded-lg bg-white p-8 shadow-lg"
            onSubmit={handleSubmit}
            role="form"
          >
            {error && (
              <div
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 p-4"
                aria-live="polite"
              >
                <div className="flex items-start">
                  <Icon
                    icon="solar:danger-triangle-outline"
                    className="mt-0.5 flex-shrink-0 text-xl text-red-400"
                    aria-hidden="true"
                  />
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Role Selection */}
            <fieldset>
              <legend className="mb-4 text-lg font-semibold text-gray-900">Account Type</legend>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {(['customer', 'driver'] as UserRole[]).map((role) => (
                  <label
                    key={role}
                    className={`relative flex cursor-pointer items-center rounded-lg border-2 p-4 transition-colors ${
                      formData.role === role
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    } `}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={formData.role === role}
                      onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-3">
                      <Icon
                        icon={role === 'customer' ? 'solar:user-outline' : 'solar:delivery-outline'}
                        className="text-2xl text-blue-600"
                      />
                      <div>
                        <div className="font-medium capitalize text-gray-900">{role}</div>
                        <div className="text-sm text-gray-600">
                          {role === 'customer'
                            ? 'Send and track deliveries'
                            : 'Deliver packages and earn money'}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Personal Information */}
            <fieldset>
              <legend className="mb-4 text-lg font-semibold text-gray-900">
                Personal Information
              </legend>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  name="name"
                  type="text"
                  required
                  label="Full Name"
                  placeholder="Enter your full name"
                  startElement={<Icon icon="solar:user-outline" className="text-xl" />}
                  value={formData.name}
                  onChange={handleInputChange}
                />

                <Input
                  name="email"
                  type="email"
                  required
                  label="Email Address"
                  placeholder="Enter your email"
                  startElement={<Icon icon="solar:letter-outline" className="text-xl" />}
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  name="phone"
                  type="tel"
                  required
                  label="Phone Number"
                  placeholder="Enter your phone number"
                  startElement={<Icon icon="solar:phone-outline" className="text-xl" />}
                  value={formData.phone}
                  onChange={handleInputChange}
                />

                <PasswordInput
                  name="password"
                  required
                  label="Password"
                  placeholder="Create a password"
                  showStrengthIndicator={true}
                  value={formData.password}
                  onChange={handleInputChange}
                  onStrengthChange={setPasswordStrength}
                />
              </div>
            </fieldset>

            {/* Address Information */}
            <fieldset>
              <legend className="mb-4 text-lg font-semibold text-gray-900">
                Address Information
              </legend>
              <div className="space-y-4">
                <Input
                  name="address.street"
                  type="text"
                  required
                  label="Street Address"
                  placeholder="Enter your street address"
                  startElement={<Icon icon="solar:map-point-outline" className="text-xl" />}
                  value={formData.address.street}
                  onChange={handleInputChange}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Input
                    name="address.city"
                    type="text"
                    required
                    label="City"
                    placeholder="City"
                    value={formData.address.city}
                    onChange={handleInputChange}
                  />

                  <Input
                    name="address.state"
                    type="text"
                    required
                    label="State"
                    placeholder="State"
                    value={formData.address.state}
                    onChange={handleInputChange}
                  />

                  <Input
                    name="address.zipCode"
                    type="text"
                    required
                    label="ZIP Code"
                    placeholder="ZIP Code"
                    value={formData.address.zipCode}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </fieldset>

            {/* Driver-specific fields */}
            {formData.role === 'driver' && (
              <>
                <fieldset>
                  <legend className="mb-4 text-lg font-semibold text-gray-900">
                    Driver Information
                  </legend>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Input
                      name="licenseNumber"
                      type="text"
                      required
                      label="Driver's License Number"
                      placeholder="Enter license number"
                      startElement={<Icon icon="solar:document-text-outline" className="text-xl" />}
                      value={formData.licenseNumber || ''}
                      onChange={handleInputChange}
                    />

                    <Input
                      name="yearsExperience"
                      type="number"
                      required
                      min="1"
                      label="Years of Driving Experience"
                      placeholder="Years"
                      value={formData.yearsExperience || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="mb-4 text-lg font-semibold text-gray-900">
                    Vehicle Information
                  </legend>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Input
                      name="vehicleInfo.make"
                      type="text"
                      required
                      label="Vehicle Make"
                      placeholder="e.g., Toyota"
                      startElement={<Icon icon="solar:tram-outline" className="text-xl" />}
                      value={formData.vehicleInfo?.make || ''}
                      onChange={handleInputChange}
                    />

                    <Input
                      name="vehicleInfo.model"
                      type="text"
                      required
                      label="Vehicle Model"
                      placeholder="e.g., Camry"
                      value={formData.vehicleInfo?.model || ''}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Input
                      name="vehicleInfo.year"
                      type="number"
                      required
                      min="1990"
                      max={new Date().getFullYear() + 1}
                      label="Vehicle Year"
                      placeholder="e.g., 2020"
                      value={formData.vehicleInfo?.year || ''}
                      onChange={handleInputChange}
                    />

                    <Input
                      name="vehicleInfo.licensePlate"
                      type="text"
                      required
                      label="License Plate"
                      placeholder="Enter plate number"
                      value={formData.vehicleInfo?.licensePlate || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="mb-4 text-lg font-semibold text-gray-900">
                    Emergency Contact
                  </legend>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Input
                      name="emergencyContact.name"
                      type="text"
                      required
                      label="Contact Name"
                      placeholder="Emergency contact name"
                      startElement={<Icon icon="solar:user-outline" className="text-xl" />}
                      value={formData.emergencyContact?.name || ''}
                      onChange={handleInputChange}
                    />

                    <Input
                      name="emergencyContact.phone"
                      type="tel"
                      required
                      label="Contact Phone"
                      placeholder="Emergency contact phone"
                      startElement={<Icon icon="solar:phone-outline" className="text-xl" />}
                      value={formData.emergencyContact?.phone || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="sr-only">Background Check Consent</legend>
                  <div className="flex items-start space-x-3">
                    <input
                      id="backgroundCheckConsent"
                      name="backgroundCheckConsent"
                      type="checkbox"
                      required
                      checked={formData.backgroundCheckConsent || false}
                      onChange={handleInputChange}
                      className="mt-1 rounded border-gray-300 text-base text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="backgroundCheckConsent" className="text-sm text-gray-700">
                      <Icon
                        icon="solar:shield-check-outline"
                        className="mr-1 align-middle text-[1.125em] text-blue-600"
                      />
                      I consent to a background verification check as required for driver accounts.
                      This helps ensure the safety and security of our delivery network.
                      <span className="ml-1 text-red-500" aria-label="required">
                        *
                      </span>
                    </label>
                  </div>
                </fieldset>
              </>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  `Create ${formData.role} account`
                )}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
