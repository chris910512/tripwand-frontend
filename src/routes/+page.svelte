<!-- +page.svelte -->
<script>
    import { MapPin, Calendar, Users, Target, Compass, User, LogIn, ChevronRight, Clock, DollarSign, AlertCircle, Search, MessageSquare, UserCircle, Lock, Globe } from 'lucide-svelte';
    import favicon from '$lib/assets/favicon.svg';
    import { detectLanguage, t, saveLanguage } from '$lib/i18n.js';
    
    let { data } = $props();

    // State variables using Svelte 5 runes
    let isLoggedIn = $state(false);
    let activeTab = $state('planner');
    let citySearch = $state('');
    let cities = $state([]);
    let showCityDropdown = $state(false);
    let purposes = $state([]);
    let types = $state([]);
    let loading = $state(false);
    let travelPlan = $state(null);
    let showLoginModal = $state(false);
    let searchTimer = null;
    
    // 언어 상태
    let currentLanguage = $state('ko');
    let showLangDropdown = $state(false);

    let formData = $state({
        destination: '',
        duration: 3,
        ageGroup: '20-30대',
        groupSize: 1,
        purpose: '',
        travelType: ''
    });

    const ageGroups = ['10-20대', '20-30대', '30-40대', '40-50대', '50대 이상'];

    // API URL 설정
    const getApiUrl = () => {
        if (typeof window !== 'undefined') {
            return window.location.hostname === 'localhost' 
                ? 'http://localhost:8080'
                : 'https://api.tripwand.online';
        }
        return 'https://api.tripwand.online'; // SSR fallback
    };

    // API 인터페이스
    const API = {
        searchCities: async (query) => {
            const mockCities = [
                { id: 1, name: '서울', country: '대한민국' },
                { id: 2, name: '도쿄', country: '일본' },
                { id: 3, name: '파리', country: '프랑스' },
                { id: 4, name: '뉴욕', country: '미국' },
                { id: 5, name: '런던', country: '영국' },
                { id: 6, name: '바르셀로나', country: '스페인' },
                { id: 7, name: '로마', country: '이탈리아' },
                { id: 8, name: '시드니', country: '호주' }
            ];
            return mockCities.filter(city =>
                city.name.toLowerCase().includes(query.toLowerCase()) ||
                city.country.toLowerCase().includes(query.toLowerCase())
            );
        },

        getTravelPurposes: async () => {
            return [
                { id: 1, name: '휴양/힐링' },
                { id: 2, name: '문화/역사 탐방' },
                { id: 3, name: '미식 투어' },
                { id: 4, name: '쇼핑' },
                { id: 5, name: '비즈니스' },
                { id: 6, name: '액티비티/모험' },
                { id: 7, name: '허니문' }
            ];
        },

        getTravelTypes: async () => {
            return [
                { id: 1, name: '자유여행' },
                { id: 2, name: '패키지여행' },
                { id: 3, name: '배낭여행' },
                { id: 4, name: '럭셔리 투어' },
                { id: 5, name: '가족여행' },
                { id: 6, name: '단체여행' }
            ];
        },

        generateTravelPlan: async (params) => {
            const response = await fetch(`${getApiUrl()}/api/v1/travel/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    destination: params.destination,
                    duration: params.duration,
                    age_group: params.ageGroup,
                    group_size: params.groupSize,
                    purpose: params.purpose,
                    travel_type: params.travelType
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error('Failed to generate travel plan');
            }

            return result.data;
        }
    };

    // Lifecycle
    $effect(() => {
        currentLanguage = detectLanguage();
        loadData();
    });

    // Search cities with debounce
    $effect(() => {
        if (searchTimer) clearTimeout(searchTimer);

        searchTimer = setTimeout(async () => {
            if (citySearch) {
                const results = await API.searchCities(citySearch);
                cities = results;
                showCityDropdown = true;
                
                // 직접 입력된 경우에도 destination 업데이트
                formData.destination = citySearch;
            } else {
                cities = [];
                showCityDropdown = false;
                formData.destination = '';
            }
        }, 300);
    });

    async function loadData() {
        const [purposeData, typeData] = await Promise.all([
            API.getTravelPurposes(),
            API.getTravelTypes()
        ]);
        purposes = purposeData;
        types = typeData;
    }

    function handleCitySelect(city) {
        formData.destination = `${city.name}, ${city.country}`;
        citySearch = `${city.name}, ${city.country}`;
        showCityDropdown = false;
    }

    async function handleGeneratePlan() {
        // 목적지와 기간 검증
        const destination = formData.destination || citySearch;
        if (!destination.trim() || !formData.duration) {
            alert('필수 정보를 입력해주세요.');
            return;
        }
        
        // destination 동기화
        formData.destination = destination;

        loading = true;
        try {
            const plan = await API.generateTravelPlan(formData);
            travelPlan = plan;
        } catch (error) {
            console.error('Failed to generate plan:', error);
            let errorMessage = '여행 계획 생성에 실패했습니다.';
            
            if (error.message.includes('API Error')) {
                errorMessage += ' 서버 연결에 문제가 있습니다.';
            }
            
            alert(errorMessage);
        } finally {
            loading = false;
        }
    }

    function handleTabClick(tab) {
        if (tab === 'chat' || tab === 'profile') {
            alert('현재 개발중인 서비스로 지금은 여행 일정 추천만 사용 가능합니다.');
            return;
        }
        activeTab = tab;
    }

    function handleLogin() {
        alert(t('common.developingService', currentLanguage));
        showLoginModal = false;
    }
    
    function handleLanguageChange(lang) {
        currentLanguage = lang;
        saveLanguage(lang);
        showLangDropdown = false;
        
        // HTML lang 속성 업데이트
        if (typeof document !== 'undefined') {
            document.documentElement.lang = lang;
        }
    }
    
    function handleTabClick(tab) {
        if (tab === 'chat' || tab === 'profile') {
            alert(t('common.developingService', currentLanguage));
            return;
        }
        activeTab = tab;
    }
</script>

<svelte:head>
    <title>{data.meta.title}</title>
    <meta name="description" content={data.meta.description} />
    <meta name="keywords" content={data.meta.keywords} />
    <link rel="canonical" href={data.meta.canonical} />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content={data.meta.type} />
    <meta property="og:url" content={data.meta.canonical} />
    <meta property="og:title" content={data.meta.title} />
    <meta property="og:description" content={data.meta.description} />
    <meta property="og:image" content={data.meta.image} />
    <meta property="og:locale" content="ko_KR" />
    <meta property="og:site_name" content="TripWand" />
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content={data.meta.canonical} />
    <meta property="twitter:title" content={data.meta.title} />
    <meta property="twitter:description" content={data.meta.description} />
    <meta property="twitter:image" content={data.meta.image} />
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "TripWand",
        "description": "AI 기반 맞춤형 여행 계획 생성 서비스",
        "url": "https://tripwand.online",
        "applicationCategory": "TravelApplication",
        "operatingSystem": "웹 브라우저",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "KRW"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "150"
        },
        "creator": {
            "@type": "Organization",
            "name": "TripWand",
            "url": "https://tripwand.online"
        }
    }
    </script>
    
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "TravelAgency",
        "name": "TripWand",
        "description": "AI 기반 맞춤형 여행 계획 생성 서비스",
        "url": "https://tripwand.online",
        "areaServed": {
            "@type": "Country",
            "name": "대한민국"
        },
        "serviceType": "여행 계획 수립",
        "priceRange": "무료"
    }
    </script>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50 overscroll-none">
<style>
  body { 
    overscroll-behavior: none; 
    overflow-x: hidden;
  }
  html {
    overflow-x: hidden;
  }
</style>
    <!-- Navigation -->
    <nav class="bg-white/90 backdrop-blur-md shadow-sm fixed top-0 left-0 right-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <div class="flex items-center space-x-8">
                    <a href="https://tripwand.online" class="flex items-center space-x-3 group">
                        <img src={favicon} alt="TripWand 로고" class="w-8 h-8 transition-transform group-hover:scale-110" />
                        <div class="flex items-center space-x-2">
                            <h1 class="text-2xl font-bold bg-gradient-to-r from-rose-600 to-orange-500 bg-clip-text text-transparent group-hover:from-rose-700 group-hover:to-orange-600 transition-all">
                                TripWand
                            </h1>
                            <span class="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium">
                  Beta
                </span>
                            <span class="hidden lg:inline text-xs text-gray-500">
                  개발 중인 서비스로 예고 없이 변경되거나 종료될 수 있습니다
                </span>
                        </div>
                    </a>
                    <div class="hidden md:flex space-x-1">
                        <button
                                onclick={() => handleTabClick('planner')}
                                class="px-4 py-2 rounded-lg transition-all flex items-center space-x-2 {activeTab === 'planner'
                ? 'bg-gradient-to-r from-rose-100 to-orange-100 text-rose-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'}"
                        >
                            <MapPin class="w-4 h-4" />
                            <span>{t('nav.planner', currentLanguage)}</span>
                        </button>
                        <button
                                onclick={() => handleTabClick('chat')}
                                class="px-4 py-2 rounded-lg transition-all flex items-center space-x-2 {activeTab === 'chat'
                ? 'bg-gradient-to-r from-rose-100 to-orange-100 text-rose-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'}"
                        >
                            <MessageSquare class="w-4 h-4" />
                            <span>{t('nav.chat', currentLanguage)}</span>
                            {#if !isLoggedIn}<Lock class="w-3 h-3" />{/if}
                        </button>
                        <button
                                onclick={() => handleTabClick('profile')}
                                class="px-4 py-2 rounded-lg transition-all flex items-center space-x-2 {activeTab === 'profile'
                ? 'bg-gradient-to-r from-rose-100 to-orange-100 text-rose-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'}"
                        >
                            <UserCircle class="w-4 h-4" />
                            <span>{t('nav.profile', currentLanguage)}</span>
                            {#if !isLoggedIn}<Lock class="w-3 h-3" />{/if}
                        </button>
                    </div>
                </div>

                <!-- Language & Login -->
                <div class="flex items-center space-x-3">
                    <!-- Language Switcher -->
                    <div class="relative">
                        <button
                                onclick={() => showLangDropdown = !showLangDropdown}
                                class="flex items-center space-x-1 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
                        >
                            <Globe class="w-4 h-4" />
                            <span class="text-sm font-medium">{currentLanguage.toUpperCase()}</span>
                        </button>
                        
                        {#if showLangDropdown}
                            <div class="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                <button
                                        onclick={() => handleLanguageChange('ko')}
                                        class="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center space-x-2 {currentLanguage === 'ko' ? 'bg-rose-50 text-rose-700' : 'text-gray-700'}"
                                >
                                    <span>🇰🇷</span>
                                    <span class="text-sm">한국어</span>
                                </button>
                                <button
                                        onclick={() => handleLanguageChange('en')}
                                        class="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center space-x-2 {currentLanguage === 'en' ? 'bg-rose-50 text-rose-700' : 'text-gray-700'}"
                                >
                                    <span>🇺🇸</span>
                                    <span class="text-sm">English</span>
                                </button>
                            </div>
                        {/if}
                    </div>
                    
                    <!-- Login Status -->
                    <div class="flex items-center">
                        {#if isLoggedIn}
                            <div class="flex items-center space-x-3 px-4 py-2 rounded-lg bg-gradient-to-r from-rose-50 to-orange-50">
                                <User class="w-5 h-5 text-rose-600" />
                                <span class="text-sm font-medium">{t('nav.user', currentLanguage)}</span>
                            </div>
                        {:else}
                            <button
                                    onclick={handleLogin}
                                    class="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-rose-600 to-orange-500 text-white hover:from-rose-700 hover:to-orange-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                            >
                                <LogIn class="w-4 h-4" />
                                <span>{t('nav.login', currentLanguage)}</span>
                            </button>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    </nav>

    <!-- Login Modal -->
    {#if showLoginModal}
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                <div class="text-center mb-6">
                    <div class="w-16 h-16 bg-gradient-to-br from-rose-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock class="w-8 h-8 text-rose-600" />
                    </div>
                    <h3 class="text-xl font-bold text-gray-800">로그인이 필요합니다</h3>
                    <p class="text-gray-600 mt-2">이 기능을 사용하려면 로그인해주세요</p>
                </div>
                <button
                        onclick={handleLogin}
                        class="w-full py-3 bg-gradient-to-r from-rose-600 to-orange-500 text-white font-medium rounded-lg hover:from-rose-700 hover:to-orange-600 transition-all"
                >
                    구글로 로그인
                </button>
                <button
                        onclick={() => showLoginModal = false}
                        class="w-full py-3 mt-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all"
                >
                    취소
                </button>
            </div>
        </div>
    {/if}

    <!-- Loading Overlay -->
    {#if loading}
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div class="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center">
                <div class="w-20 h-20 bg-gradient-to-br from-rose-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <div class="animate-spin rounded-full h-10 w-10 border-4 border-rose-200 border-t-rose-600"></div>
                </div>
                <h3 class="text-xl font-bold text-gray-800 mb-2">여행 계획 생성 중</h3>
                <p class="text-gray-600">잠시만 기다려주세요...</p>
                <div class="mt-4 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div class="bg-gradient-to-r from-rose-500 to-orange-500 h-full rounded-full animate-pulse"></div>
                </div>
            </div>
        </div>
    {/if}

    <!-- Main Content -->
    {#if activeTab === 'planner'}
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-4" style="height: calc(100vh - 5rem);" class:pointer-events-none={loading} class:opacity-75={loading}>
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full">
                <!-- Left Panel - Input Form -->
                <div class="bg-white rounded-2xl shadow-lg p-4 h-full flex flex-col overflow-visible">
                    <h2 class="text-lg font-bold text-gray-800 mb-3 flex items-center flex-shrink-0">
                        <MapPin class="w-5 h-5 mr-2 text-rose-600" />
                        {t('form.inputTravel', currentLanguage)}
                    </h2>

                    <div class="space-y-3 flex-1 overflow-y-auto pr-1 pl-1">
                        <!-- 여행지 -->
                        <div class="flex-shrink-0">
                            <label for="city-search" class="block text-sm font-medium text-gray-700 mb-2">
                                {t('form.destination', currentLanguage)} *
                            </label>
                            <div class="relative">
                                <input
                                        id="city-search"
                                        type="text"
                                        bind:value={citySearch}
                                        placeholder={t('form.destinationPlaceholder', currentLanguage)}
                                        class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent focus:ring-offset-2 transition-all"
                                />
                                <Search class="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />

                                {#if showCityDropdown && cities.length > 0}
                                    <div class="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                                        {#each cities as city}
                                            <button
                                                    onclick={() => handleCitySelect(city)}
                                                    class="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-rose-50 hover:to-orange-50 transition-colors"
                                            >
                                                <div class="font-medium">{city.name}</div>
                                                <div class="text-sm text-gray-500">{city.country}</div>
                                            </button>
                                        {/each}
                                    </div>
                                {/if}
                            </div>
                        </div>

                        <!-- 여행 기간 -->
                        <div class="flex-shrink-0">
                            <label for="duration" class="block text-sm font-medium text-gray-700 mb-2">
                                {t('form.duration', currentLanguage)} *
                            </label>
                            <input
                                    id="duration"
                                    type="number"
                                    min="1"
                                    max="30"
                                    bind:value={formData.duration}
                                    class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent focus:ring-offset-2 transition-all"
                            />
                        </div>

                        <!-- 선택 정보 -->
                        <div class="pt-2 border-t border-gray-100 flex-shrink-0">
                            <h3 class="text-sm font-semibold text-gray-600 mb-2">선택 정보</h3>

                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label for="age-group" class="block text-xs font-medium text-gray-700 mb-1">연령대</label>
                                    <select
                                            id="age-group"
                                            bind:value={formData.ageGroup}
                                            class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:border-transparent text-sm transition-all"
                                    >
                                        {#each ageGroups as age}
                                            <option value={age}>{age}</option>
                                        {/each}
                                    </select>
                                </div>

                                <div>
                                    <label for="group-size" class="block text-xs font-medium text-gray-700 mb-1">인원 수</label>
                                    <input
                                            id="group-size"
                                            type="number"
                                            min="1"
                                            max="20"
                                            bind:value={formData.groupSize}
                                            class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:border-transparent text-sm transition-all"
                                    />
                                </div>
                            </div>

                            <div class="mt-2 space-y-2">
                                <div>
                                    <label for="travel-purpose" class="block text-xs font-medium text-gray-700 mb-1">여행 목적</label>
                                    <select
                                            id="travel-purpose"
                                            bind:value={formData.purpose}
                                            class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:border-transparent text-sm transition-all"
                                    >
                                        <option value="">선택하세요</option>
                                        {#each purposes as purpose}
                                            <option value={purpose.name}>{purpose.name}</option>
                                        {/each}
                                    </select>
                                </div>

                                <div>
                                    <label for="travel-type" class="block text-xs font-medium text-gray-700 mb-1">여행 타입</label>
                                    <select
                                            id="travel-type"
                                            bind:value={formData.travelType}
                                            class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:border-transparent text-sm transition-all"
                                    >
                                        <option value="">선택하세요</option>
                                        {#each types as type}
                                            <option value={type.name}>{type.name}</option>
                                        {/each}
                                    </select>
                                </div>
                            </div>
                        </div>

                    </div>
                    
                    <div class="flex-shrink-0 pt-3 border-t border-gray-100">
                        <button
                                onclick={handleGeneratePlan}
                                disabled={loading}
                                class="w-full py-2.5 bg-gradient-to-r from-rose-600 to-orange-500 text-white font-medium rounded-lg hover:from-rose-700 hover:to-orange-600 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg relative"
                        >
                            {#if loading}
                                <div class="flex items-center">
                                    <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    여행 계획 생성 중...
                                </div>
                            {:else}
                                <Compass class="w-5 h-5 mr-2" />
                                여행 계획 생성하기
                            {/if}
                        </button>
                    </div>
                </div>

                <!-- Right Panel - Output -->
                <div class="bg-white rounded-2xl shadow-lg p-5 h-full flex flex-col">
                    <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center flex-shrink-0">
                        <Calendar class="w-5 h-5 mr-2 text-orange-600" />
                        여행 일정 추천
                    </h2>

                    <div class="flex-1 overflow-hidden">
                    {#if travelPlan}
                        <div class="space-y-3 h-full">
                            <!-- Overview -->
                            <div class="bg-gradient-to-r from-rose-50 to-orange-50 rounded-lg p-4">
                                <h3 class="font-semibold text-gray-800 mb-2">{formData.destination}</h3>
                                <div class="grid grid-cols-2 gap-2 text-sm">
                                    <div class="flex items-center text-gray-600">
                                        <Calendar class="w-4 h-4 mr-1 text-rose-500" />
                                        {formData.duration}일 여행
                                    </div>
                                    <div class="flex items-center text-gray-600">
                                        <DollarSign class="w-4 h-4 mr-1 text-orange-500" />
                                        약 {Math.round(travelPlan.estimated_cost / 10000)}만원
                                    </div>
                                </div>
                            </div>

                            <!-- Daily Schedule -->
                            <div class="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                {#each travelPlan.itinerary as dayPlan}
                                    <div class="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <h4 class="font-semibold text-gray-800 mb-3 flex items-center">
                      <span class="w-8 h-8 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-full flex items-center justify-center text-sm mr-2">
                        {dayPlan.day}
                      </span>
                                            Day {dayPlan.day}
                                        </h4>

                                        <div class="space-y-3">
                                            <!-- Morning -->
                                            <div class="pl-4 border-l-2 border-orange-200 hover:border-rose-400 transition-colors">
                                                <div class="flex items-center text-sm text-gray-500 mb-1">
                                                    <Clock class="w-3 h-3 mr-1" />
                                                    오전 (09:00 - 12:00)
                                                </div>
                                                <div class="font-medium text-gray-700">{dayPlan.morning.summary}</div>
                                                <div class="text-sm text-gray-600 mt-1">{dayPlan.morning.detail}</div>
                                            </div>

                                            <!-- Afternoon -->
                                            <div class="pl-4 border-l-2 border-orange-200 hover:border-rose-400 transition-colors">
                                                <div class="flex items-center text-sm text-gray-500 mb-1">
                                                    <Clock class="w-3 h-3 mr-1" />
                                                    오후 (12:00 - 17:00)
                                                </div>
                                                <div class="font-medium text-gray-700">{dayPlan.afternoon.summary}</div>
                                                <div class="text-sm text-gray-600 mt-1">{dayPlan.afternoon.detail}</div>
                                            </div>

                                            <!-- Evening -->
                                            <div class="pl-4 border-l-2 border-orange-200 hover:border-rose-400 transition-colors">
                                                <div class="flex items-center text-sm text-gray-500 mb-1">
                                                    <Clock class="w-3 h-3 mr-1" />
                                                    저녁 (17:00 - 21:00)
                                                </div>
                                                <div class="font-medium text-gray-700">{dayPlan.evening.summary}</div>
                                                <div class="text-sm text-gray-600 mt-1">{dayPlan.evening.detail}</div>
                                            </div>

                                            <!-- Night -->
                                            <div class="pl-4 border-l-2 border-orange-200 hover:border-rose-400 transition-colors">
                                                <div class="flex items-center text-sm text-gray-500 mb-1">
                                                    <Clock class="w-3 h-3 mr-1" />
                                                    밤 (21:00 - 23:00)
                                                </div>
                                                <div class="font-medium text-gray-700">{dayPlan.night.summary}</div>
                                                <div class="text-sm text-gray-600 mt-1">{dayPlan.night.detail}</div>
                                            </div>
                                        </div>
                                    </div>
                                {/each}
                            </div>

                            <!-- Cautions -->
                            {#if travelPlan.cautions && travelPlan.cautions.length > 0}
                                <div class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4">
                                    <div class="flex items-start">
                                        <AlertCircle class="w-5 h-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h4 class="font-medium text-amber-900 mb-2">주의사항</h4>
                                            <ul class="text-sm text-amber-800 space-y-1">
                                                {#each travelPlan.cautions as caution}
                                                    <li>• {caution}</li>
                                                {/each}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            {/if}
                        </div>
                    {:else}
                        <div class="flex flex-col items-center justify-center h-full text-gray-400">
                            <div class="w-24 h-24 bg-gradient-to-br from-rose-100 to-orange-100 rounded-full flex items-center justify-center mb-4">
                                <MapPin class="w-12 h-12 text-rose-400" />
                            </div>
                            <p class="text-center text-gray-600">
                                왼쪽에서 여행 정보를 입력하고<br />
                                계획 생성 버튼을 클릭해주세요
                            </p>
                        </div>
                    {/if}
                    </div>
                </div>
            </div>
        </div>
    {/if}

    {#if activeTab === 'chat' && isLoggedIn}
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div class="bg-white rounded-2xl shadow-lg p-12 text-center">
                <MessageSquare class="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 class="text-2xl font-bold text-gray-800 mb-2">채팅방</h2>
                <p class="text-gray-600">이 기능은 준비 중입니다</p>
            </div>
        </div>
    {/if}

    {#if activeTab === 'profile' && isLoggedIn}
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div class="bg-white rounded-2xl shadow-lg p-12 text-center">
                <UserCircle class="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 class="text-2xl font-bold text-gray-800 mb-2">내 프로필</h2>
                <p class="text-gray-600">이 기능은 준비 중입니다</p>
            </div>
        </div>
    {/if}
</div>