import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { useCompanyContext } from '../hooks/useCompanyContext';
import EditCompanyModal from '../components/EditCompanyModal';

const CompanyDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { updateCompanyAPI } = useCompanyContext();
  const navigate = useNavigate();
  
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    industry: '',
    website: '',
    description: '',
    status: 'New'
  });
  
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        // Direct API call to fetch company details
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`https://elitehoster-backend-production.up.railway.app/api/companies/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        // Check if response has expected structure
        if (response.data && response.data.success && response.data.data) {
          // Normalize the company data to match expected format
          const companyData = {
            ...response.data.data,
            id: response.data.data._id || response.data.data.id,
            name: response.data.data.companyName || response.data.data.name || 'Unnamed Company',
            website: response.data.data.websiteUrl || response.data.data.website || '#',
            email: response.data.data.companyEmail || response.data.data.email || 'N/A',
            responses: response.data.data.responses || [],
            requirements: response.data.data.requirements || null,
            isShortlisted: response.data.data.isShortlisted || false,
            dateAdded: response.data.data.dateAdded || response.data.data.createdAt || new Date().toISOString().split('T')[0],
            industry: response.data.data.industry || 'N/A',
            status: response.data.data.status || 'Unknown',
            description: response.data.data.description || 'No description'
          };
          
          setCompany(companyData);
        } else {
          // Handle case where response format is unexpected
          console.error('Unexpected API response format:', response.data);
          setError(new Error('Unexpected response format from server'));
        }
      } catch (err) {
        console.error('Error fetching company:', err);
        setError(err);
        
        // Navigate to companies list if it's a 404 error
        if (err.response && err.response.status === 404) {
          setTimeout(() => {
            navigate('/companies');
          }, 2000);
        }
      } finally {
        setLoading(false);
      }
    };
    
    // Only fetch if we have a valid ID
    if (id) {
      fetchCompany();
    } else {
      setError(new Error('Company ID not provided'));
      setLoading(false);
    }
  }, [id, navigate]);
  
  // Show loading spinner while fetching company data
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading company details...</p>
        </div>
      </div>
    );
  }
  
  // Show error message for errors
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-8">
            <div className="text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Error Loading Company</h3>
              <p className="text-gray-600 mb-2">{error.message || 'Failed to load company details'}</p>
              {error.response?.status && (
                <p className="text-gray-500 text-sm mb-4">Status: {error.response.status} {error.response.statusText}</p>
              )}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Retry
                </button>
                <button
                  onClick={() => navigate('/companies')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Back to Companies
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // If no company data after loading, show error
  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Failed to load company data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Header */}
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {company.name}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Company Details
                </p>
              </div>
              <div className="flex space-x-3">
                {user?.role === 'admin' && (
                  <button
                    onClick={() => {
                      // Set the edit form data with current company data
                      setEditFormData({
                        name: company.name || '',
                        email: company.email || '',
                        industry: company.industry || '',
                        website: company.website || '',
                        description: company.description || '',
                        status: company.status || 'New'
                      });
                      setEditModalOpen(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => navigate('/companies')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Back to List
                </button>
              </div>
            </div>
          </div>

          <div className="px-4 py-5 sm:p-6">
            {/* Company Overview */}
            <div className="mb-8">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Company Overview</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-sm font-medium text-gray-500">Basic Information</h5>
                  <dl className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Name</dt>
                      <dd className="text-sm text-gray-900">{company.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Industry</dt>
                      <dd className="text-sm text-gray-900">{company.industry}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Website</dt>
                      <dd className="text-sm text-gray-900">
                        <a 
                          href={company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {company.website}
                        </a>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Location</dt>
                      <dd className="text-sm text-gray-900">{company.location || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Company Size</dt>
                      <dd className="text-sm text-gray-900">{company.companySize || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Revenue</dt>
                      <dd className="text-sm text-gray-900">{company.revenue || 'N/A'}</dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-gray-500">Contact Information</h5>
                  <dl className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Contact Person</dt>
                      <dd className="text-sm text-gray-900">{company.contactPerson || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Email</dt>
                      <dd className="text-sm text-gray-900">{company.email || company.companyEmail || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Phone</dt>
                      <dd className="text-sm text-gray-900">{company.phone || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">LinkedIn</dt>
                      <dd className="text-sm text-gray-900">
                        <a 
                          href={company.linkedIn || '#'} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {company.linkedIn || 'N/A'}
                        </a>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="mb-8">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Requirements</h4>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-600 mb-2">Job Title: {company.jobTitle || 'N/A'}</p>
                <p className="text-sm text-gray-600 mb-2">Job Description: {company.jobDescription || 'N/A'}</p>
                <p className="text-sm text-gray-600 mb-2">Required Skills: {company.requiredSkills || 'N/A'}</p>
                <p className="text-sm text-gray-600 mb-2">Salary Range: {company.salaryRange || 'N/A'}</p>
                <p className="text-sm text-gray-600">Benefits: {company.benefits || 'N/A'}</p>
              </div>
            </div>

            {/* Responses */}
            <div className="mb-8">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Responses</h4>
              {company.responses && company.responses.length > 0 ? (
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                          Candidate
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Email
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Status
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Applied Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {company.responses.map((response, index) => (
                        <tr key={response.id || response.email || `resp-${index}`}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {response.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {response.email}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              response.status === 'shortlisted' 
                                ? 'bg-green-100 text-green-800' 
                                : response.status === 'rejected' 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {response.status}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {response.appliedDate}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-600">No responses yet.</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/compose-email')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Send Email
              </button>
              <button
                onClick={() => navigate('/shortlisted')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                View Shortlisted
              </button>
              <button
                onClick={() => navigate('/email-tracker')}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Email Tracker
              </button>
            </div>
          </div>
        </div>
      </div>

      <EditCompanyModal
        isOpen={editModalOpen}
        company={company}
        formData={editFormData}
        setFormData={setEditFormData}
        onClose={() => setEditModalOpen(false)}
        onSave={async () => {
          try {
            // Map the form data to match backend field names
            const companyDataToSend = {
              ...editFormData,
              companyName: editFormData.name,
              companyEmail: editFormData.email,
              websiteUrl: editFormData.website,
              dateAdded: company.dateAdded || new Date().toISOString().split('T')[0]
            };
            
            // Remove the name and email fields since we're using the mapped versions
            delete companyDataToSend.name;
            delete companyDataToSend.email;
            delete companyDataToSend.website;
            
            await updateCompanyAPI(company.id, companyDataToSend);
            // Update the local company state with the new data
            setCompany({
              ...company,
              ...companyDataToSend,
              name: companyDataToSend.companyName,
              email: companyDataToSend.companyEmail,
              website: companyDataToSend.websiteUrl
            });
            setEditModalOpen(false);
          } catch (error) {
            console.error('Error updating company:', error);
          }
        }}
      />
    </div>
  );
};

export default CompanyDetailsPage;