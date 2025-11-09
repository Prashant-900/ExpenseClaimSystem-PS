export const SCHOOLS = [
  { value: 'SCEE', label: 'SCEE - School of Computing and Electrical Engineering' },
  { value: 'SMME', label: 'SMME - School of Mechanical and Materials Engineering' },
  { value: 'SCENE', label: 'SCENE - School of Civil and Environmental Engineering' },
  { value: 'SBB', label: 'SBB - School of Biosciences and Bioengineering' },
  { value: 'SCS', label: 'SCS - School of Chemical Sciences' },
  { value: 'SMSS', label: 'SMSS - School of Mathematical and Statistical Sciences' },
  { value: 'SPS', label: 'SPS - School of Physical Sciences' },
  { value: 'SoM', label: 'SoM - School of Management' },
  { value: 'SHSS', label: 'SHSS - School of Humanities and Social Sciences' },
  { value: 'CAIR', label: 'CAIR - Centre for Advanced Interdisciplinary Research' },
  { value: 'IKSMHA', label: 'IKSMHA - Indian Knowledge System and Mental Health Applications' },
  { value: 'AMRC', label: 'AMRC - Advanced Materials Research Centre' },
  { value: 'CQST', label: 'CQST - Centre for Quantum Science and Technology' },
  { value: 'C4DFED', label: 'C4DFED - Centre for Design, Fabrication and Entrepreneurship Development' },
  { value: 'BioX Centre', label: 'BioX Centre - Biological and Biomedical Sciences' }
];

export const FUND_TYPES = [
  { value: 'Institute Fund', label: 'Institute Fund' },
  { value: 'Department/School Fund', label: 'Department/School Fund' },
  { value: 'Project Fund', label: 'Project Fund' },
  { value: 'Professional Development Allowance', label: 'Professional Development Allowance' }
];

export const getSchoolLabel = (value) => {
  const school = SCHOOLS.find(s => s.value === value);
  return school ? school.label : value;
};

export const getSchoolShortName = (value) => {
  return value;
};
