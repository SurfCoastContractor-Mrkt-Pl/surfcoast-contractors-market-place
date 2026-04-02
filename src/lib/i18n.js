// Multi-language support configuration
export const supportedLanguages = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  zh: '中文',
  pt: 'Português',
  ja: '日本語',
};

export const translations = {
  en: {
    nav: {
      home: 'Home',
      jobs: 'Jobs',
      contractors: 'Contractors',
      messages: 'Messages',
      settings: 'Settings',
    },
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
    },
    jobs: {
      title: 'Jobs',
      postJob: 'Post a Job',
      browseJobs: 'Browse Jobs',
      jobTitle: 'Job Title',
      jobDescription: 'Job Description',
      budget: 'Budget',
    },
  },
  es: {
    nav: {
      home: 'Inicio',
      jobs: 'Trabajos',
      contractors: 'Contratistas',
      messages: 'Mensajes',
      settings: 'Configuración',
    },
    common: {
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
    },
    jobs: {
      title: 'Trabajos',
      postJob: 'Publicar un Trabajo',
      browseJobs: 'Examinar Trabajos',
      jobTitle: 'Título del Trabajo',
      jobDescription: 'Descripción del Trabajo',
      budget: 'Presupuesto',
    },
  },
  // Additional languages would follow the same pattern
};

export const useLanguage = (lang = 'en') => {
  return translations[lang] || translations.en;
};

export const detectUserLanguage = () => {
  if (typeof navigator !== 'undefined') {
    const browserLang = navigator.language.split('-')[0];
    return supportedLanguages[browserLang] ? browserLang : 'en';
  }
  return 'en';
};