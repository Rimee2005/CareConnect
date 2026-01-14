import { useTranslation as useI18nTranslation } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Common
      'common.welcome': 'Welcome',
      'common.loading': 'Loading...',
      'common.error': 'Error',
      'common.success': 'Success',
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.back': 'Back',
      'common.next': 'Next',
      'common.submit': 'Submit',
      
      // Navigation
      'nav.home': 'Home',
      'nav.about': 'About',
      'nav.login': 'Login',
      'nav.register': 'Register',
      'nav.dashboard': 'Dashboard',
      'nav.profile': 'Profile',
      'nav.logout': 'Logout',
      
      // Roles
      'role.vital': 'I am a Vital',
      'role.guardian': 'I am a Guardian',
      
      // Vital
      'vital.browse': 'Browse Guardians',
      'vital.book': 'Book Service',
      'vital.chat': 'Chat Now',
      'vital.profile': 'My Profile',
      
      // Guardian
      'guardian.bookings': 'Bookings',
      'guardian.accept': 'Accept',
      'guardian.reject': 'Reject',
      'guardian.status.pending': 'Pending',
      'guardian.status.accepted': 'Accepted',
      'guardian.status.ongoing': 'Ongoing',
      'guardian.status.completed': 'Completed',
      
      // Booking
      'booking.request': 'Request Booking',
      'booking.status': 'Status',
      'booking.notes': 'Notes',
      
      // Notifications
      'notifications.title': 'Notifications',
      'notifications.empty': 'No notifications',
      'notifications.markRead': 'Mark as read',
      
      // Features
      'feature.sos': 'Emergency Support',
      'feature.sos.comingSoon': 'Emergency support coming soon',
      'feature.ai': 'AI Matching',
      'feature.ai.comingSoon': 'Smart matching coming soon',
    },
  },
  hi: {
    translation: {
      // Common
      'common.welcome': 'स्वागत है',
      'common.loading': 'लोड हो रहा है...',
      'common.error': 'त्रुटि',
      'common.success': 'सफल',
      'common.save': 'सहेजें',
      'common.cancel': 'रद्द करें',
      'common.delete': 'हटाएं',
      'common.edit': 'संपादित करें',
      'common.back': 'वापस',
      'common.next': 'अगला',
      'common.submit': 'जमा करें',
      
      // Navigation
      'nav.home': 'होम',
      'nav.about': 'के बारे में',
      'nav.login': 'लॉगिन',
      'nav.register': 'पंजीकरण',
      'nav.dashboard': 'डैशबोर्ड',
      'nav.profile': 'प्रोफ़ाइल',
      'nav.logout': 'लॉगआउट',
      
      // Roles
      'role.vital': 'मैं एक वाइटल हूं',
      'role.guardian': 'मैं एक गार्जियन हूं',
      
      // Vital
      'vital.browse': 'गार्जियन ब्राउज़ करें',
      'vital.book': 'सेवा बुक करें',
      'vital.chat': 'चैट करें',
      'vital.profile': 'मेरी प्रोफ़ाइल',
      
      // Guardian
      'guardian.bookings': 'बुकिंग',
      'guardian.accept': 'स्वीकार करें',
      'guardian.reject': 'अस्वीकार करें',
      'guardian.status.pending': 'लंबित',
      'guardian.status.accepted': 'स्वीकृत',
      'guardian.status.ongoing': 'चल रहा है',
      'guardian.status.completed': 'पूर्ण',
      
      // Booking
      'booking.request': 'बुकिंग अनुरोध',
      'booking.status': 'स्थिति',
      'booking.notes': 'नोट्स',
      
      // Notifications
      'notifications.title': 'सूचनाएं',
      'notifications.empty': 'कोई सूचना नहीं',
      'notifications.markRead': 'पढ़ा हुआ चिह्नित करें',
      
      // Features
      'feature.sos': 'आपातकालीन सहायता',
      'feature.sos.comingSoon': 'आपातकालीन सहायता जल्द ही आ रही है',
      'feature.ai': 'AI मिलान',
      'feature.ai.comingSoon': 'स्मार्ट मिलान जल्द ही आ रहा है',
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export function useTranslation() {
  return useI18nTranslation();
}

export default i18n;

