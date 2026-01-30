import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCompanyContext } from '../hooks/useCompanyContext';

const EditCompanyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { companies, updateCompanyAPI, getCompanyById } = useCompanyContext();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    website: '',
    contactPerson: '',
    status: 'New',
    industry: 'Technology',
    tags: '',
    personName: '',
    phoneNumber: '',
    alternatePhoneNumber: '',
    gstNumber: '',
    panNumber: ''
  });
  const [errors, setErrors] = useState({});
  const [attachments, setAttachments] = useState([]);
  const [existingDocumentUrl, setExistingDocumentUrl] = useState('');

  // Find the company to edit - convert id to string for comparison
  const companyToEdit = (companies && companies.find(company => String(company._id) === String(id) || String(company.id) === String(id))) || null;

  useEffect(() => {
    const loadCompany = async () => {
      try {
        if (!companyToEdit) {
          // If company not in context, fetch it directly
          const fetchedCompany = await getCompanyById(id);
          setFormData({
            name: fetchedCompany.name || '',
            email: fetchedCompany.email || '',
            website: fetchedCompany.website || '',
            contactPerson: fetchedCompany.contactPerson || '',
            status: fetchedCompany.status || 'New',
            industry: fetchedCompany.industry || 'Technology',
            tags: fetchedCompany.tags || '',
            personName: fetchedCompany.personName || '',
            phoneNumber: fetchedCompany.phoneNumber || '',
            alternatePhoneNumber: fetchedCompany.alternatePhoneNumber || '',
            gstNumber: fetchedCompany.gstNumber || '',
            panNumber: fetchedCompany.panNumber || ''
          });
          // Capture existing document URL if available
          if (fetchedCompany.uploadDocument) {
            setExistingDocumentUrl(fetchedCompany.uploadDocument);
          }
        } else {
          setFormData({
            name: companyToEdit.name || '',
            email: companyToEdit.email || '',
            website: companyToEdit.website || '',
            contactPerson: companyToEdit.contactPerson || '',
            status: companyToEdit.status || 'New',
            industry: companyToEdit.industry || 'Technology',
            tags: companyToEdit.tags || '',
            personName: companyToEdit.personName || '',
            phoneNumber: companyToEdit.phoneNumber || '',
            alternatePhoneNumber: companyToEdit.alternatePhoneNumber || '',
            gstNumber: companyToEdit.gstNumber || '',
            panNumber: companyToEdit.panNumber || ''
          });
          // Capture existing document URL if available
          if (companyToEdit.uploadDocument) {
            setExistingDocumentUrl(companyToEdit.uploadDocument);
          }
        }
      } catch (error) {
        console.error('Error fetching company:', error);
        // Navigate back to companies list if company not found
        navigate('/companies');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadCompany();
    }
  }, [id, companyToEdit, getCompanyById, navigate, companies]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate that only PDF files are accepted
    const validFiles = files.filter(file => {
      const fileType = file.type.toLowerCase();
      const fileName = file.name.toLowerCase();
      
      if (!fileType.includes('pdf') && !fileName.endsWith('.pdf')) {
        alert('Only PDF files are allowed for document uploads.');
        return false;
      }
      return true;
    });
    
    if (validFiles.length === 0) return; // Exit if no valid files
    
    const newAttachments = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      size: file.size,
      type: file.type
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Company name is required';
    if (!formData.website.trim()) newErrors.website = 'Website is required';
    // Validate email if provided
    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Validate attachments if present
    if (attachments.length > 0) {
      const invalidFiles = attachments.some(attachment => {
        const fileType = attachment.file.type.toLowerCase();
        const fileName = attachment.file.name.toLowerCase();
        return !fileType.includes('pdf') && !fileName.endsWith('.pdf');
      });
      
      if (invalidFiles) {
        newErrors.attachments = 'Only PDF files are allowed';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Validate file types before submitting
    if (attachments.length > 0) {
      const invalidFiles = attachments.filter(attachment => {
        const fileType = attachment.file.type.toLowerCase();
        const fileName = attachment.file.name.toLowerCase();
        return !fileType.includes('pdf') && !fileName.endsWith('.pdf');
      });
      
      if (invalidFiles.length > 0) {
        setErrors({ submit: 'Only PDF files are allowed for document uploads.' });
        return;
      }
    }
    
    setLoading(true);
    try {
      // Prepare company data
      // Format according to backend expectations
      const companyData = {
        companyName: formData.name || '',
        companyEmail: formData.email || '',
        contactPerson: formData.contactPerson || 'N/A', // Backend requires this field
        websiteUrl: formData.website || '',
        status: formData.status || 'New',
        industry: formData.industry || 'Technology', // Required field by backend
        tags: formData.tags || '', // Optional field
        personName: formData.personName || '',
        phoneNumber: formData.phoneNumber || '',
        alternatePhoneNumber: formData.alternatePhoneNumber || '',
        gstNumber: formData.gstNumber || '',
        panNumber: formData.panNumber || ''
      };
      
      // Only add uploadDocument if there are actual files to upload
      if (attachments.length > 0) {
        companyData.uploadDocument = attachments.map(attachment => attachment.file);
      }

      await updateCompanyAPI(id, companyData);
      navigate('/companies');
    } catch (error) {
      console.error('Error updating company:', error);
      // Extract error message from response if available
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update company. Please try again.';
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/companies');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Company</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Company Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter company name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter company email"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Person
            </label>
            <input
              type="text"
              id="contactPerson"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter contact person name"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Responded">Responded</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
              Industry
            </label>
            <select
              id="industry"
              name="industry"
              value={formData.industry}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Technology">Technology</option>
              <option value="Finance">Finance</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Education">Education</option>
              <option value="Retail">Retail</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="personName" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Person Name
            </label>
            <input
              type="text"
              id="personName"
              name="personName"
              value={formData.personName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter contact person name"
            />
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Primary Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter primary phone number"
            />
          </div>

          <div>
            <label htmlFor="alternatePhoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Alternate Phone Number
            </label>
            <input
              type="tel"
              id="alternatePhoneNumber"
              name="alternatePhoneNumber"
              value={formData.alternatePhoneNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter alternate phone number"
            />
          </div>

          <div>
            <label htmlFor="gstNumber" className="block text-sm font-medium text-gray-700 mb-1">
              GST Number
            </label>
            <input
              type="text"
              id="gstNumber"
              name="gstNumber"
              value={formData.gstNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter GST number"
            />
          </div>

          <div>
            <label htmlFor="panNumber" className="block text-sm font-medium text-gray-700 mb-1">
              PAN Number
            </label>
            <input
              type="text"
              id="panNumber"
              name="panNumber"
              value={formData.panNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter PAN number"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Document Attachments
          </label>
          
          {/* Display existing document if available */}
          {existingDocumentUrl && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-blue-800">Current Document</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <a 
                      href={existingDocumentUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      View Current PDF
                    </a>
                    <span className="text-xs text-gray-500">(opens in new tab)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
            <div className="space-y-1 text-center">
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                >
                  <span>Upload files</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                    multiple
                    accept=".pdf,application/pdf"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PDF up to 10MB</p>
            </div>
          </div>
          
          {errors.attachments && <p className="mt-1 text-sm text-red-600">{errors.attachments}</p>}
          
          {attachments.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h3>
              <ul className="border rounded-lg divide-y">
                {attachments.map((attachment) => (
                  <li key={attachment.id} className="flex items-center justify-between p-3">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-600 truncate max-w-xs">{attachment.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{(attachment.size / 1024 / 1024).toFixed(2)} MB</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {errors.submit && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{errors.submit}</h3>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Company'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCompanyPage;