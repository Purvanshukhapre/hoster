// Mock data for the application
export const mockCompanies = [
  {
    id: 1,
    name: 'Tech Innovations Inc.',
    website: 'https://techinnovations.com',
    email: 'contact@techinnovations.com',
    industry: 'Software Development',
    description: 'Leading software development company specializing in enterprise solutions.',
    tags: ['React', 'Node.js', 'Cloud'],
    status: 'New',
    dateAdded: '2024-01-15',
    lastContacted: null,
    responses: [],
    requirements: null,
    notes: 'Potential for large-scale project',
    isShortlisted: false
  },
  {
    id: 2,
    name: 'Data Systems Ltd.',
    website: 'https://datasystems.co',
    email: 'info@datasystems.co',
    industry: 'Data Analytics',
    description: 'Specializes in big data analytics and business intelligence solutions.',
    tags: ['Python', 'AI', 'Machine Learning'],
    status: 'Contacted',
    dateAdded: '2024-01-18',
    lastContacted: '2024-01-20',
    responses: [],
    requirements: null,
    notes: 'Waiting for their response',
    isShortlisted: false
  },
  {
    id: 3,
    name: 'Cloud Solutions Group',
    website: 'https://cloudsolutions.net',
    email: 'hello@cloudsolutions.net',
    industry: 'Cloud Services',
    description: 'Provides cloud infrastructure and migration services.',
    tags: ['AWS', 'Azure', 'DevOps'],
    status: 'Responded',
    dateAdded: '2024-01-10',
    lastContacted: '2024-01-12',
    responses: [
      {
        id: 1,
        date: '2024-01-13',
        subject: 'Re: Partnership Opportunity',
        content: 'Thank you for reaching out. We are interested in exploring partnership opportunities.'
      }
    ],
    requirements: {
      roles: ['DevOps Engineer', 'Cloud Architect'],
      techStack: ['AWS', 'Terraform', 'Kubernetes'],
      hiringType: 'Full-time',
      budget: '$80k - $120k',
      notes: 'Looking for experienced professionals with 5+ years experience'
    },
    notes: 'Strong technical team',
    isShortlisted: true
  },
  {
    id: 4,
    name: 'Mobile First Studios',
    website: 'https://mobilefirst.io',
    email: 'partnerships@mobilefirst.io',
    industry: 'Mobile Development',
    description: 'Mobile app development studio with focus on user experience.',
    tags: ['React Native', 'iOS', 'Android'],
    status: 'Shortlisted',
    dateAdded: '2024-01-05',
    lastContacted: '2024-01-07',
    responses: [
      {
        id: 1,
        date: '2024-01-08',
        subject: 'Re: Mobile Development Partnership',
        content: 'We are very interested in a partnership. Our technical lead will reach out soon.'
      }
    ],
    requirements: {
      roles: ['React Native Developer', 'UI/UX Designer'],
      techStack: ['React Native', 'Figma', 'Firebase'],
      hiringType: 'Contract',
      budget: '$60k - $80k',
      notes: 'Need team members with design thinking experience'
    },
    notes: 'Excellent portfolio of apps',
    isShortlisted: true
  },
  {
    id: 5,
    name: 'AI Research Labs',
    website: 'https://airesearchlabs.org',
    email: 'research@airesearchlabs.org',
    industry: 'Artificial Intelligence',
    description: 'Cutting-edge AI research and development for enterprise applications.',
    tags: ['Machine Learning', 'NLP', 'Computer Vision'],
    status: 'New',
    dateAdded: '2024-01-22',
    lastContacted: null,
    responses: [],
    requirements: null,
    notes: 'Recently funded startup with strong research team',
    isShortlisted: false
  }
];

export const mockEmailTemplates = [
  {
    id: 1,
    name: 'Initial Outreach',
    subject: 'Partnership Opportunity with [Company Name]',
    body: `Hi [Company Name] Team,

I hope this email finds you well. I'm reaching out from [Your Company] to explore potential partnership opportunities. We specialize in [Your Services] and believe there might be synergies between our organizations.

Would you be interested in a brief call to discuss how we might collaborate?

Best regards,
[Your Name]`
  },
  {
    id: 2,
    name: 'Follow-up',
    subject: 'Follow-up: Partnership Opportunity',
    body: `Hi [Company Name] Team,

I wanted to follow up on my previous email about potential partnership opportunities. I understand you might be busy, but I'd appreciate any thoughts on our proposal.

Looking forward to hearing from you.

Best regards,
[Your Name]`
  }
];