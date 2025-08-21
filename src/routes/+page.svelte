<!-- +page.svelte -->
<script>
    import { MapPin, Calendar, Users, Target, Compass, User, LogIn, ChevronRight, Clock, DollarSign, AlertCircle, Search, MessageSquare, UserCircle, Lock } from 'lucide-svelte';

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

    let formData = $state({
        destination: '',
        duration: 3,
        ageGroup: '20-30대',
        groupSize: 1,
        purpose: '',
        travelType: ''
    });

    const ageGroups = ['10-20대', '20-30대', '30-40대', '40-50대', '50대 이상'];

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
            await new Promise(resolve => setTimeout(resolve, 1500));

            const days = [];
            for (let i = 1; i <= params.duration; i++) {
                days.push({
                    day: i,
                    date: `2025년 1월 ${i}일`,
                    schedule: {
                        morning: {
                            time: '09:00 - 12:00',
                            activity: `Day ${i} 오전 관광지 방문`,
                            description: '유명 관광 명소 탐방 및 사진 촬영',
                            tips: '오전 시간대는 관광객이 적어 여유롭게 관람 가능'
                        },
                        afternoon: {
                            time: '12:00 - 17:00',
                            activity: `Day ${i} 점심 및 오후 활동`,
                            description: '현지 맛집에서 점심 후 쇼핑 또는 체험 활동',
                            tips: '점심 시간대 예약 필수'
                        },
                        evening: {
                            time: '17:00 - 21:00',
                            activity: `Day ${i} 저녁 및 문화 체험`,
                            description: '일몰 명소 방문 후 저녁 식사',
                            tips: '일몰 30분 전 도착 권장'
                        },
                        night: {
                            time: '21:00 - 23:00',
                            activity: `Day ${i} 야간 투어`,
                            description: '야경 명소 또는 나이트 마켓 방문',
                            tips: '늦은 시간 이동 시 택시 이용 권장'
                        }
                    }
                });
            }

            return {
                destination: params.destination,
                duration: params.duration,
                totalBudget: `약 ${params.duration * 150}만원`,
                transportation: '대중교통 + 택시 조합 추천',
                accommodation: '시내 중심가 3-4성급 호텔 추천',
                days: days,
                warnings: [
                    '여권 유효기간 6개월 이상 확인',
                    '여행자 보험 가입 권장',
                    '현지 환율 및 환전 확인'
                ]
            };
        }
    };

    // Lifecycle
    $effect(() => {
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
            } else {
                cities = [];
                showCityDropdown = false;
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
        if (!formData.destination || !formData.duration) {
            alert('필수 정보를 입력해주세요.');
            return;
        }

        loading = true;
        try {
            const plan = await API.generateTravelPlan(formData);
            travelPlan = plan;
        } catch (error) {
            console.error('Failed to generate plan:', error);
            alert('여행 계획 생성에 실패했습니다.');
        } finally {
            loading = false;
        }
    }

    function handleTabClick(tab) {
        if ((tab === 'chat' || tab === 'profile') && !isLoggedIn) {
            showLoginModal = true;
        } else {
            activeTab = tab;
        }
    }

    function handleLogin() {
        isLoggedIn = true;
        showLoginModal = false;
    }
</script>

<div class="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50">
    <!-- Navigation -->
    <nav class="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <div class="flex items-center space-x-8">
                    <div class="flex items-center space-x-2">
                        <h1 class="text-2xl font-bold bg-gradient-to-r from-rose-600 to-orange-500 bg-clip-text text-transparent">
                            TripWand
                        </h1>
                        <span class="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium">
              Beta
            </span>
                        <span class="hidden lg:inline text-xs text-gray-500">
              개발 중인 서비스로 예고 없이 변경되거나 종료될 수 있습니다
            </span>
                    </div>
                    <div class="hidden md:flex space-x-1">
                        <button
                                onclick={() => handleTabClick('planner')}
                                class="px-4 py-2 rounded-lg transition-all flex items-center space-x-2 {activeTab === 'planner'
                ? 'bg-gradient-to-r from-rose-100 to-orange-100 text-rose-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'}"
                        >
                            <MapPin class="w-4 h-4" />
                            <span>여행 일정 추천</span>
                        </button>
                        <button
                                onclick={() => handleTabClick('chat')}
                                class="px-4 py-2 rounded-lg transition-all flex items-center space-x-2 {activeTab === 'chat'
                ? 'bg-gradient-to-r from-rose-100 to-orange-100 text-rose-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'}"
                        >
                            <MessageSquare class="w-4 h-4" />
                            <span>채팅방</span>
                            {#if !isLoggedIn}<Lock class="w-3 h-3" />{/if}
                        </button>
                        <button
                                onclick={() => handleTabClick('profile')}
                                class="px-4 py-2 rounded-lg transition-all flex items-center space-x-2 {activeTab === 'profile'
                ? 'bg-gradient-to-r from-rose-100 to-orange-100 text-rose-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'}"
                        >
                            <UserCircle class="w-4 h-4" />
                            <span>내 프로필</span>
                            {#if !isLoggedIn}<Lock class="w-3 h-3" />{/if}
                        </button>
                    </div>
                </div>

                <!-- Login Status -->
                <div class="flex items-center">
                    {#if isLoggedIn}
                        <div class="flex items-center space-x-3 px-4 py-2 rounded-lg bg-gradient-to-r from-rose-50 to-orange-50">
                            <User class="w-5 h-5 text-rose-600" />
                            <span class="text-sm font-medium">사용자님</span>
                        </div>
                    {:else}
                        <button
                                onclick={() => showLoginModal = true}
                                class="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-rose-600 to-orange-500 text-white hover:from-rose-700 hover:to-orange-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                            <LogIn class="w-4 h-4" />
                            <span>로그인</span>
                        </button>
                    {/if}
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

    <!-- Main Content -->
    {#if activeTab === 'planner'}
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Left Panel - Input Form -->
                <div class="bg-white rounded-2xl shadow-lg p-6">
                    <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
                        <MapPin class="w-5 h-5 mr-2 text-rose-600" />
                        여행 정보 입력
                    </h2>

                    <div class="space-y-5">
                        <!-- 여행지 -->
                        <div>
                            <label for="city-search" class="block text-sm font-medium text-gray-700 mb-2">
                                여행지 *
                            </label>
                            <div class="relative">
                                <input
                                        id="city-search"
                                        type="text"
                                        bind:value={citySearch}
                                        placeholder="도시명을 검색하세요..."
                                        class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                                />
                                <Search class="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />

                                {#if showCityDropdown && cities.length > 0}
                                    <div class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
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
                        <div>
                            <label for="duration" class="block text-sm font-medium text-gray-700 mb-2">
                                여행 기간 (일) *
                            </label>
                            <input
                                    id="duration"
                                    type="number"
                                    min="1"
                                    max="30"
                                    bind:value={formData.duration}
                                    class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                            />
                        </div>

                        <!-- 선택 정보 -->
                        <div class="pt-4 border-t border-gray-100">
                            <h3 class="text-sm font-semibold text-gray-600 mb-4">선택 정보</h3>

                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label for="age-group" class="block text-sm font-medium text-gray-700 mb-2">연령대</label>
                                    <select
                                            id="age-group"
                                            bind:value={formData.ageGroup}
                                            class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500"
                                    >
                                        {#each ageGroups as age}
                                            <option value={age}>{age}</option>
                                        {/each}
                                    </select>
                                </div>

                                <div>
                                    <label for="group-size" class="block text-sm font-medium text-gray-700 mb-2">인원 수</label>
                                    <input
                                            id="group-size"
                                            type="number"
                                            min="1"
                                            max="20"
                                            bind:value={formData.groupSize}
                                            class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500"
                                    />
                                </div>
                            </div>

                            <div class="mt-4 space-y-4">
                                <div>
                                    <label for="travel-purpose" class="block text-sm font-medium text-gray-700 mb-2">여행 목적</label>
                                    <select
                                            id="travel-purpose"
                                            bind:value={formData.purpose}
                                            class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500"
                                    >
                                        <option value="">선택하세요</option>
                                        {#each purposes as purpose}
                                            <option value={purpose.name}>{purpose.name}</option>
                                        {/each}
                                    </select>
                                </div>

                                <div>
                                    <label for="travel-type" class="block text-sm font-medium text-gray-700 mb-2">여행 타입</label>
                                    <select
                                            id="travel-type"
                                            bind:value={formData.travelType}
                                            class="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500"
                                    >
                                        <option value="">선택하세요</option>
                                        {#each types as type}
                                            <option value={type.name}>{type.name}</option>
                                        {/each}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button
                                onclick={handleGeneratePlan}
                                disabled={loading}
                                class="w-full py-3 bg-gradient-to-r from-rose-600 to-orange-500 text-white font-medium rounded-lg hover:from-rose-700 hover:to-orange-600 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
                        >
                            {#if loading}
                                <div class="flex items-center">
                                    <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    생성 중...
                                </div>
                            {:else}
                                <Compass class="w-5 h-5 mr-2" />
                                여행 계획 생성하기
                            {/if}
                        </button>
                    </div>
                </div>

                <!-- Right Panel - Output -->
                <div class="bg-white rounded-2xl shadow-lg p-6">
                    <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
                        <Calendar class="w-5 h-5 mr-2 text-orange-600" />
                        여행 일정 추천
                    </h2>

                    {#if travelPlan}
                        <div class="space-y-4">
                            <!-- Overview -->
                            <div class="bg-gradient-to-r from-rose-50 to-orange-50 rounded-lg p-4">
                                <h3 class="font-semibold text-gray-800 mb-2">{travelPlan.destination}</h3>
                                <div class="grid grid-cols-2 gap-2 text-sm">
                                    <div class="flex items-center text-gray-600">
                                        <Calendar class="w-4 h-4 mr-1 text-rose-500" />
                                        {travelPlan.duration}일 여행
                                    </div>
                                    <div class="flex items-center text-gray-600">
                                        <DollarSign class="w-4 h-4 mr-1 text-orange-500" />
                                        {travelPlan.totalBudget}
                                    </div>
                                </div>
                            </div>

                            <!-- Daily Schedule -->
                            <div class="space-y-3 max-h-96 overflow-y-auto pr-2">
                                {#each travelPlan.days as day}
                                    <div class="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <h4 class="font-semibold text-gray-800 mb-3 flex items-center">
                      <span class="w-8 h-8 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-full flex items-center justify-center text-sm mr-2">
                        {day.day}
                      </span>
                                            {day.date}
                                        </h4>

                                        <div class="space-y-2">
                                            {#each Object.entries(day.schedule) as [period, info]}
                                                <div class="pl-4 border-l-2 border-orange-200 hover:border-rose-400 transition-colors">
                                                    <div class="flex items-center text-sm text-gray-500 mb-1">
                                                        <Clock class="w-3 h-3 mr-1" />
                                                        {info.time}
                                                    </div>
                                                    <div class="font-medium text-gray-700">{info.activity}</div>
                                                    <div class="text-sm text-gray-600 mt-1">{info.description}</div>
                                                    <div class="text-xs text-rose-600 mt-1">💡 {info.tips}</div>
                                                </div>
                                            {/each}
                                        </div>
                                    </div>
                                {/each}
                            </div>

                            <!-- Warnings -->
                            <div class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4">
                                <div class="flex items-start">
                                    <AlertCircle class="w-5 h-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 class="font-medium text-amber-900 mb-2">주의사항</h4>
                                        <ul class="text-sm text-amber-800 space-y-1">
                                            {#each travelPlan.warnings as warning}
                                                <li>• {warning}</li>
                                            {/each}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    {:else}
                        <div class="flex flex-col items-center justify-center h-96 text-gray-400">
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