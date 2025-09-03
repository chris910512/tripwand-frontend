import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
    const lang = url.searchParams.get('lang') || 'ko';
    const isEnglish = lang === 'en';
    
    return {
        meta: {
            title: isEnglish 
                ? 'TripWand - AI Travel Planner | Personalized Itinerary Generator'
                : 'TripWand - AI 여행 계획 생성기 | 맞춤형 여행 일정 추천',
            description: isEnglish
                ? 'Generate perfect travel plans in minutes! Enter your destination, duration, and preferences, and our AI will recommend optimal travel itineraries. Plan extraordinary trips with personalized travel guides.'
                : '몇 분 만에 완벽한 여행 계획을 생성하세요! 목적지, 기간, 예산을 입력하면 AI가 최적의 여행 일정을 추천해드립니다. 개인 맞춤형 여행 가이드로 특별한 여행을 계획하세요.',
            keywords: isEnglish
                ? 'travel planning, travel itinerary, travel recommendations, AI travel, personalized travel, travel guide, travel route, domestic travel, international travel, trip planner'
                : '여행계획, 여행일정, 여행추천, AI여행, 맞춤여행, 여행가이드, 여행루트, 국내여행, 해외여행',
            canonical: 'https://tripwand.online',
            image: 'https://tripwand.online/og-image.png',
            type: 'website',
            language: lang
        }
    };
};