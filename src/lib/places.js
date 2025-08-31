// Google Places API 서비스
import { browser } from '$app/environment';

const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || 'AIzaSyANvljab01gOZh-Z0m-14JXkfjxf3kOeWo';
const PLACES_API_BASE = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';

/**
 * 도시 자동완성 검색
 * @param {string} input - 검색어
 * @param {string} [language='ko'] - 언어 코드 (ko, en)
 * @returns {Promise<Array<Object>>} 도시 목록
 */
export async function searchCities(input, language = 'ko') {
    console.log('🔍 searchCities 호출됨:', { input, language, browser });
    
    if (!browser || !input || input.trim().length < 2) {
        console.log('🔍 조건 불충족:', { browser, input, length: input?.length });
        return [];
    }

    // 개발 환경에서도 실제 Places API 테스트해보기 (테스트용)
    // if (import.meta.env.DEV) {
    //     console.log('🔍 Mock 데이터 사용 (DEV 모드)');
    //     return mockCitySearch(input, language);
    // }
    console.log('🔍 실제 Google Places API 호출 시도');

    // 프로덕션 환경에서는 실제 Places API 호출
    try {
        const params = new URLSearchParams({
            input: input.trim(),
            types: '(cities)',
            key: API_KEY,
            language: language === 'ko' ? 'ko' : 'en'
        });

        const response = await fetch(`${PLACES_API_BASE}?${params}`);
        
        if (!response.ok) {
            console.error(`API 요청 실패: ${response.status}`);
            return mockCitySearch(input, language);
        }

        const data = await response.json();
        
        if (data.status !== 'OK') {
            console.warn('Places API 응답 상태:', data.status);
            return [];
        }

        return data.predictions.map(/** @param {any} prediction */ (prediction) => ({
            id: prediction.place_id,
            name: prediction.description,
            structured_formatting: prediction.structured_formatting
        }));

    } catch (error) {
        console.error('도시 검색 중 오류:', error);
        // 오류 시 mock 데이터 반환
        return mockCitySearch(input, language);
    }
}

/**
 * Mock 도시 검색 (개발용)
 * @param {string} input - 검색어
 * @param {string} language - 언어 코드
 * @returns {Array<Object>} 도시 목록
 */
function mockCitySearch(input, language) {
    console.log('🏙️ mockCitySearch 호출:', { input, language });
    
    // 한국어와 영어 데이터를 모두 검색하여 더 나은 결과 제공
    const allCities = [...mockCitiesKo, ...mockCitiesEn];
    const searchTerm = input.toLowerCase();
    
    const results = allCities
        .filter(city => 
            city.name.toLowerCase().includes(searchTerm) ||
            city.country.toLowerCase().includes(searchTerm)
        )
        .slice(0, 5)
        .map(city => ({
            id: `mock_${city.name.replace(/\s+/g, '_')}`,
            name: `${city.name}, ${city.country}`,
            structured_formatting: {
                main_text: city.name,
                secondary_text: city.country
            }
        }));
    
    console.log('🏙️ mockCitySearch 결과:', results);
    return results;
}

// Mock 데이터 - 한국어
const mockCitiesKo = [
    { name: '서울', country: '대한민국' },
    { name: '부산', country: '대한민국' },
    { name: '제주', country: '대한민국' },
    { name: '도쿄', country: '일본' },
    { name: '오사카', country: '일본' },
    { name: '교토', country: '일본' },
    { name: '베이징', country: '중국' },
    { name: '상하이', country: '중국' },
    { name: '홍콩', country: '중국' },
    { name: '타이베이', country: '대만' },
    { name: '방콕', country: '태국' },
    { name: '싱가포르', country: '싱가포르' },
    { name: '쿠알라룸푸르', country: '말레이시아' },
    { name: '호치민', country: '베트남' },
    { name: '하노이', country: '베트남' },
    { name: '마닐라', country: '필리핀' },
    { name: '자카르타', country: '인도네시아' },
    { name: '발리', country: '인도네시아' },
    { name: '뉴욕', country: '미국' },
    { name: '로스앤젤레스', country: '미국' },
    { name: '라스베이거스', country: '미국' },
    { name: '샌프란시스코', country: '미국' },
    { name: '시카고', country: '미국' },
    { name: '런던', country: '영국' },
    { name: '파리', country: '프랑스' },
    { name: '로마', country: '이탈리아' },
    { name: '바르셀로나', country: '스페인' },
    { name: '마드리드', country: '스페인' },
    { name: '암스테르담', country: '네덜란드' },
    { name: '베를린', country: '독일' },
    { name: '뮌헨', country: '독일' },
    { name: '취리히', country: '스위스' },
    { name: '프라하', country: '체코' },
    { name: '빈', country: '오스트리아' },
    { name: '스톡홀름', country: '스웨덴' },
    { name: '코펜하겐', country: '덴마크' },
    { name: '시드니', country: '호주' },
    { name: '멜버른', country: '호주' },
    { name: '두바이', country: '아랍에미리트' }
];

// Mock 데이터 - 영어
const mockCitiesEn = [
    { name: 'Seoul', country: 'South Korea' },
    { name: 'Busan', country: 'South Korea' },
    { name: 'Jeju', country: 'South Korea' },
    { name: 'Tokyo', country: 'Japan' },
    { name: 'Osaka', country: 'Japan' },
    { name: 'Kyoto', country: 'Japan' },
    { name: 'Beijing', country: 'China' },
    { name: 'Shanghai', country: 'China' },
    { name: 'Hong Kong', country: 'China' },
    { name: 'Taipei', country: 'Taiwan' },
    { name: 'Bangkok', country: 'Thailand' },
    { name: 'Singapore', country: 'Singapore' },
    { name: 'Kuala Lumpur', country: 'Malaysia' },
    { name: 'Ho Chi Minh City', country: 'Vietnam' },
    { name: 'Hanoi', country: 'Vietnam' },
    { name: 'Manila', country: 'Philippines' },
    { name: 'Jakarta', country: 'Indonesia' },
    { name: 'Bali', country: 'Indonesia' },
    { name: 'New York', country: 'United States' },
    { name: 'Los Angeles', country: 'United States' },
    { name: 'Las Vegas', country: 'United States' },
    { name: 'San Francisco', country: 'United States' },
    { name: 'Chicago', country: 'United States' },
    { name: 'London', country: 'United Kingdom' },
    { name: 'Paris', country: 'France' },
    { name: 'Rome', country: 'Italy' },
    { name: 'Barcelona', country: 'Spain' },
    { name: 'Madrid', country: 'Spain' },
    { name: 'Amsterdam', country: 'Netherlands' },
    { name: 'Berlin', country: 'Germany' },
    { name: 'Munich', country: 'Germany' },
    { name: 'Zurich', country: 'Switzerland' },
    { name: 'Prague', country: 'Czech Republic' },
    { name: 'Vienna', country: 'Austria' },
    { name: 'Stockholm', country: 'Sweden' },
    { name: 'Copenhagen', country: 'Denmark' },
    { name: 'Sydney', country: 'Australia' },
    { name: 'Melbourne', country: 'Australia' },
    { name: 'Dubai', country: 'United Arab Emirates' }
];