import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCompanyContext } from '../hooks/useCompanyContext';
import { useAuth } from '../hooks/useAuth';
import { 
  BuildingOfficeIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  GlobeAltIcon, 
  MapPinIcon, 
  DocumentTextIcon, 
  PencilIcon, 
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  TrashIcon,
  UserIcon,
  ChartBarIcon,
  XCircleIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';

const CompanyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCompanyById, deleteCompanyAPI } = useCompanyContext();
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);
        const companyData = await getCompanyById(id);
        setCompany(companyData);
      } catch (error) {
        console.error('Error fetching company:', error);
        // Optionally navigate to a not found page
        // navigate('/not-found');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompany();
  }, [id, getCompanyById]);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const getStatusColor = (status) => {
    switch(status) {
      case 'New': return 'bg-gray-100 text-gray-800';
      case 'Contacted': return 'bg-yellow-100 text-yellow-800';
      case 'Responded': return 'bg-green-100 text-green-800';
      case 'Shortlisted': return 'bg-blue-100 text-blue-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'New':
        return <ClockIcon className="h-5 w-5 text-gray-600" />;
      case 'Contacted':
        return <EnvelopeIcon className="h-5 w-5 text-yellow-600" />;
      case 'Responded':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'Shortlisted':
        return <UserGroupIcon className="h-5 w-5 text-blue-600" />;
      case 'Rejected':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCompanyAPI(id);
      setShowDeleteModal(false);
      navigate('/companies');
    } catch (error) {
      console.error('Error deleting company:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Company not found</h3>
          <p className="mt-1 text-sm text-gray-500">The requested company could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/companies')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Companies
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
          <p className="text-gray-600 mt-1">Detailed information about {company.name}</p>
        </div>
        {user?.role !== 'developer' && (
        <div className="flex space-x-3">
          <button
            onClick={() => navigate(`/companies/${id}/edit`)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <PencilIcon className="h-5 w-5 mr-2" />
            Edit
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            <TrashIcon className="h-5 w-5 mr-2" />
            Delete
          </button>
        </div>
        )}
      </div>

      {/* Company Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <BuildingOfficeIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{company.name}</h2>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(company.status)}`}>
                    {getStatusIcon(company.status)}
                    <span className="ml-1">{company.status}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{company.contactPerson}</p>
                      <p className="text-sm text-gray-500">{company.position}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <p className="text-sm text-gray-900">{company.personName}</p>
                  </div>
                  <div className="flex items-center">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <p className="text-sm text-gray-900">{company.phoneNumber}</p>
                  </div>
                  <div className="flex items-center">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <p className="text-sm text-gray-900">{company.alternatePhoneNumber}</p>
                  </div>
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <p className="text-sm text-gray-900">{company.email}</p>
                  </div>
                  <div className="flex items-center">
                    <BriefcaseIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <p className="text-sm text-gray-900">GST: {company.gstNumber}</p>
                  </div>
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <p className="text-sm text-gray-900">PAN: {company.panNumber}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Company Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <GlobeAltIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <p className="text-sm text-gray-900">{company.website || 'Not provided'}</p>
                  </div>
                  <div className="flex items-center">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <p className="text-sm text-gray-900">{company.location}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
            <div className="relative">
              <div className="absolute top-3 left-3">
                <DocumentTextIcon className="h-5 w-5 text-gray-400" />
              </div>
              <p className="pl-10 text-gray-700">
                {company.notes || 'No notes available for this company.'}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Status</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(company.status)}`}>
                  {getStatusIcon(company.status)}
                  <span className="ml-1">{company.status}</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Shortlisted</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  company.isShortlisted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {company.isShortlisted ? (
                    <CheckCircleIcon className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <ClockIcon className="h-4 w-4 text-gray-600 mr-1" />
                  )}
                  {company.isShortlisted ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Contact Date</span>
                <span className="text-sm text-gray-900">
                  {company.createdAt ? new Date(company.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/compose-email')}
                className="w-full flex items-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <EnvelopeIcon className="h-5 w-5 mr-2" />
                Send Email
              </button>
              {user?.role !== 'developer' && (
              <button
                onClick={() => navigate('/analytics')}
                className="w-full flex items-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <ChartBarIcon className="h-5 w-5 mr-2" />
                View Analytics
              </button>
              )}
              {user?.role !== 'developer' && (
              <button
                onClick={() => navigate('/shortlisted')}
                className="w-full flex items-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <UserGroupIcon className="h-5 w-5 mr-2" />
                Add to Shortlist
              </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Delete Company</h2>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-semibold">{company.name}</span>? 
                This action cannot be undone and all associated data will be permanently removed.
              </p>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                >
                  Delete Company
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDetailPage;