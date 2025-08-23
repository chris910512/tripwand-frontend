// 다국어 텍스트 데이터
export const translations = {
    ko: {
        // 네비게이션
        nav: {
            planner: "여행 일정 추천",
            chat: "채팅방",
            profile: "내 프로필",
            login: "로그인",
            user: "사용자님"
        },
        // 메인 페이지
        main: {
            title: "TripWand - AI 여행 계획 생성기",
            description: "몇 분 만에 맞춤형 여행 일정을 생성하세요",
            betaNotice: "개발 중인 서비스로 예고 없이 변경되거나 종료될 수 있습니다"
        },
        // 폼 라벨
        form: {
            destination: "여행지",
            destinationPlaceholder: "도시명을 검색하세요...",
            duration: "여행 기간 (일)",
            ageGroup: "연령대",
            groupSize: "인원 수",
            purpose: "여행 목적",
            travelType: "여행 타입",
            selectOption: "선택하세요",
            generatePlan: "여행 계획 생성하기",
            generating: "여행 계획 생성 중...",
            generatingTitle: "여행 계획 생성 중",
            inputTravel: "여행 정보 입력",
            optionalInfo: "선택 정보"
        },
        // 결과 페이지
        result: {
            title: "여행 일정 추천",
            dayLabel: "Day",
            estimatedCost: "약 {}만원",
            morning: "오전 (09:00 - 12:00)",
            afternoon: "오후 (12:00 - 17:00)",
            evening: "저녁 (17:00 - 21:00)",
            night: "밤 (21:00 - 23:00)",
            cautions: "주의사항",
            placeholder: "왼쪽에서 여행 정보를 입력하고\\n계획 생성 버튼을 클릭해주세요"
        },
        // 드롭다운 옵션들
        options: {
            ageGroups: {
                "10-20대": "10-20대",
                "20-30대": "20-30대", 
                "30-40대": "30-40대",
                "40-50대": "40-50대",
                "50대 이상": "50대 이상"
            },
            purposes: {
                "휴양/힐링": "휴양/힐링",
                "문화/역사 탐방": "문화/역사 탐방",
                "미식 투어": "미식 투어",
                "쇼핑": "쇼핑",
                "비즈니스": "비즈니스",
                "액티비티/모험": "액티비티/모험",
                "허니문": "허니문"
            },
            types: {
                "자유여행": "자유여행",
                "패키지여행": "패키지여행",
                "배낭여행": "배낭여행",
                "럭셔리 투어": "럭셔리 투어",
                "가족여행": "가족여행",
                "단체여행": "단체여행"
            }
        },
        // Footer
        footer: {
            description: "AI 기반 맞춤형 여행 계획 생성 서비스",
            contact: "연락처",
            feedback: "피드백 보내기",
            service: "서비스 정보",
            version: "베타 버전",
            rights: "모든 권리 보유",
            poweredBy: "SvelteKit으로 제작"
        },
        // 기타
        common: {
            loading: "잠시만 기다려주세요...",
            error: "오류가 발생했습니다",
            developingService: "현재 개발중인 서비스로 지금은 여행 일정 추천만 사용 가능합니다.",
            requiredFields: "필수 정보를 입력해주세요.",
            serverError: "서버 연결에 문제가 있습니다.",
            planGenerationFailed: "여행 계획 생성에 실패했습니다."
        }
    },
    en: {
        // Navigation
        nav: {
            planner: "Trip Planner",
            chat: "Chat Room", 
            profile: "My Profile",
            login: "Login",
            user: "User"
        },
        // Main page
        main: {
            title: "TripWand - AI Travel Planner",
            description: "Generate personalized travel itineraries in minutes",
            betaNotice: "This service is under development"
        },
        // Form labels
        form: {
            destination: "Destination",
            destinationPlaceholder: "Search for a city...",
            duration: "Duration (days)",
            ageGroup: "Age Group",
            groupSize: "Group Size",
            purpose: "Travel Purpose",
            travelType: "Travel Type",
            selectOption: "Select an option",
            generatePlan: "Generate Travel Plan",
            generating: "Generating travel plan...",
            generatingTitle: "Generating Travel Plan",
            inputTravel: "Travel Information",
            optionalInfo: "Optional Information"
        },
        // Result page
        result: {
            title: "Travel Itinerary",
            dayLabel: "Day",
            estimatedCost: "Approx ${}",
            morning: "Morning (09:00 - 12:00)",
            afternoon: "Afternoon (12:00 - 17:00)",
            evening: "Evening (17:00 - 21:00)",
            night: "Night (21:00 - 23:00)",
            cautions: "Important Notes",
            placeholder: "Enter travel information on the left\\nand click the generate plan button"
        },
        // 드롭다운 옵션들
        options: {
            ageGroups: {
                "10-20대": "Teens",
                "20-30대": "20s-30s", 
                "30-40대": "30s-40s",
                "40-50대": "40s-50s",
                "50대 이상": "50s+"
            },
            purposes: {
                "휴양/힐링": "Relaxation/Healing",
                "문화/역사 탐방": "Culture/History",
                "미식 투어": "Food Tour",
                "쇼핑": "Shopping",
                "비즈니스": "Business",
                "액티비티/모험": "Adventure/Activity",
                "허니문": "Honeymoon"
            },
            types: {
                "자유여행": "Independent Travel",
                "패키지여행": "Package Tour",
                "배낭여행": "Backpacking",
                "럭셔리 투어": "Luxury Tour",
                "가족여행": "Family Trip",
                "단체여행": "Group Travel"
            }
        },
        // Footer
        footer: {
            description: "AI-powered personalized travel planning service",
            contact: "Contact",
            feedback: "Send Feedback",
            service: "Service Info",
            version: "Beta Version",
            rights: "All rights reserved",
            poweredBy: "Built with SvelteKit"
        },
        // Common
        common: {
            loading: "Please wait...",
            error: "An error occurred",
            developingService: "This service is currently under development. Only travel planning is available now.",
            requiredFields: "Please fill in the required fields.",
            serverError: "There is a problem with the server connection.",
            planGenerationFailed: "Failed to generate travel plan."
        }
    }
};

// 언어 감지 함수
export function detectLanguage() {
    if (typeof window === 'undefined') return 'ko'; // SSR 기본값
    
    // 저장된 언어 설정 확인
    const saved = localStorage.getItem('tripwand-language');
    if (saved && ['ko', 'en'].includes(saved)) {
        return saved;
    }
    
    // 브라우저 언어 감지
    const browserLang = navigator.language || navigator.languages?.[0] || 'en';
    
    // 한국어 관련 언어 코드 확인
    if (browserLang.startsWith('ko')) {
        return 'ko';
    }
    
    // 기본값은 영어
    return 'en';
}

// 번역 함수
export function t(key, lang, params = {}) {
    const keys = key.split('.');
    let value = translations[lang];
    
    for (const k of keys) {
        value = value?.[k];
    }
    
    if (!value) {
        console.warn(`Translation missing: ${key} for language: ${lang}`);
        return key;
    }
    
    // 매개변수 치환
    let result = value;
    Object.entries(params).forEach(([param, val]) => {
        result = result.replace(`{${param}}`, val);
    });
    
    return result;
}

// 언어 저장
export function saveLanguage(lang) {
    if (typeof window !== 'undefined') {
        localStorage.setItem('tripwand-language', lang);
    }
}