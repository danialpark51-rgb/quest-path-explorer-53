import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "hi" | "kn" | "mr" | "te" | "ta";

type Translations = Record<string, Record<Language, string>>;

const translations: Translations = {
  "welcome_back": { en: "Welcome back,", hi: "वापसी पर स्वागत,", kn: "ಮರಳಿ ಸ್ವಾಗತ,", mr: "परत स्वागत,", te: "తిరిగి స్వాగతం,", ta: "மீண்டும் வரவேற்கிறோம்," },
  "your_goal": { en: "Your Goal", hi: "आपका लक्ष्य", kn: "ನಿಮ್ಮ ಗುರಿ", mr: "तुमचे ध्येय", te: "మీ లక్ష్యం", ta: "உங்கள் இலக்கு" },
  "change": { en: "Change", hi: "बदलें", kn: "ಬದಲಿಸಿ", mr: "बदला", te: "మార్చండి", ta: "மாற்று" },
  "recommended_videos": { en: "Recommended Videos", hi: "सुझावित वीडियो", kn: "ಶಿಫಾರಸು ಮಾಡಿದ ವೀಡಿಯೊಗಳು", mr: "शिफारस केलेले व्हिडिओ", te: "సిఫార్సు చేసిన వీడియోలు", ta: "பரிந்துரைக்கப்பட்ட வீடியோக்கள்" },
  "see_all": { en: "See All", hi: "सभी देखें", kn: "ಎಲ್ಲಾ ನೋಡಿ", mr: "सर्व पहा", te: "అన్నీ చూడండి", ta: "அனைத்தையும் பார்" },
  "daily_tasks": { en: "Daily Tasks", hi: "दैनिक कार्य", kn: "ದೈನಿಕ ಕಾರ್ಯಗಳು", mr: "दैनिक कार्ये", te: "రోజువారీ పనులు", ta: "தினசரி பணிகள்" },
  "view_all": { en: "View All", hi: "सभी देखें", kn: "ಎಲ್ಲಾ ವೀಕ್ಷಿಸಿ", mr: "सर्व पहा", te: "అన్నీ చూడండి", ta: "அனைத்தையும் பார்" },
  "skill_modules": { en: "Skill Modules", hi: "कौशल मॉड्यूल", kn: "ಕೌಶಲ್ಯ ಮಾಡ್ಯೂಲ್‌ಗಳು", mr: "कौशल्य मॉड्यूल", te: "నైపుణ్య మాడ్యూల్స్", ta: "திறன் தொகுதிகள்" },
  "all_skills": { en: "All Skills", hi: "सभी कौशल", kn: "ಎಲ್ಲಾ ಕೌಶಲ್ಯಗಳು", mr: "सर्व कौशल्ये", te: "అన్ని నైపుణ్యాలు", ta: "அனைத்து திறன்கள்" },
  "audio_stories": { en: "Audio Stories", hi: "ऑडियो कहानियाँ", kn: "ಆಡಿಯೋ ಕಥೆಗಳು", mr: "ऑडिओ कथा", te: "ఆడియో కథలు", ta: "ஆடியோ கதைகள்" },
  "all_stories": { en: "All Stories", hi: "सभी कहानियाँ", kn: "ಎಲ್ಲಾ ಕಥೆಗಳು", mr: "सर्व कथा", te: "అన్ని కథలు", ta: "அனைத்து கதைகள்" },
  "daily_news": { en: "Daily News", hi: "दैनिक समाचार", kn: "ದೈನಿಕ ಸುದ್ದಿ", mr: "दैनिक बातम्या", te: "రోజువారీ వార్తలు", ta: "தினசரி செய்திகள்" },
  "more": { en: "More", hi: "और", kn: "ಇನ್ನಷ್ಟು", mr: "अधिक", te: "మరిన్ని", ta: "மேலும்" },
  "quizzes": { en: "Quizzes", hi: "क्विज़", kn: "ಕ್ವಿಜ್‌ಗಳು", mr: "क्विझ", te: "క్విజ్‌లు", ta: "வினாடி வினா" },
  "ai_assistant": { en: "AI Assistant", hi: "AI सहायक", kn: "AI ಸಹಾಯಕ", mr: "AI सहाय्यक", te: "AI సహాయకుడు", ta: "AI உதவியாளர்" },
  "home": { en: "Home", hi: "होम", kn: "ಮುಖಪುಟ", mr: "मुख्यपृष्ठ", te: "హోమ్", ta: "முகப்பு" },
  "skills": { en: "Skills", hi: "कौशल", kn: "ಕೌಶಲ್ಯ", mr: "कौशल्य", te: "నైపుణ్యాలు", ta: "திறன்கள்" },
  "quiz": { en: "Quiz", hi: "क्विज़", kn: "ಕ್ವಿಜ್", mr: "क्विझ", te: "క్విజ్", ta: "வினாடி வினா" },
  "stories": { en: "Stories", hi: "कहानियाँ", kn: "ಕಥೆಗಳು", mr: "कथा", te: "కథలు", ta: "கதைகள்" },
  "ai": { en: "AI", hi: "AI", kn: "AI", mr: "AI", te: "AI", ta: "AI" },
  "games": { en: "Games", hi: "खेल", kn: "ಆಟಗಳು", mr: "खेळ", te: "ఆటలు", ta: "விளையாட்டுகள்" },
  "observation": { en: "Observation", hi: "अवलोकन", kn: "ಅವಲೋಕನ", mr: "निरीक्षण", te: "పరిశీలన", ta: "கவனிப்பு" },
  "language": { en: "Language", hi: "भाषा", kn: "ಭಾಷೆ", mr: "भाषा", te: "భాష", ta: "மொழி" },
  "level": { en: "Level", hi: "स्तर", kn: "ಮಟ್ಟ", mr: "स्तर", te: "స్థాయి", ta: "நிலை" },
  "xp_to_next": { en: "XP to next level", hi: "अगले स्तर तक XP", kn: "ಮುಂದಿನ ಮಟ್ಟಕ್ಕೆ XP", mr: "पुढील स्तरासाठी XP", te: "తదుపరి స్థాయికి XP", ta: "அடுத்த நிலைக்கு XP" },
  "days": { en: "days", hi: "दिन", kn: "ದಿನಗಳು", mr: "दिवस", te: "రోజులు", ta: "நாட்கள்" },
  "lessons": { en: "lessons", hi: "पाठ", kn: "ಪಾಠಗಳು", mr: "धडे", te: "పాఠాలు", ta: "பாடங்கள்" },
  "goal_selection": { en: "Choose Your Goal", hi: "अपना लक्ष्य चुनें", kn: "ನಿಮ್ಮ ಗುರಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ", mr: "तुमचे ध्येय निवडा", te: "మీ లక్ష్యాన్ని ఎంచుకోండి", ta: "உங்கள் இலக்கை தேர்வு செய்யுங்கள்" },
  "back": { en: "Back", hi: "वापस", kn: "ಹಿಂದೆ", mr: "मागे", te: "వెనుకకు", ta: "பின்" },
  "skills_required": { en: "Skills Required", hi: "आवश्यक कौशल", kn: "ಅಗತ್ಯ ಕೌಶಲ್ಯಗಳು", mr: "आवश्यक कौशल्ये", te: "అవసరమైన నైపుణ్యాలు", ta: "தேவையான திறன்கள்" },
  "career_options": { en: "Career Options", hi: "करियर विकल्प", kn: "ವೃತ್ತಿ ಆಯ್ಕೆಗಳು", mr: "करिअर पर्याय", te: "కెరీర్ ఆప్షన్లు", ta: "தொழில் வாய்ப்புகள்" },
  "video_library": { en: "Video Library", hi: "वीडियो लाइब्रेरी", kn: "ವೀಡಿಯೊ ಗ್ರಂಥಾಲಯ", mr: "व्हिडिओ लायब्ररी", te: "వీడియో లైబ్రరీ", ta: "வீடியோ நூலகம்" },
  "ask_anything": { en: "Ask me anything...", hi: "मुझसे कुछ भी पूछें...", kn: "ನನ್ನನ್ನು ಏನಾದರೂ ಕೇಳಿ...", mr: "मला काहीही विचारा...", te: "నన్ను ఏదైనా అడగండి...", ta: "என்னிடம் எதையும் கேளுங்கள்..." },
  "complete_tasks": { en: "Complete tasks to earn XP and level up!", hi: "XP कमाने और लेवल अप करने के लिए कार्य पूरे करें!", kn: "XP ಗಳಿಸಲು ಮತ್ತು ಲೆವೆಲ್ ಅಪ್ ಮಾಡಲು ಕಾರ್ಯಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ!", mr: "XP मिळवण्यासाठी आणि लेव्हल अप करण्यासाठी कार्ये पूर्ण करा!", te: "XP సంపాదించడానికి మరియు లెవల్ అప్ చేయడానికి పనులను పూర్తి చేయండి!", ta: "XP சம்பாதிக்கவும் லெவல் அப் செய்யவும் பணிகளை முடிக்கவும்!" },
  "quiz_complete": { en: "Quiz Complete!", hi: "क्विज़ पूरा!", kn: "ಕ್ವಿಜ್ ಪೂರ್ಣ!", mr: "क्विझ पूर्ण!", te: "క్విజ్ పూర్తి!", ta: "வினாடி வினா முடிந்தது!" },
  "back_to_quizzes": { en: "Back to Quizzes", hi: "क्विज़ पर वापस", kn: "ಕ್ವಿಜ್‌ಗಳಿಗೆ ಹಿಂದೆ", mr: "क्विझवर परत", te: "క్విజ్‌లకు తిరిగి", ta: "வினாடி வினாவிற்கு திரும்பு" },
  "next_question": { en: "Next Question", hi: "अगला प्रश्न", kn: "ಮುಂದಿನ ಪ್ರಶ್ನೆ", mr: "पुढील प्रश्न", te: "తదుపరి ప్రశ్న", ta: "அடுத்த கேள்வி" },
  "see_results": { en: "See Results", hi: "परिणाम देखें", kn: "ಫಲಿತಾಂಶ ನೋಡಿ", mr: "निकाल पहा", te: "ఫలితాలు చూడండి", ta: "முடிவுகளைப் பார்" },
  "play_games": { en: "Play Games", hi: "खेल खेलें", kn: "ಆಟ ಆಡಿ", mr: "खेळ खेळा", te: "ఆటలు ఆడండి", ta: "விளையாட்டு விளையாடு" },
};

const languageNames: Record<Language, string> = {
  en: "English",
  hi: "हिंदी",
  kn: "ಕನ್ನಡ",
  mr: "मराठी",
  te: "తెలుగు",
  ta: "தமிழ்",
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  languageNames: Record<Language, string>;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem("eduapp-lang") as Language) || "en";
  });

  useEffect(() => {
    localStorage.setItem("eduapp-lang", language);
  }, [language]);

  const setLanguage = (lang: Language) => setLanguageState(lang);

  const t = (key: string): string => {
    return translations[key]?.[language] || translations[key]?.en || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languageNames }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
