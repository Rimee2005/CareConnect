import { useTranslation as useI18nTranslation } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Get language from localStorage or default to 'en'
// This function is safe for SSR as it defaults to 'en' when window is undefined
const getInitialLanguage = (): string => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('careconnect-language');
      if (stored === 'en' || stored === 'hi') {
        return stored;
      }
    } catch (e) {
      // localStorage might not be available
      return 'en';
    }
  }
  return 'en';
};

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
      
      // About Page
      'about.title': 'About CareConnect',
      'about.mission.title': 'Our Mission',
      'about.mission.content': 'Connecting lives through care. At CareConnect, we believe that everyone deserves access to compassionate, quality healthcare. Our platform bridges the gap between those in need of care (Vitals) and dedicated caregivers (Guardians), creating a trusted community built on empathy, professionalism, and genuine human connection.',
      'about.vision.title': 'Our Vision',
      'about.vision.content': 'To become India\'s most trusted healthcare caregiving platform, where every Vital finds the perfect Guardian, and every Guardian can make a meaningful difference. We envision a future where quality healthcare is accessible, transparent, and built on relationships that matter.',
      'about.forVitals.title': 'For Vitals',
      'about.forVitals.content': 'Find verified, compassionate Guardians who understand your unique health needs. Browse detailed profiles, read authentic reviews from other Vitals, and connect with caregivers who are committed to your wellbeing. Our platform ensures every Guardian is verified, experienced, and ready to provide the care you deserve.',
      'about.forGuardians.title': 'For Guardians',
      'about.forGuardians.content': 'Join a community of dedicated caregivers making a real difference. Manage your bookings efficiently, build your reputation through genuine reviews, and connect with Vitals who truly value your expertise. Our platform helps you showcase your skills, manage your schedule, and grow your caregiving practice.',
      'about.story.title': 'Our Story',
      'about.story.content1': 'CareConnect was born from a simple observation: healthcare shouldn\'t be fragmented across multiple platforms, phone calls, and WhatsApp messages. We saw families struggling to find reliable caregivers, and experienced professionals struggling to connect with those who need their help.',
      'about.story.content2': 'We envisioned a unified, trust-driven platform where Vitals and Guardians can connect seamlessly, with verified profiles, structured workflows, and compassionate care at the heart of everything we do. Every feature we build is designed to make healthcare more accessible, transparent, and human.',
      'about.story.content3': 'Today, we\'re proud to be building a platform that not only connects people but also ensures that every interaction is built on trust, transparency, and genuine care. We\'re committed to making quality healthcare accessible to everyone, one connection at a time.',
      'about.values.title': 'Our Values',
      'about.values.compassion': 'Compassion',
      'about.values.compassion.desc': 'We believe that healthcare is fundamentally about caring for people. Every feature, every interaction, and every decision we make is guided by empathy and a genuine desire to help.',
      'about.values.trust': 'Trust',
      'about.values.trust.desc': 'Trust is the foundation of healthcare. We verify every Guardian, protect your data with enterprise-grade security, and ensure transparency in every booking and interaction.',
      'about.values.excellence': 'Excellence',
      'about.values.excellence.desc': 'We strive for excellence in everything we do. From our platform\'s user experience to the quality of care provided, we set high standards and continuously improve.',
      'about.values.community': 'Community',
      'about.values.community.desc': 'CareConnect is more than a platform—it\'s a community. We bring together Vitals and Guardians who share a commitment to compassionate, quality healthcare.',
      'about.why.title': 'Why Choose CareConnect?',
      'about.why.verified': 'Verified Guardians',
      'about.why.verified.desc': 'Every Guardian on our platform undergoes thorough verification, including background checks and credential validation. Your safety and peace of mind are our top priorities.',
      'about.why.transparent': 'Transparent Reviews',
      'about.why.transparent.desc': 'Read authentic reviews from real Vitals who have worked with Guardians. Our review system ensures transparency and helps you make informed decisions.',
      'about.why.easy': 'Easy to Use',
      'about.why.easy.desc': 'Our platform is designed to be intuitive and accessible. Whether you\'re a Vital looking for care or a Guardian managing bookings, everything you need is just a few clicks away.',
      'about.why.support': '24/7 Support',
      'about.why.support.desc': 'Our support team is always here to help. Whether you have questions about using the platform or need assistance with a booking, we\'re available around the clock.',
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
      
      // About Page
      'about.title': 'CareConnect के बारे में',
      'about.mission.title': 'हमारा मिशन',
      'about.mission.content': 'देखभाल के माध्यम से जीवन को जोड़ना। CareConnect में, हम मानते हैं कि हर किसी को दयालु, गुणवत्तापूर्ण स्वास्थ्य सेवा तक पहुंच का अधिकार है। हमारा प्लेटफॉर्म देखभाल की आवश्यकता वाले लोगों (वाइटल्स) और समर्पित देखभाल करने वालों (गार्जियन्स) के बीच की खाई को पाटता है, सहानुभूति, व्यावसायिकता और वास्तविक मानवीय संबंधों पर निर्मित एक विश्वसनीय समुदाय बनाता है।',
      'about.vision.title': 'हमारी दृष्टि',
      'about.vision.content': 'भारत का सबसे विश्वसनीय स्वास्थ्य सेवा देखभाल प्लेटफॉर्म बनना, जहां हर वाइटल को सही गार्जियन मिले, और हर गार्जियन एक सार्थक अंतर ला सके। हम एक ऐसे भविष्य की कल्पना करते हैं जहां गुणवत्तापूर्ण स्वास्थ्य सेवा सुलभ, पारदर्शी हो, और उन रिश्तों पर निर्मित हो जो मायने रखते हैं।',
      'about.forVitals.title': 'वाइटल्स के लिए',
      'about.forVitals.content': 'सत्यापित, दयालु गार्जियन्स खोजें जो आपकी अद्वितीय स्वास्थ्य आवश्यकताओं को समझते हैं। विस्तृत प्रोफाइल ब्राउज़ करें, अन्य वाइटल्स से प्रामाणिक समीक्षाएं पढ़ें, और उन देखभाल करने वालों से जुड़ें जो आपकी भलाई के लिए प्रतिबद्ध हैं। हमारा प्लेटफॉर्म सुनिश्चित करता है कि हर गार्जियन सत्यापित, अनुभवी हो, और आपको वह देखभाल प्रदान करने के लिए तैयार हो जिसके आप हकदार हैं।',
      'about.forGuardians.title': 'गार्जियन्स के लिए',
      'about.forGuardians.content': 'वास्तविक अंतर लाने वाले समर्पित देखभाल करने वालों के समुदाय में शामिल हों। अपनी बुकिंग को कुशलतापूर्वक प्रबंधित करें, वास्तविक समीक्षाओं के माध्यम से अपनी प्रतिष्ठा बनाएं, और उन वाइटल्स से जुड़ें जो वास्तव में आपकी विशेषज्ञता को महत्व देते हैं। हमारा प्लेटफॉर्म आपको अपने कौशल को प्रदर्शित करने, अपने कार्यक्रम का प्रबंधन करने, और अपने देखभाल अभ्यास को बढ़ाने में मदद करता है।',
      'about.story.title': 'हमारी कहानी',
      'about.story.content1': 'CareConnect एक साधारण अवलोकन से पैदा हुआ: स्वास्थ्य सेवा को कई प्लेटफॉर्म, फोन कॉल और WhatsApp संदेशों में विभाजित नहीं होना चाहिए। हमने देखा कि परिवार विश्वसनीय देखभाल करने वालों को खोजने के लिए संघर्ष कर रहे हैं, और अनुभवी पेशेवर उन लोगों से जुड़ने के लिए संघर्ष कर रहे हैं जिन्हें उनकी मदद की आवश्यकता है।',
      'about.story.content2': 'हमने एक एकीकृत, विश्वास-संचालित प्लेटफॉर्म की कल्पना की जहां वाइटल्स और गार्जियन्स सहजता से जुड़ सकते हैं, सत्यापित प्रोफाइल, संरचित वर्कफ़्लोज़, और हमारे द्वारा किए जाने वाले हर काम के केंद्र में दयालु देखभाल के साथ। हम जो भी सुविधा बनाते हैं, वह स्वास्थ्य सेवा को अधिक सुलभ, पारदर्शी और मानवीय बनाने के लिए डिज़ाइन की गई है।',
      'about.story.content3': 'आज, हमें गर्व है कि हम एक ऐसा प्लेटफॉर्म बना रहे हैं जो न केवल लोगों को जोड़ता है बल्कि यह भी सुनिश्चित करता है कि हर बातचीत विश्वास, पारदर्शिता और वास्तविक देखभाल पर निर्मित हो। हम सभी के लिए गुणवत्तापूर्ण स्वास्थ्य सेवा को सुलभ बनाने के लिए प्रतिबद्ध हैं, एक कनेक्शन एक समय।',
      'about.values.title': 'हमारे मूल्य',
      'about.values.compassion': 'दया',
      'about.values.compassion.desc': 'हम मानते हैं कि स्वास्थ्य सेवा मौलिक रूप से लोगों की देखभाल के बारे में है। हम जो भी सुविधा, बातचीत और निर्णय लेते हैं, वह सहानुभूति और मदद करने की वास्तविक इच्छा से निर्देशित होता है।',
      'about.values.trust': 'विश्वास',
      'about.values.trust.desc': 'विश्वास स्वास्थ्य सेवा की नींव है। हम हर गार्जियन को सत्यापित करते हैं, उद्यम-ग्रेड सुरक्षा के साथ आपके डेटा की सुरक्षा करते हैं, और हर बुकिंग और बातचीत में पारदर्शिता सुनिश्चित करते हैं।',
      'about.values.excellence': 'उत्कृष्टता',
      'about.values.excellence.desc': 'हम अपने द्वारा किए जाने वाले हर काम में उत्कृष्टता के लिए प्रयास करते हैं। हमारे प्लेटफॉर्म के उपयोगकर्ता अनुभव से लेकर प्रदान की गई देखभाल की गुणवत्ता तक, हम उच्च मानक निर्धारित करते हैं और लगातार सुधार करते हैं।',
      'about.values.community': 'समुदाय',
      'about.values.community.desc': 'CareConnect एक प्लेटफॉर्म से अधिक है—यह एक समुदाय है। हम वाइटल्स और गार्जियन्स को एक साथ लाते हैं जो दयालु, गुणवत्तापूर्ण स्वास्थ्य सेवा के लिए प्रतिबद्धता साझा करते हैं।',
      'about.why.title': 'CareConnect क्यों चुनें?',
      'about.why.verified': 'सत्यापित गार्जियन्स',
      'about.why.verified.desc': 'हमारे प्लेटफॉर्म पर हर गार्जियन पूरी तरह से सत्यापन से गुजरता है, जिसमें पृष्ठभूमि जांच और क्रेडेंशियल सत्यापन शामिल है। आपकी सुरक्षा और मन की शांति हमारी सर्वोच्च प्राथमिकताएं हैं।',
      'about.why.transparent': 'पारदर्शी समीक्षाएं',
      'about.why.transparent.desc': 'वास्तविक वाइटल्स से प्रामाणिक समीक्षाएं पढ़ें जिन्होंने गार्जियन्स के साथ काम किया है। हमारी समीक्षा प्रणाली पारदर्शिता सुनिश्चित करती है और आपको सूचित निर्णय लेने में मदद करती है।',
      'about.why.easy': 'उपयोग में आसान',
      'about.why.easy.desc': 'हमारा प्लेटफॉर्म सहज और सुलभ होने के लिए डिज़ाइन किया गया है। चाहे आप देखभाल की तलाश करने वाले वाइटल हों या बुकिंग प्रबंधित करने वाले गार्जियन, आपको जो कुछ भी चाहिए वह कुछ ही क्लिक दूर है।',
      'about.why.support': '24/7 सहायता',
      'about.why.support.desc': 'हमारी सहायता टीम हमेशा मदद के लिए यहां है। चाहे आपके पास प्लेटफॉर्म के उपयोग के बारे में प्रश्न हों या बुकिंग के साथ सहायता की आवश्यकता हो, हम चौबीसों घंटे उपलब्ध हैं।',
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

// Persist language changes to localStorage
i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('careconnect-language', lng);
  }
});

export function useTranslation() {
  return useI18nTranslation();
}

export default i18n;

