/**
 * Trukio i18n string maps — 5 language variants.
 *
 * en        → Standard English
 * hinglish  → Hindi in Roman script (WhatsApp-style)
 * mr_roman  → Marathi in Roman script
 * hi        → Hindi in Devanagari
 * mr        → Marathi in Devanagari
 */

export type Lang = 'en' | 'hinglish' | 'mr_roman' | 'hi' | 'mr';

export const LANG_LABELS: Record<Lang, string> = {
  en: 'English',
  hinglish: 'Hinglish',
  mr_roman: 'Marathi (Roman)',
  hi: 'हिंदी',
  mr: 'मराठी',
};

export const LANG_LIST: Lang[] = ['en', 'hinglish', 'mr_roman', 'hi', 'mr'];

const strings = {
  en: {
    // Onboarding / auth
    welcomeTitle: 'Welcome to Trukio',
    chooseLanguage: 'Choose your language',
    roleQuestion: 'How will you use the app?',
    roleOwner: 'Transport Owner',
    roleOwnerDesc: 'Manage orders, assign drivers, track deliveries',
    roleDriver: 'Driver',
    roleDriverDesc: 'View assigned jobs and update delivery status',
    continue: 'Continue',
    back: 'Back',
    joinFleet: 'Join your fleet',
    inviteCodeHint: 'Ask your operator for their 8-character invite code',
    yourName: 'Your name',
    yourPhone: 'Your phone',
    inviteCode: 'Invite code',
    joinFleetBtn: 'Join Fleet',

    // Location permission
    locationPermTitle: 'Location During Delivery',
    locationPermBody: 'Your location is shared with the owner only during active deliveries. It stops automatically once delivered.',
    locationPermAllow: 'Allow Location',
    locationPermDeny: 'Not Now',

    // Job statuses
    jobStatus_assigned: 'Assigned',
    jobStatus_accepted: 'Accepted',
    jobStatus_picked_up: 'Picked Up',
    jobStatus_in_transit: 'In Transit',
    jobStatus_delivered: 'Delivered',
    jobStatus_rejected: 'Rejected',

    // Job actions
    acceptJob: 'Accept Job',
    rejectJob: 'Reject Job',
    markPickedUp: 'Mark Picked Up',
    startTransit: 'Start Transit',
    markDelivered: 'Mark Delivered',
    navigateToPickup: 'Navigate to Pickup',
    navigateToDrop: 'Navigate to Drop',

    // General
    noJobsYet: 'No jobs assigned yet',
    settings: 'Settings',
    language: 'Language',
    profile: 'Profile',
    signOut: 'Sign Out',
  },

  hinglish: {
    welcomeTitle: 'Trukio mein aapka swagat hai',
    chooseLanguage: 'Apni bhasha chunein',
    roleQuestion: 'Aap app kaise use karenge?',
    roleOwner: 'Transport Owner',
    roleOwnerDesc: 'Orders manage karo, drivers assign karo, deliveries track karo',
    roleDriver: 'Driver',
    roleDriverDesc: 'Assigned jobs dekho aur delivery status update karo',
    continue: 'Aage badho',
    back: 'Peeche',
    joinFleet: 'Apne fleet mein judein',
    inviteCodeHint: 'Apne operator se 8-character invite code maango',
    yourName: 'Aapka naam',
    yourPhone: 'Aapka phone',
    inviteCode: 'Invite code',
    joinFleetBtn: 'Fleet mein judein',

    locationPermTitle: 'Delivery mein Location',
    locationPermBody: 'Delivery ke time, aapki location sirf owner ko dikhegi. Delivery ke baad apne aap band ho jaayegi.',
    locationPermAllow: 'Location do',
    locationPermDeny: 'Abhi nahi',

    jobStatus_assigned: 'Assign hua',
    jobStatus_accepted: 'Accept hua',
    jobStatus_picked_up: 'Pickup hua',
    jobStatus_in_transit: 'Raste mein',
    jobStatus_delivered: 'Deliver hua',
    jobStatus_rejected: 'Reject hua',

    acceptJob: 'Job accept karo',
    rejectJob: 'Job reject karo',
    markPickedUp: 'Pickup done',
    startTransit: 'Nikal rahe hain',
    markDelivered: 'Deliver ho gaya',
    navigateToPickup: 'Pickup pe jao',
    navigateToDrop: 'Drop pe jao',

    noJobsYet: 'Abhi koi job assign nahi hua',
    settings: 'Settings',
    language: 'Bhasha',
    profile: 'Profile',
    signOut: 'Sign Out',
  },

  mr_roman: {
    welcomeTitle: 'Trukio madhe tumcha swagat aahe',
    chooseLanguage: 'Tumchi bhasha nivda',
    roleQuestion: 'Tumhi app kase vaapral?',
    roleOwner: 'Transport Owner',
    roleOwnerDesc: 'Orders manage kara, drivers assign kara, deliveries track kara',
    roleDriver: 'Driver',
    roleDriverDesc: 'Assigned jobs bagha aani delivery status update kara',
    continue: 'Pudhe chala',
    back: 'Mage',
    joinFleet: 'Tumchya fleet madhe ya',
    inviteCodeHint: 'Tumchya operator kadun 8-character invite code ghya',
    yourName: 'Tumche naav',
    yourPhone: 'Tumcha phone',
    inviteCode: 'Invite code',
    joinFleetBtn: 'Fleet madhe ya',

    locationPermTitle: 'Delivery madhe Location',
    locationPermBody: 'Delivery chya veli, tumchi location fakt owner la disel. Delivery nanthar apoapap band hoil.',
    locationPermAllow: 'Location dya',
    locationPermDeny: 'Ata nako',

    jobStatus_assigned: 'Assign jhale',
    jobStatus_accepted: 'Accept jhale',
    jobStatus_picked_up: 'Pickup jhale',
    jobStatus_in_transit: 'Rasyavar ahe',
    jobStatus_delivered: 'Deliver jhale',
    jobStatus_rejected: 'Reject jhale',

    acceptJob: 'Job accept kara',
    rejectJob: 'Job reject kara',
    markPickedUp: 'Pickup zale',
    startTransit: 'Nighalo',
    markDelivered: 'Deliver zale',
    navigateToPickup: 'Pickup la ja',
    navigateToDrop: 'Drop la ja',

    noJobsYet: 'Ajun kahi job assign nahi',
    settings: 'Settings',
    language: 'Bhasha',
    profile: 'Profile',
    signOut: 'Sign Out',
  },

  hi: {
    welcomeTitle: 'Trukio में आपका स्वागत है',
    chooseLanguage: 'अपनी भाषा चुनें',
    roleQuestion: 'आप ऐप कैसे इस्तेमाल करेंगे?',
    roleOwner: 'ट्रांसपोर्ट ओनर',
    roleOwnerDesc: 'ऑर्डर मैनेज करें, ड्राइवर असाइन करें, डिलीवरी ट्रैक करें',
    roleDriver: 'ड्राइवर',
    roleDriverDesc: 'असाइन किए गए जॉब देखें और डिलीवरी स्टेटस अपडेट करें',
    continue: 'आगे बढ़ें',
    back: 'पीछे',
    joinFleet: 'अपने फ्लीट में जुड़ें',
    inviteCodeHint: 'अपने ऑपरेटर से 8-कैरेक्टर इनवाइट कोड मांगें',
    yourName: 'आपका नाम',
    yourPhone: 'आपका फ़ोन',
    inviteCode: 'इनवाइट कोड',
    joinFleetBtn: 'फ्लीट में जुड़ें',

    locationPermTitle: 'डिलीवरी के दौरान लोकेशन',
    locationPermBody: 'डिलीवरी के समय आपकी लोकेशन सिर्फ ओनर को दिखेगी। डिलीवरी के बाद अपने आप बंद हो जाएगी।',
    locationPermAllow: 'लोकेशन दें',
    locationPermDeny: 'अभी नहीं',

    jobStatus_assigned: 'असाइन हुआ',
    jobStatus_accepted: 'स्वीकार किया',
    jobStatus_picked_up: 'पिकअप हुआ',
    jobStatus_in_transit: 'रास्ते में',
    jobStatus_delivered: 'डिलीवर हुआ',
    jobStatus_rejected: 'अस्वीकार',

    acceptJob: 'जॉब स्वीकार करें',
    rejectJob: 'जॉब अस्वीकार करें',
    markPickedUp: 'पिकअप हुआ',
    startTransit: 'निकल रहे हैं',
    markDelivered: 'डिलीवर हो गया',
    navigateToPickup: 'पिकअप पर जाएं',
    navigateToDrop: 'ड्रॉप पर जाएं',

    noJobsYet: 'अभी कोई जॉब असाइन नहीं हुआ',
    settings: 'सेटिंग्स',
    language: 'भाषा',
    profile: 'प्रोफ़ाइल',
    signOut: 'साइन आउट',
  },

  mr: {
    welcomeTitle: 'Trukio मध्ये तुमचे स्वागत आहे',
    chooseLanguage: 'तुमची भाषा निवडा',
    roleQuestion: 'तुम्ही ॲप कसे वापराल?',
    roleOwner: 'ट्रान्सपोर्ट ओनर',
    roleOwnerDesc: 'ऑर्डर मॅनेज करा, ड्रायव्हर असाइन करा, डिलिव्हरी ट्रॅक करा',
    roleDriver: 'ड्रायव्हर',
    roleDriverDesc: 'असाइन केलेले जॉब बघा आणि डिलिव्हरी स्टेटस अपडेट करा',
    continue: 'पुढे चला',
    back: 'मागे',
    joinFleet: 'तुमच्या फ्लीटमध्ये या',
    inviteCodeHint: 'तुमच्या ऑपरेटरकडून 8-कॅरेक्टर इन्व्हाइट कोड घ्या',
    yourName: 'तुमचे नाव',
    yourPhone: 'तुमचा फोन',
    inviteCode: 'इन्व्हाइट कोड',
    joinFleetBtn: 'फ्लीटमध्ये या',

    locationPermTitle: 'डिलिव्हरीदरम्यान लोकेशन',
    locationPermBody: 'डिलिव्हरीच्या वेळी तुमची लोकेशन फक्त मालकाला दिसेल. डिलिव्हरी झाल्यावर आपोआप बंद होईल.',
    locationPermAllow: 'लोकेशन द्या',
    locationPermDeny: 'आता नको',

    jobStatus_assigned: 'असाइन झाले',
    jobStatus_accepted: 'स्वीकार झाले',
    jobStatus_picked_up: 'पिकअप झाले',
    jobStatus_in_transit: 'रस्त्यावर आहे',
    jobStatus_delivered: 'डिलिव्हर झाले',
    jobStatus_rejected: 'नाकारले',

    acceptJob: 'जॉब स्वीकार करा',
    rejectJob: 'जॉब नाकारा',
    markPickedUp: 'पिकअप झाले',
    startTransit: 'निघालो',
    markDelivered: 'डिलिव्हर झाले',
    navigateToPickup: 'पिकअप ला जा',
    navigateToDrop: 'ड्रॉप ला जा',

    noJobsYet: 'अजून काही जॉब असाइन नाही',
    settings: 'सेटिंग्ज',
    language: 'भाषा',
    profile: 'प्रोफाइल',
    signOut: 'साइन आउट',
  },
} as const;

export type StringKey = keyof typeof strings['en'];
export default strings;
