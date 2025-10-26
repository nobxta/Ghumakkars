import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import userService from '../services/userService';
import cloudStorageService from '../services/cloudStorageService';

const UserVerification = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    profilePicture: null,
    profilePictureUrl: user?.profilePicture || null,
    fullName: user?.name || '',
    mobileNumber: '',
    collegeName: '',
    customCollege: '',
    dateOfBirth: '',
    gender: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    relationshipToEmergency: '',
    customRelationship: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const colleges = [
    'GLA University, Mathura',
    'Sanskriti University, Mathura',
    'BSA College of Engineering & Technology, Mathura',
    'Hindustan College, Mathura',
    'Rajiv Academy for Technology & Management, Mathura',
    'Other (Custom Input)'
  ];

  const relationships = [
    'Father', 'Mother', 'Brother/Sister', 'Friend', 'Guardian', 'Other (Custom)'
  ];

  const steps = [
    {
      id: 1,
      title: 'Profile Picture',
      description: 'Upload a clear photo for verification',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      id: 2,
      title: 'Personal Details',
      description: 'Basic information about yourself',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 3,
      title: 'Contact & Education',
      description: 'Phone number and college information',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      id: 4,
      title: 'Emergency Contact',
      description: 'Someone we can contact in case of emergency',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 5,
      title: 'Review & Submit',
      description: 'Review your information and submit',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const validation = cloudStorageService.validateImage(file);
      if (!validation.valid) {
        setErrors(prev => ({ ...prev, profilePicture: validation.error }));
        return;
      }

      setIsUploading(true);
      try {
        const uploadResult = await cloudStorageService.uploadImage(file);
        if (uploadResult.success) {
          setFormData(prev => ({
            ...prev,
            profilePicture: file,
            profilePictureUrl: uploadResult.url
          }));
          setErrors(prev => ({ ...prev, profilePicture: '' }));
        } else {
          setErrors(prev => ({ ...prev, profilePicture: uploadResult.error || 'Upload failed' }));
        }
      } catch (error) {
        setErrors(prev => ({ ...prev, profilePicture: 'Upload failed' }));
      } finally {
        setIsUploading(false);
      }
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.profilePictureUrl) {
          newErrors.profilePicture = 'Profile picture is required';
        }
        break;
      
      case 2:
        if (!formData.fullName.trim()) {
          newErrors.fullName = 'Full name is required';
        }
        if (!formData.dateOfBirth) {
          newErrors.dateOfBirth = 'Date of birth is required';
        } else {
          const age = new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear();
          if (age < 17) {
            newErrors.dateOfBirth = 'You must be at least 17 years old';
          }
        }
        if (!formData.gender) {
          newErrors.gender = 'Gender is required';
        }
        break;
      
      case 3:
        if (!formData.mobileNumber.match(/^[6-9]\d{9}$/)) {
          newErrors.mobileNumber = 'Valid 10-digit mobile number is required';
        }
        if (!formData.collegeName.trim()) {
          newErrors.collegeName = 'College name is required';
        } else if (formData.collegeName === 'Other (Custom Input)' && !formData.customCollege.trim()) {
          newErrors.customCollege = 'Custom college name is required';
        }
        break;

      case 4:
        if (!formData.emergencyContactName.trim()) {
          newErrors.emergencyContactName = 'Emergency contact name is required';
        }
        if (!formData.emergencyContactPhone.match(/^[6-9]\d{9}$/)) {
          newErrors.emergencyContactPhone = 'Valid 10-digit emergency contact phone is required';
        }
        if (!formData.relationshipToEmergency.trim()) {
          newErrors.relationshipToEmergency = 'Relationship is required';
        } else if (formData.relationshipToEmergency === 'Other (Custom)' && !formData.customRelationship.trim()) {
          newErrors.customRelationship = 'Custom relationship is required';
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    try {
      const submissionData = {
        ...formData,
        profilePicture: undefined
      };
      
      const response = await userService.submitVerification(submissionData);
      console.log('Verification response:', response);
      
      // Refresh user data to get updated verification status
      const refreshResult = await refreshUser();
      console.log('Refresh result:', refreshResult);
      
      // Show success message with celebration
      alert('🎉 ' + response.message);
      
      // Redirect to profile or original destination
      const redirectUrl = searchParams.get('redirect') || '/profile';
      navigate(redirectUrl);
    } catch (error) {
      console.error('Verification submission error:', error);
      alert('❌ ' + (error.message || 'Failed to submit verification. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4" style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/50 p-8 w-full max-w-4xl animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white mb-4">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Profile Verification</h1>
          <p className="text-slate-600 text-lg">Complete your profile to unlock all features</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  currentStep >= step.id 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  {currentStep > step.id ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.icon
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className={`text-sm font-semibold ${currentStep >= step.id ? 'text-slate-800' : 'text-slate-500'}`}>
                    {step.title}
                  </p>
                  <p className={`text-xs ${currentStep >= step.id ? 'text-slate-600' : 'text-slate-400'}`}>
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`absolute top-6 left-1/2 w-full h-0.5 -z-10 ${
                    currentStep > step.id ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-slate-200'
                  }`} style={{ transform: 'translateX(50%)', width: 'calc(100% - 3rem)' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="space-y-8">
          {/* Step 1: Profile Picture */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center border-2 border-dashed border-slate-300 overflow-hidden">
                  {formData.profilePictureUrl ? (
                    <img
                      src={formData.profilePictureUrl}
                      alt="Profile preview"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <svg className="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                
                <div>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="profile-picture"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="profile-picture"
                    className={`inline-flex items-center px-6 py-3 rounded-xl transition-all duration-200 font-semibold cursor-pointer ${
                      isUploading 
                        ? 'bg-slate-400 text-white cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:scale-105'
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Choose Photo
                      </>
                    )}
                  </label>
                </div>
                
                {errors.profilePicture && (
                  <p className="text-red-600 text-sm mt-2">{errors.profilePicture}</p>
                )}
                
                <div className="mt-4 text-sm text-slate-600 space-y-1">
                  <p>• Clear face photo for ID verification & travel records</p>
                  <p>• Accept: JPG, PNG (Max 5MB)</p>
                  <p>• Good lighting, neutral background preferred</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Personal Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="As per your college ID card"
                  />
                  {errors.fullName && <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Date of Birth *</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.dateOfBirth && <p className="text-red-600 text-sm mt-1">{errors.dateOfBirth}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Gender *</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                      { value: 'other', label: 'Other' }
                    ].map((gender) => (
                      <label key={gender.value} className="flex items-center p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                        <input
                          type="radio"
                          name="gender"
                          value={gender.value}
                          checked={formData.gender === gender.value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                          formData.gender === gender.value 
                            ? 'border-blue-600 bg-blue-600' 
                            : 'border-slate-300'
                        }`}>
                          {formData.gender === gender.value && (
                            <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                          )}
                        </div>
                        <span className="font-medium text-slate-700">{gender.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.gender && <p className="text-red-600 text-sm mt-1">{errors.gender}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Contact & Education */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Mobile Number *</label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="10-digit active WhatsApp number"
                  />
                  {errors.mobileNumber && <p className="text-red-600 text-sm mt-1">{errors.mobileNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">College Name *</label>
                  <select
                    name="collegeName"
                    value={formData.collegeName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select your college</option>
                    {colleges.map((college) => (
                      <option key={college} value={college}>{college}</option>
                    ))}
                  </select>
                  {errors.collegeName && <p className="text-red-600 text-sm mt-1">{errors.collegeName}</p>}
                </div>

                {formData.collegeName === 'Other (Custom Input)' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Custom College Name *</label>
                    <input
                      type="text"
                      name="customCollege"
                      value={formData.customCollege}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your college name"
                    />
                    {errors.customCollege && <p className="text-red-600 text-sm mt-1">{errors.customCollege}</p>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Emergency Contact */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Emergency Contact Name *</label>
                  <input
                    type="text"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Full name of emergency contact"
                  />
                  {errors.emergencyContactName && <p className="text-red-600 text-sm mt-1">{errors.emergencyContactName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Emergency Contact Phone *</label>
                  <input
                    type="tel"
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="10-digit active phone number"
                  />
                  {errors.emergencyContactPhone && <p className="text-red-600 text-sm mt-1">{errors.emergencyContactPhone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Relationship *</label>
                  <select
                    name="relationshipToEmergency"
                    value={formData.relationshipToEmergency}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select relationship</option>
                    {relationships.map((relationship) => (
                      <option key={relationship} value={relationship}>{relationship}</option>
                    ))}
                  </select>
                  {errors.relationshipToEmergency && <p className="text-red-600 text-sm mt-1">{errors.relationshipToEmergency}</p>}
                </div>

                {formData.relationshipToEmergency === 'Other (Custom)' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Custom Relationship *</label>
                    <input
                      type="text"
                      name="customRelationship"
                      value={formData.customRelationship}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Specify relationship"
                    />
                    {errors.customRelationship && <p className="text-red-600 text-sm mt-1">{errors.customRelationship}</p>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Review Your Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-slate-600">Full Name:</span>
                    <p className="text-slate-800">{formData.fullName}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-600">Date of Birth:</span>
                    <p className="text-slate-800">{formData.dateOfBirth}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-600">Gender:</span>
                    <p className="text-slate-800 capitalize">{formData.gender}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-600">Mobile:</span>
                    <p className="text-slate-800">{formData.mobileNumber}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-600">College:</span>
                    <p className="text-slate-800">{formData.collegeName === 'Other (Custom Input)' ? formData.customCollege : formData.collegeName}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-600">Emergency Contact:</span>
                    <p className="text-slate-800">{formData.emergencyContactName} ({formData.relationshipToEmergency === 'Other (Custom)' ? formData.customRelationship : formData.relationshipToEmergency})</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
              currentStep === 1 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Previous</span>
          </button>

          {currentStep < 5 ? (
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
            >
              <span>Next</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Submit Verification</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserVerification;