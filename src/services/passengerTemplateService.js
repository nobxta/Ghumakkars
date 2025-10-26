// Service for managing passenger templates (frequently used passenger details)
const TEMPLATE_STORAGE_KEY = 'ghumakkars_passenger_templates';

const passengerTemplateService = {
  // Get all templates
  getAllTemplates: () => {
    try {
      const templates = localStorage.getItem(TEMPLATE_STORAGE_KEY);
      return templates ? JSON.parse(templates) : [];
    } catch (error) {
      console.error('Error getting templates:', error);
      return [];
    }
  },

  // Save a new template
  saveTemplate: (templateData) => {
    try {
      const templates = passengerTemplateService.getAllTemplates();
      const newTemplate = {
        id: Date.now().toString(),
        ...templateData,
        createdAt: new Date().toISOString()
      };
      
      templates.push(newTemplate);
      localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
      return newTemplate;
    } catch (error) {
      console.error('Error saving template:', error);
      return null;
    }
  },

  // Update existing template
  updateTemplate: (templateId, templateData) => {
    try {
      const templates = passengerTemplateService.getAllTemplates();
      const index = templates.findIndex(t => t.id === templateId);
      
      if (index === -1) return false;
      
      templates[index] = {
        ...templates[index],
        ...templateData,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
      return true;
    } catch (error) {
      console.error('Error updating template:', error);
      return false;
    }
  },

  // Delete template
  deleteTemplate: (templateId) => {
    try {
      const templates = passengerTemplateService.getAllTemplates();
      const filtered = templates.filter(t => t.id !== templateId);
      localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting template:', error);
      return false;
    }
  },

  // Get template by ID
  getTemplate: (templateId) => {
    try {
      const templates = passengerTemplateService.getAllTemplates();
      return templates.find(t => t.id === templateId) || null;
    } catch (error) {
      console.error('Error getting template:', error);
      return null;
    }
  },

  // Quick templates for common relationships
  getQuickTemplates: (userProfile) => {
    const quickTemplates = [];
    
    // Self
    if (userProfile) {
      quickTemplates.push({
        id: 'self',
        label: '👤 Myself',
        name: userProfile.name || '',
        phone: userProfile.phone || '',
        age: userProfile.age || '',
        college: userProfile.college || { name: '', id: '', notPreferToSay: false }
      });
    }
    
    return quickTemplates;
  }
};

export default passengerTemplateService;

