module.exports = {
  roleKRAs: {
    'Software Engineer': {
      objectives: 'Deliver high-quality software solutions on time while ensuring innovation and efficiency',
      kras: [
        {
          name: 'Code Quality',
          kpis: [
            { name: 'Code review pass rate', target: '90%+' },
            { name: 'Defect leakage to production', target: '<5%' },
            { name: 'Adherence to coding standards', target: '100% compliance' }
          ]
        },
        {
          name: 'On-Time Delivery',
          kpis: [
            { name: 'Sprint task completion', target: '95% within deadlines' },
            { name: 'Scope creep', target: '<10% variance' }
          ]
        },
        // Add other KRAs as needed
      ]
    },
    // Add other roles as needed
    'default': {
      objectives: 'Achieve excellent performance in all key responsibility areas',
      kras: [
        {
          name: 'Job Knowledge',
          kpis: [
            { name: 'Technical/professional knowledge', target: 'Meets expectations' },
            { name: 'Skill application', target: 'Effective in role' }
          ]
        }
      ]
    }
  }
};