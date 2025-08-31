// Google Places API 서비스 (백엔드 프록시 방식)
import { browser } from '$app/environment';

// 백엔드 API 설정
const getApiUrl = () => {
    if (typeof window !== 'undefined') {
        return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:8080'
            : 'https://api.tripwand.online';
    }
    return 'https://api.tripwand.online'; // SSR fallback
};

/**
 * 도시 자동완성 검색
 * @param {string} input - 검색어
 * @param {string} [language='ko'] - 언어 코드 (ko, en)
 * @returns {Promise<Array<Object>>} 도시 목록
 */
export async function searchCities(input, language = 'ko') {
    console.log('🔍 searchCities 호출됨 (백엔드 프록시 방식):', { input, language, browser });
    
    if (!browser || !input || input.trim().length < 2) {
        console.log('🔍 조건 불충족:', { browser, input, length: input?.length });
        return [];
    }

    // 백엔드 API 구현 완료로 실제 API 호출로 변경
    // if (import.meta.env.DEV) {
    //     console.log('🔍 개발 환경: Mock 데이터 사용');
    //     return mockCitySearch(input, language);
    // }

    console.log('🔍 백엔드 프록시를 통해 Places API 호출');

    // 백엔드 프록시를 통해 Places API 호출
    try {
        const apiUrl = getApiUrl();
        console.log('🔍 API URL:', `${apiUrl}/api/v1/places/search`);

        const response = await fetch(`${apiUrl}/api/v1/places/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                input: input.trim(),
                language: language,
                types: 'cities'
            })
        });
        
        if (!response.ok) {
            console.error(`백엔드 API 요청 실패: ${response.status}`);
            return mockCitySearch(input, language);
        }

        const data = await response.json();
        console.log('🔍 백엔드 응답:', data);
        
        if (!data.success) {
            console.warn('백엔드 API 오류:', {
                error: data.error,
                message: data.message,
                data: data.data
            });
            return mockCitySearch(input, language);
        }

        // 백엔드 응답 형식에 맞게 매핑 (명세서에 따른 구조)
        return data.data.predictions?.map(/** @param {any} prediction */ (prediction) => ({
            id: prediction.place_id,
            name: prediction.description,
            structured_formatting: prediction.structured_formatting
        })) || [];

    } catch (error) {
        console.error('백엔드 API 호출 중 오류:', error);
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