import React, { useMemo } from 'react';
import { useCompanyContext } from '../hooks/useCompanyContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeftIcon, ChatBubbleLeftRightIcon, DocumentTextIcon, ClockIcon } from '@heroicons/react/24/outline';

const ResponsesPage = () => {
  const { companies } = useCompanyContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get('companyId');
  
  // Filter companies that have responded
  const respondedCompanies = useMemo(() => {
    if (companyId) {
      // If a specific company is requested, return just that one
      const company = companies.find(c => c.id === parseInt(companyId));
      return company && company.responses.length > 0 ? [company] : [];
    }
    // Otherwise return all companies that have responses
    return companies.filter(company => company.responses.length > 0);
  }, [companies, companyId]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Companies
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-5">
          <div className="flex items-center">
            <div className="p-2 bg-white/20 rounded-lg">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-bold text-white">
                {companyId ? 'Company Responses' : 'All Responses'}
              </h2>
              <p className="mt-1 text-sm text-green-100">
                {companyId 
                  ? 'Email responses received from this company' 
                  : 'All email responses received from companies'
                }
              </p>
            </div>
          </div>
        </div>
        
        {respondedCompanies.length > 0 ? (
          <div className="p-6">
            {respondedCompanies.map((company) => (
              <div key={company.id} className="mb-8 last:mb-0 border-b border-gray-200 pb-8 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white font-bold">{company.name.charAt(0)}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{company.name}</h3>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                    {company.responses.length} {company.responses.length === 1 ? 'response' : 'responses'}
                  </span>
                </div>
                
                <div className="space-y-4">
                  {company.responses.map((response) => (
                    <div key={response.id} className="border border-gray-200 rounded-xl p-5 bg-gradient-to-r from-gray-50 to-white shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <h4 className="text-sm font-medium text-gray-900">{response.subject}</h4>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {response.date}
                        </div>
                      </div>
                      <div className="text-sm text-gray-700 whitespace-pre-line p-3 bg-white rounded-lg border border-gray-100">
                        {response.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No responses yet</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {companyId 
                ? 'This company has not responded to any emails yet.'
                : 'No companies have responded to emails yet.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponsesPage;