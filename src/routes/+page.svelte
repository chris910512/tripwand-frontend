<!-- +page.svelte -->
<script>
    import { MapPin, Calendar, Users, Target, Compass, User, LogIn, ChevronRight, Clock, DollarSign, AlertCircle, Search, MessageSquare, UserCircle, Lock, Globe, Send, Hash, Smile, MoreVertical } from 'lucide-svelte';
    import favicon from '$lib/assets/favicon.svg';
    import { detectLanguage, t, saveLanguage } from '$lib/i18n.js';
    import { searchCities } from '$lib/places.js';
    import { dev } from '$app/environment';
    
    let { data } = $props();

    // Debug logging helper - only in development
    const debugLog = (...args) => {
        if (dev) console.log(...args);
    };

    // 닉네임 기반 고유 색상 생성
    function generateUserColor(nickname, lightMode = false) {
        if (!nickname) return lightMode ? 'from-gray-100 to-gray-200' : 'from-gray-400 to-gray-500';
        
        // 닉네임을 해시로 변환
        let hash = 0;
        for (let i = 0; i < nickname.length; i++) {
            hash = nickname.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        // 색상 팔레트 (더 다양하고 부드러운 색상)
        const colorPalettes = lightMode ? [
            'from-red-50 to-red-100',
            'from-orange-50 to-orange-100', 
            'from-amber-50 to-amber-100',
            'from-lime-50 to-lime-100',
            'from-green-50 to-green-100',
            'from-emerald-50 to-emerald-100',
            'from-teal-50 to-teal-100',
            'from-cyan-50 to-cyan-100',
            'from-sky-50 to-sky-100',
            'from-blue-50 to-blue-100',
            'from-indigo-50 to-indigo-100',
            'from-violet-50 to-violet-100',
            'from-purple-50 to-purple-100',
            'from-fuchsia-50 to-fuchsia-100',
            'from-pink-50 to-pink-100',
            'from-rose-50 to-rose-100'
        ] : [
            'from-red-400 to-red-500',
            'from-orange-400 to-orange-500', 
            'from-amber-400 to-amber-500',
            'from-lime-400 to-lime-500',
            'from-green-400 to-green-500',
            'from-emerald-400 to-emerald-500',
            'from-teal-400 to-teal-500',
            'from-cyan-400 to-cyan-500',
            'from-sky-400 to-sky-500',
            'from-blue-400 to-blue-500',
            'from-indigo-400 to-indigo-500',
            'from-violet-400 to-violet-500',
            'from-purple-400 to-purple-500',
            'from-fuchsia-400 to-fuchsia-500',
            'from-pink-400 to-pink-500',
            'from-rose-400 to-rose-500'
        ];
        
        const index = Math.abs(hash) % colorPalettes.length;
        const selectedColor = colorPalettes[index];
        
        debugLog(`🎨 Generated color for "${nickname}": ${selectedColor} (hash: ${hash}, index: ${index})`);
        return selectedColor;
    }

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
    
    // 채팅방 상태
    let selectedRoom = $state('UK');
    let messages = $state([]);
    let newMessage = $state('');
    let ws = $state(null);
    let chatSession = $state(null);
    let isConnected = $state(false);
    let userNickname = $state('');
    let isComposing = $state(false);
    // 기본 채팅방 데이터
    const defaultChatRooms = [
        { id: 'UK', name: 'United Kingdom', flag: '🇬🇧', user_count: 0 },
        { id: 'US', name: 'United States', flag: '🇺🇸', user_count: 0 },
        { id: 'France', name: 'France', flag: '🇫🇷', user_count: 0 },
        { id: 'Germany', name: 'Germany', flag: '🇩🇪', user_count: 0 },
        { id: 'Spain', name: 'Spain', flag: '🇪🇸', user_count: 0 },
        { id: 'Italy', name: 'Italy', flag: '🇮🇹', user_count: 0 },
        { id: 'Japan', name: 'Japan', flag: '🇯🇵', user_count: 0 }
    ];
    
    let actualChatRooms = $state(defaultChatRooms); // API에서 로드된 실제 채팅방 데이터

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
            return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? 'http://127.0.0.1:8080'
                : 'https://api.tripwand.online';
        }
        return 'https://api.tripwand.online'; // SSR fallback
    };

    // API 인터페이스
    const API = {
        searchCities: async (query) => {
            console.log('🔎 API.searchCities 호출:', query);
            try {
                const results = await searchCities(query, currentLanguage);
                console.log('🔎 searchCities 결과:', results);
                
                // Places API 결과를 기존 형식에 맞게 변환
                const mappedResults = results.map(place => ({
                    id: place.id,
                    name: place.structured_formatting?.main_text || place.name.split(',')[0],
                    country: place.structured_formatting?.secondary_text || place.name.split(',').slice(1).join(',').trim()
                }));
                
                console.log('🔎 변환된 결과:', mappedResults);
                return mappedResults;
            } catch (error) {
                console.error('City search failed:', error);
                return [];
            }
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
                    travel_type: params.travelType,
                    language: currentLanguage
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
        },
        
        // 채팅 API
        createSession: async () => {
            // 새로운 지문 생성 (매번 새로 생성)
            const fingerprint = generateFingerprint();
            
            // 브라우저별 고유 localStorage 키 생성
            const browserKey = `tripwand_chat_session_${navigator.userAgent.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '')}`;
            let localStorageKey = localStorage.getItem(browserKey) || '';
            
            debugLog('🔧 Browser-specific localStorage key:', browserKey);
            
            debugLog('🔧 Creating session with API:', getApiUrl());
            debugLog('🔧 Fingerprint:', fingerprint);
            debugLog('🔧 Fingerprint length:', fingerprint.length);
            debugLog('🔧 LocalStorage key:', localStorageKey || 'EMPTY (new session)');
            debugLog('🔧 Browser info:', {
                userAgent: navigator.userAgent.substring(0, 100) + '...',
                language: navigator.language,
                screen: `${screen.width}x${screen.height}`,
                platform: navigator.platform,
                cookiesEnabled: navigator.cookieEnabled,
                isPrivate: !window.indexedDB || navigator.webdriver
            });
            
            const response = await fetch(`${getApiUrl()}/api/v1/chat/sessions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    browser_fingerprint: fingerprint,
                    localstorage_key: localStorageKey
                })
            });
            
            if (!response.ok) {
                throw new Error(`Failed to create session: ${response.status}`);
            }
            
            const result = await response.json();
            debugLog('✅ Session created:', result);
            
            if (result.success) {
                // 브라우저별 고유 키로 저장
                const browserKey = `tripwand_chat_session_${navigator.userAgent.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '')}`;
                localStorage.setItem(browserKey, result.localstorage_key);
                debugLog('✅ Session saved to localStorage with key:', browserKey);
                return result;
            }
            throw new Error('Session creation failed');
        },
        
        loadChatRooms: async () => {
            debugLog('🔧 Loading chat rooms from:', getApiUrl());
            
            try {
                const response = await fetch(`${getApiUrl()}/api/v1/chat/rooms`);
                if (!response.ok) {
                    debugLog('⚠️ Failed to load rooms from API, using fallback');
                    return defaultChatRooms;
                }
                
                const result = await response.json();
                debugLog('✅ Chat rooms loaded:', result);
                
                return result.success ? result.rooms : defaultChatRooms;
            } catch (error) {
                debugLog('⚠️ API request failed, using fallback:', error);
                return defaultChatRooms;
            }
        },
        
        loadMessageHistory: async (room, page = 1, limit = 50) => {
            const response = await fetch(`${getApiUrl()}/api/v1/chat/rooms/${room}/messages?page=${page}&limit=${limit}`);
            if (!response.ok) return [];
            
            const result = await response.json();
            return result.success ? result.messages : [];
        }
    };
    
    // 헬퍼 함수들
    function generateFingerprint() {
        if (typeof window === 'undefined') return 'fp_server';
        
        // 더 복잡한 캔버스 지문 생성
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 50;
        const ctx = canvas.getContext('2d');
        
        // 다양한 렌더링으로 브라우저별 차이 극대화
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.font = '11pt Arial';
        ctx.fillText('TripWand 채팅 🚀', 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.font = '18pt Arial';
        ctx.fillText('브라우저 지문', 4, 45);
        
        // WebGL 지문 (사용 가능한 경우)
        let webglInfo = '';
        try {
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    webglInfo = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) + '|' + 
                              gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                }
            }
        } catch (e) {
            webglInfo = 'webgl_error';
        }
        
        // 더 다양한 브라우저 특성 수집
        const fingerprint = [
            navigator.userAgent,
            navigator.language,
            navigator.languages ? navigator.languages.join(',') : '',
            screen.width + 'x' + screen.height + 'x' + screen.colorDepth,
            screen.availWidth + 'x' + screen.availHeight,
            new Date().getTimezoneOffset(),
            navigator.platform || '',
            navigator.cookieEnabled,
            navigator.doNotTrack || '',
            navigator.hardwareConcurrency || 0,
            navigator.maxTouchPoints || 0,
            window.devicePixelRatio || 1,
            canvas.toDataURL(),
            webglInfo,
            // localStorage 사용 가능 여부
            (() => {
                try {
                    return localStorage ? 'ls_yes' : 'ls_no';
                } catch(e) {
                    return 'ls_error';
                }
            })(),
            // sessionStorage 사용 가능 여부  
            (() => {
                try {
                    return sessionStorage ? 'ss_yes' : 'ss_no';
                } catch(e) {
                    return 'ss_error';
                }
            })(),
            // 현재 시간을 밀리초로 (세션별 고유성 추가)
            Date.now(),
            // 랜덤 요소 (같은 브라우저라도 세션별로 다르게)
            Math.random().toString(36).substring(2, 15)
        ].join('|');
        
        // 지문이 너무 길어서 btoa가 실패하거나 잘릴 수 있음
        // 더 안전한 해시 방법 사용
        let hash = 0;
        for (let i = 0; i < fingerprint.length; i++) {
            const char = fingerprint.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        
        const hashString = Math.abs(hash).toString(36) + '_' + Date.now().toString(36);
        debugLog('🔧 Generated fingerprint components:', {
            originalLength: fingerprint.length,
            hash: Math.abs(hash).toString(36),
            timestamp: Date.now().toString(36),
            final: 'fp_' + hashString
        });
        
        return 'fp_' + hashString;
    }
    
    // WebSocket 연결 관리
    function connectWebSocket() {
        if (!chatSession) {
            debugLog('❌ Cannot connect: no chat session');
            return;
        }
        
        // 이미 연결되어 있거나 연결 중이면 무시
        if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) {
            debugLog('⚠️ WebSocket already connected or connecting');
            return;
        }
        
        // 기존 연결이 있으면 정리
        if (ws) {
            ws.close();
            ws = null;
        }
        
        const wsUrl = getApiUrl().replace('http', 'ws') + '/ws/chat';
        debugLog('🔧 Connecting to WebSocket:', wsUrl);
        debugLog('🔧 Session info:', { 
            session_id: chatSession.session_id, 
            nickname: chatSession.nickname 
        });
        
        try {
            ws = new WebSocket(wsUrl);
            
            ws.onopen = () => {
                debugLog('✅ WebSocket connected successfully');
                isConnected = true;
                
                // 연결 직후 즉시 방 입장 시도
                if (ws.readyState === WebSocket.OPEN) {
                    debugLog('🏃‍♂️ Attempting immediate room join...');
                    joinRoom(selectedRoom);
                } else {
                    debugLog('⚠️ WebSocket not ready, waiting...');
                    setTimeout(() => {
                        if (ws && ws.readyState === WebSocket.OPEN) {
                            joinRoom(selectedRoom);
                        }
                    }, 10);
                }
            };
            
            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    debugLog('📥 WebSocket message received:', message);
                    handleWebSocketMessage(message);
                } catch (error) {
                    if (dev) console.error('❌ Failed to parse WebSocket message:', event.data, error);
                }
            };
            
            ws.onclose = (event) => {
                debugLog('🔌 WebSocket disconnected:', event.code, event.reason);
                isConnected = false;
                ws = null;
                
                // 정상적인 종료가 아니고 채팅 탭이 활성화되어 있으면 재연결
                if (event.code !== 1000 && activeTab === 'chat' && chatSession) {
                    debugLog('🔄 Scheduling reconnection in 5 seconds...');
                    setTimeout(() => {
                        if (activeTab === 'chat' && chatSession && (!ws || ws.readyState === WebSocket.CLOSED)) {
                            debugLog('🔄 Attempting to reconnect...');
                            connectWebSocket();
                        }
                    }, 5000);
                }
            };
            
            ws.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                isConnected = false;
            };
            
        } catch (error) {
            console.error('❌ Failed to create WebSocket connection:', error);
        }
    }
    
    function handleWebSocketMessage(message) {
        switch (message.type) {
            case 'room_joined':
                debugLog('Joined room:', message.room);
                break;
            case 'new_message':
                debugLog('📝 WebSocket new_message received:', JSON.stringify(message, null, 2));
                // WebSocket으로 받은 새 메시지를 배열 끝에 추가
                messages = [...messages, message];
                debugLog('📝 Messages array after adding:', messages.length);
                // 메시지 영역을 하단으로 스크롤
                setTimeout(() => {
                    const messageArea = document.querySelector('.messages-area');
                    if (messageArea) {
                        messageArea.scrollTop = messageArea.scrollHeight;
                    }
                }, 100);
                break;
            case 'error':
                console.error('Chat error:', message.content);
                break;
            case 'ping':
                // Send pong response
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                        type: 'pong',
                        timestamp: new Date().toISOString()
                    }));
                }
                break;
        }
    }
    
    function joinRoom(room) {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            debugLog('❌ Cannot join room: WebSocket not connected');
            return;
        }
        
        if (!chatSession) {
            debugLog('❌ Cannot join room: no chat session');
            return;
        }
        
        // API 문서에 따른 정확한 형식: data 객체 내에 session_id와 nickname
        const message = {
            type: 'join_room',
            room: room,
            data: {
                session_id: chatSession.session_id,
                nickname: chatSession.nickname
            },
            timestamp: new Date().toISOString()
        };
        
        debugLog('📤 Sending join room message:', message);
        
        try {
            ws.send(JSON.stringify(message));
            selectedRoom = room;
            loadRoomMessages(room);
        } catch (error) {
            console.error('❌ Failed to send join room message:', error);
        }
    }
    
    async function loadRoomMessages(room) {
        try {
            const roomMessages = await API.loadMessageHistory(room);
            // 백엔드에서 최신 순(내림차순)으로 오므로 채팅 UI용으로 역순(오름차순)으로 정렬
            messages = roomMessages.reverse();
        } catch (error) {
            console.error('Failed to load messages:', error);
            messages = [];
        }
    }
    
    function sendMessage() {
        if (!newMessage.trim()) {
            debugLog('❌ Cannot send empty message');
            return;
        }
        
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            debugLog('❌ Cannot send message: WebSocket not connected');
            alert('채팅 서버에 연결되지 않았습니다. 잠시 후 다시 시도해주세요.');
            return;
        }
        
        if (newMessage.length > 280) {
            alert(t('chat.messageTooLong', currentLanguage));
            return;
        }
        
        const message = {
            type: 'chat_message',
            content: newMessage.trim(),
            timestamp: new Date().toISOString()
        };
        
        debugLog('📤 Sending chat message:', message);
        
        try {
            ws.send(JSON.stringify(message));
            newMessage = '';
        } catch (error) {
            console.error('❌ Failed to send message:', error);
            alert('메시지 전송에 실패했습니다. 다시 시도해주세요.');
        }
    }
    
    async function initializeChat() {
        try {
            // 세션과 채팅방 데이터를 병렬로 로드
            const [sessionData, roomsData] = await Promise.all([
                API.createSession(),
                API.loadChatRooms()
            ]);
            
            chatSession = sessionData;
            userNickname = sessionData.nickname;
            // API 데이터와 기본 데이터를 병합
            actualChatRooms = roomsData.map(room => ({
                ...room,
                flag: defaultChatRooms.find(r => r.id === room.id)?.flag || '🌍'
            }));
            
            connectWebSocket();
        } catch (error) {
            console.error('Failed to initialize chat:', error);
        }
    }

    // Lifecycle
    $effect(() => {
        currentLanguage = detectLanguage();
        loadData();
    });
    
    // 채팅 탭 활성화 시 세션 초기화
    $effect(() => {
        if (activeTab === 'chat' && !chatSession) {
            debugLog('🔧 Chat tab activated, initializing chat...');
            initializeChat();
        }
        
        // 채팅 탭이 아닐 때는 WebSocket 연결 정리
        if (activeTab !== 'chat' && ws) {
            debugLog('🔧 Chat tab deactivated, cleaning up WebSocket...');
            ws.close(1000, 'Tab changed');
            ws = null;
            isConnected = false;
        }
    });

    // Search cities with debounce
    $effect(() => {
        console.log('🎯 citySearch 변경됨:', citySearch);
        
        if (searchTimer) clearTimeout(searchTimer);

        searchTimer = setTimeout(async () => {
            if (citySearch) {
                console.log('🎯 검색 시작:', citySearch);
                const results = await API.searchCities(citySearch);
                console.log('🎯 검색 완료, 결과:', results);
                cities = results;
                showCityDropdown = true;
                console.log('🎯 드롭다운 표시:', showCityDropdown, '결과 개수:', cities.length);
                
                // 직접 입력된 경우에도 destination 업데이트
                formData.destination = citySearch;
            } else {
                console.log('🎯 검색어 비어있음, 드롭다운 숨김');
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
        // 구조화된 포맷팅에서 메인 텍스트(도시명)만 사용
        const cityName = city.structured_formatting?.main_text || city.name.split(',')[0];
        formData.destination = cityName;
        citySearch = cityName;
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
        if (tab === 'profile') {
            alert(t('common.developingService', currentLanguage));
            return;
        }
        if (tab === 'chat' && !isLoggedIn) {
            // Allow anonymous users to access chat rooms
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
    <meta property="og:locale" content={currentLanguage === 'ko' ? 'ko_KR' : 'en_US'} />
    <meta property="og:locale:alternate" content={currentLanguage === 'ko' ? 'en_US' : 'ko_KR'} />
    <meta property="og:site_name" content="TripWand" />
    
    <!-- Language and region targeting -->
    <meta name="language" content={currentLanguage} />
    <link rel="alternate" hreflang="ko" href="https://tripwand.online" />
    <link rel="alternate" hreflang="en" href="https://tripwand.online?lang=en" />
    <link rel="alternate" hreflang="x-default" href="https://tripwand.online" />
    
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
        "description": {currentLanguage === 'ko' ? "AI 기반 맞춤형 여행 계획 생성 서비스" : "AI-powered personalized travel planning service"},
        "url": "https://tripwand.online",
        "applicationCategory": "TravelApplication",
        "operatingSystem": "Any",
        "browserRequirements": "Modern web browser with JavaScript enabled",
        "featureList": [
            {currentLanguage === 'ko' ? "AI 여행 계획 생성" : "AI travel itinerary generation"},
            {currentLanguage === 'ko' ? "맞춤형 추천" : "Personalized recommendations"},
            {currentLanguage === 'ko' ? "다국어 지원" : "Multi-language support"},
            {currentLanguage === 'ko' ? "실시간 채팅" : "Real-time chat"}
        ],
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "KRW",
            "availability": "https://schema.org/InStock"
        },
        "inLanguage": [
            {
                "@type": "Language",
                "name": "Korean",
                "alternateName": "ko"
            },
            {
                "@type": "Language", 
                "name": "English",
                "alternateName": "en"
            }
        ],
        "creator": {
            "@type": "Organization",
            "name": "TripWand",
            "url": "https://tripwand.online",
            "contactPoint": {
                "@type": "ContactPoint",
                "email": "sungmin.park.lab@gmail.com",
                "contactType": "customer service"
            }
        }
    }
    </script>
    
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "TravelAgency",
        "name": "TripWand",
        "description": {currentLanguage === 'ko' ? "AI 기반 맞춤형 여행 계획 생성 서비스" : "AI-powered personalized travel planning service"},
        "url": "https://tripwand.online",
        "areaServed": [
            {
                "@type": "Country",
                "name": {currentLanguage === 'ko' ? "대한민국" : "South Korea"}
            },
            {
                "@type": "Place",
                "name": {currentLanguage === 'ko' ? "전 세계" : "Worldwide"}
            }
        ],
        "serviceType": {currentLanguage === 'ko' ? "AI 여행 계획 수립" : "AI Travel Planning"},
        "priceRange": {currentLanguage === 'ko' ? "무료" : "Free"},
        "contactPoint": {
            "@type": "ContactPoint",
            "email": "sungmin.park.lab@gmail.com",
            "contactType": "customer service"
        },
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": {currentLanguage === 'ko' ? "여행 계획 서비스" : "Travel Planning Services"},
            "itemListElement": [
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": {currentLanguage === 'ko' ? "맞춤형 여행 일정 생성" : "Personalized Itinerary Generation"},
                        "description": {currentLanguage === 'ko' ? "AI가 개인 취향에 맞는 여행 일정을 자동 생성" : "AI generates travel itineraries based on personal preferences"}
                    }
                }
            ]
        }
    }
    </script>
    
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": {currentLanguage === 'ko' ? "TripWand는 어떤 서비스인가요?" : "What is TripWand?"},
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": {currentLanguage === 'ko' ? "TripWand는 AI 기술을 활용하여 개인 맞춤형 여행 계획을 자동으로 생성해주는 무료 서비스입니다." : "TripWand is a free service that uses AI technology to automatically generate personalized travel plans."}
                }
            },
            {
                "@type": "Question",
                "name": {currentLanguage === 'ko' ? "어떤 정보를 입력해야 하나요?" : "What information do I need to provide?"},
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": {currentLanguage === 'ko' ? "여행지, 여행 기간, 연령대, 인원 수, 여행 목적, 여행 타입 등을 입력하면 최적의 여행 계획을 생성해드립니다." : "You need to provide destination, duration, age group, group size, travel purpose, and travel type to generate optimal travel plans."}
                }
            }
        ]
    }
    </script>
</svelte:head>

<div class="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50 overscroll-none">

<style>
    body { overscroll-behavior: none; overflow-x: hidden; }
    html { overflow-x: hidden; }
</style>
    <!-- Navigation -->
    <nav class="bg-white/90 backdrop-blur-md shadow-sm fixed top-0 left-0 right-0 z-50">
        <div class="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-none xl:max-w-[88rem] 2xl:max-w-[96rem]">
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
                  {t('main.betaNotice', currentLanguage)}
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
                <h3 class="text-xl font-bold text-gray-800 mb-2">{t('form.generatingTitle', currentLanguage)}</h3>
                <p class="text-gray-600">{t('common.loading', currentLanguage)}</p>
                <div class="mt-4 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div class="bg-gradient-to-r from-rose-500 to-orange-500 h-full rounded-full animate-pulse"></div>
                </div>
            </div>
        </div>
    {/if}

    <!-- Main Content -->
    {#if activeTab === 'planner'}
				<main class="w-full mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-4 flex-1 max-w-none xl:max-w-[88rem] 2xl:max-w-[96rem]"
							class:pointer-events-none={loading}
							class:opacity-75={loading}>
            <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full">
                <!-- Left Panel - Input Form -->
                <div class="bg-white rounded-2xl shadow-lg p-4 h-full flex flex-col overflow-visible xl:col-span-6">
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
                            <h3 class="text-sm font-semibold text-gray-600 mb-2">{t('form.optionalInfo', currentLanguage)}</h3>

                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label for="age-group" class="block text-xs font-medium text-gray-700 mb-1">{t('form.ageGroup', currentLanguage)}</label>
                                    <select
                                            id="age-group"
                                            bind:value={formData.ageGroup}
                                            class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:border-transparent text-sm transition-all"
                                    >
                                        {#each ageGroups as age}
                                            <option value={age}>{t(`options.ageGroups.${age}`, currentLanguage)}</option>
                                        {/each}
                                    </select>
                                </div>

                                <div>
                                    <label for="group-size" class="block text-xs font-medium text-gray-700 mb-1">{t('form.groupSize', currentLanguage)}</label>
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
                                    <label for="travel-purpose" class="block text-xs font-medium text-gray-700 mb-1">{t('form.purpose', currentLanguage)}</label>
                                    <select
                                            id="travel-purpose"
                                            bind:value={formData.purpose}
                                            class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:border-transparent text-sm transition-all"
                                    >
                                        <option value="">{t('form.selectOption', currentLanguage)}</option>
                                        {#each purposes as purpose}
                                            <option value={purpose.name}>{t(`options.purposes.${purpose.name}`, currentLanguage)}</option>
                                        {/each}
                                    </select>
                                </div>

                                <div>
                                    <label for="travel-type" class="block text-xs font-medium text-gray-700 mb-1">{t('form.travelType', currentLanguage)}</label>
                                    <select
                                            id="travel-type"
                                            bind:value={formData.travelType}
                                            class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:border-transparent text-sm transition-all"
                                    >
                                        <option value="">{t('form.selectOption', currentLanguage)}</option>
                                        {#each types as type}
                                            <option value={type.name}>{t(`options.types.${type.name}`, currentLanguage)}</option>
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
                                    {t('form.generating', currentLanguage)}
                                </div>
                            {:else}
                                <Compass class="w-5 h-5 mr-2" />
                                {t('form.generatePlan', currentLanguage)}
                            {/if}
                        </button>
                    </div>
                </div>

                <!-- Right Panel - Output -->
                <div class="bg-white rounded-2xl shadow-lg p-5 h-full flex flex-col xl:col-span-6">
                    <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center flex-shrink-0">
                        <Calendar class="w-5 h-5 mr-2 text-orange-600" />
                        {t('result.title', currentLanguage)}
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
														<div class="space-y-3 overflow-y-auto pr-2
																	max-h-[calc(100vh-22rem)]
																	md:max-h-[calc(100vh-18rem)]
																	lg:max-h-[calc(100vh-16rem)]">
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
                                {#each t('result.placeholder', currentLanguage).split('\\n') as line}
                                    {line}<br />
                                {/each}
                            </p>
                        </div>
                    {/if}
                    </div>
                </div>
            </div>
        </main>
    {/if}

    {#if activeTab === 'chat'}
        <main class="w-full mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-4 flex-1 max-w-none xl:max-w-[88rem] 2xl:max-w-[96rem]">
            <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full">
                <!-- Left Panel - Chat Rooms -->
                <div class="bg-white rounded-2xl shadow-lg p-4 h-full flex flex-col xl:col-span-4">
                    <div class="flex items-center justify-between mb-4 flex-shrink-0">
                        <h2 class="text-lg font-bold text-gray-800 flex items-center">
                            <MessageSquare class="w-5 h-5 mr-2 text-rose-600" />
                            {t('nav.chat', currentLanguage)}
                        </h2>
                        {#if isConnected}
                            <div class="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                <div class="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                                {t('chat.connected', currentLanguage)}
                            </div>
                        {:else}
                            <div class="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                <div class="w-2 h-2 bg-gray-400 rounded-full mr-1"></div>
                                {t('chat.connecting', currentLanguage)}
                            </div>
                        {/if}
                    </div>
                    
                    <!-- User Info -->
                    {#if userNickname}
                        <div class="bg-gradient-to-r {generateUserColor(userNickname, true)} rounded-lg p-3 mb-4 flex-shrink-0 border border-opacity-20">
                            <div class="flex items-center text-sm">
                                <div class="w-6 h-6 bg-gradient-to-r {generateUserColor(userNickname)} rounded-full flex items-center justify-center mr-2">
                                    <span class="text-white text-xs font-medium">
                                        {userNickname.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <span class="font-medium text-gray-800">{userNickname}</span>
                                <span class="ml-2 text-xs text-gray-600 bg-white bg-opacity-80 px-2 py-1 rounded-full">{t('chat.anonymous', currentLanguage)}</span>
                            </div>
                        </div>
                    {/if}
                    
                    <!-- Room List -->
                    <div class="flex-1 overflow-y-auto space-y-2">
                        <h3 class="text-sm font-semibold text-gray-600 mb-2">{t('chat.countryRooms', currentLanguage)}</h3>
                        {#each actualChatRooms as room}
                            <button
                                onclick={() => joinRoom(room.id)}
                                class="w-full text-left p-3 rounded-lg transition-all hover:bg-gradient-to-r hover:from-rose-50 hover:to-orange-50 {selectedRoom === room.id 
                                    ? 'bg-gradient-to-r from-rose-100 to-orange-100 border-l-4 border-rose-500' 
                                    : 'hover:shadow-md border border-gray-100'}"
                            >
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center space-x-3">
                                        <span class="text-2xl">{room.flag}</span>
                                        <div>
                                            <div class="font-medium text-gray-800 text-sm">{room.name}</div>
                                            <div class="text-xs text-gray-500">#{room.id}</div>
                                        </div>
                                    </div>
                                    <div class="flex items-center space-x-1">
                                        <Users class="w-3 h-3 text-gray-400" />
                                        <span class="text-xs text-gray-500">{room.user_count || room.userCount || 0}</span>
                                    </div>
                                </div>
                            </button>
                        {/each}
                    </div>
                    
                    <!-- Beta Notice -->
                    <div class="flex-shrink-0 mt-4 p-3 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                        <div class="flex items-start">
                            <AlertCircle class="w-4 h-4 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                            <div class="text-xs text-amber-800">
                                <div class="font-medium mb-1">{t('chat.betaFeature', currentLanguage)}</div>
                                <div>{t('chat.betaDescription', currentLanguage)}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right Panel - Chat Messages -->
                <div class="bg-white rounded-2xl shadow-lg flex flex-col xl:col-span-8 h-[600px] md:h-[700px]">
                    <!-- Chat Header -->
                    <div class="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                        <div class="flex items-center space-x-3">
                            <Hash class="w-5 h-5 text-gray-400" />
                            <div>
                                <h3 class="font-semibold text-gray-800">
                                    {actualChatRooms.find(r => r.id === selectedRoom)?.name || selectedRoom}
                                </h3>
                                <p class="text-xs text-gray-500">
                                    {actualChatRooms.find(r => r.id === selectedRoom)?.flag} {t('chat.publicChatRoom', currentLanguage)}
                                </p>
                            </div>
                        </div>
                        <button class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <MoreVertical class="w-4 h-4 text-gray-500" />
                        </button>
                    </div>
                    
                    <!-- Messages Area -->
                    <div class="messages-area flex-1 overflow-y-auto p-4 space-y-4">
                        {#if messages.length === 0}
                            <div class="flex flex-col items-center justify-center h-full text-gray-400">
                                <div class="w-16 h-16 bg-gradient-to-br from-rose-100 to-orange-100 rounded-full flex items-center justify-center mb-4">
                                    <MessageSquare class="w-8 h-8 text-rose-400" />
                                </div>
                                <p class="text-center text-gray-600 text-sm">
                                    {t('chat.welcome', currentLanguage, { room: actualChatRooms.find(r => r.id === selectedRoom)?.name })}<br />
                                    {t('chat.startConversation', currentLanguage)}
                                </p>
                            </div>
                        {:else}
                            {#each messages as message}
                                <div class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div class="w-8 h-8 bg-gradient-to-r {generateUserColor(message.data?.sender || message.sender)} rounded-full flex items-center justify-center flex-shrink-0">
                                        <span class="text-white text-xs font-medium">
                                            {(message.data?.sender || message.sender || 'Anonymous').charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-baseline space-x-2 mb-1">
                                            <span class="font-medium text-sm text-gray-800">
                                                {message.data?.sender || message.sender || 'Anonymous'}
                                            </span>
                                            <span class="text-xs text-gray-500">
                                                {(() => {
                                                    const date = new Date(message.timestamp || message.created_at || message.data?.created_at);
                                                    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleTimeString();
                                                })()}
                                            </span>
                                        </div>
                                        <p class="text-sm text-gray-700 break-words">{message.data?.content || message.content || 'No content'}</p>
                                    </div>
                                </div>
                            {/each}
                        {/if}
                    </div>
                    
                    <!-- Message Input -->
                    <div class="p-4 border-t border-gray-200 flex-shrink-0">
                        <form onsubmit={(e) => { e.preventDefault(); sendMessage(); }} class="flex space-x-3">
                            <div class="flex-1 relative">
                                <input
                                    type="text"
                                    bind:value={newMessage}
                                    placeholder={t('chat.typePlaceholder', currentLanguage)}
                                    maxlength="280"
                                    disabled={!isConnected && !chatSession}
                                    oncompositionstart={() => { isComposing = true; }}
                                    oncompositionend={() => { isComposing = false; }}
                                    onkeydown={(e) => { 
                                        if (e.key === 'Enter' && !e.shiftKey && !isComposing) { 
                                            e.preventDefault(); 
                                            sendMessage(); 
                                        } 
                                    }}
                                    class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <div class="absolute right-3 top-3 text-xs text-gray-400">
                                    {newMessage.length}/280
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={!isConnected || !newMessage.trim()}
                                class="px-6 py-3 bg-gradient-to-r from-rose-600 to-orange-500 text-white rounded-lg hover:from-rose-700 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-md hover:shadow-lg"
                            >
                                <Send class="w-4 h-4" />
                                <span class="hidden sm:inline">{t('chat.send', currentLanguage)}</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
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
    
    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-auto">
        <div class="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-none xl:max-w-[88rem] 2xl:max-w-[96rem]">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <!-- Logo & Description -->
                <div class="flex flex-col space-y-4">
                    <div class="flex items-center space-x-3">
                        <img src={favicon} alt="TripWand 로고" class="w-8 h-8" />
                        <h3 class="text-lg font-bold bg-gradient-to-r from-rose-600 to-orange-500 bg-clip-text text-transparent">
                            TripWand
                        </h3>
                    </div>
                    <p class="text-sm text-gray-600 max-w-sm">
                        {t('footer.description', currentLanguage)}
                    </p>
                </div>
                
                <!-- Contact Info -->
                <div class="flex flex-col space-y-4">
                    <h4 class="text-base font-semibold text-gray-800">{t('footer.contact', currentLanguage)}</h4>
                    <div class="space-y-3">
                        <!-- Email -->
                        <div class="flex items-center space-x-3">
                            <div class="w-5 h-5 bg-gradient-to-r from-rose-500 to-orange-500 rounded-full flex items-center justify-center">
                                <span class="text-white text-xs">@</span>
                            </div>
                            <a href="mailto:sungmin.park.lab@gmail.com" class="text-sm text-gray-600 hover:text-rose-600 transition-colors">
															sungmin.park.lab@gmail.com
                            </a>
                        </div>
                        
                        <!-- Google Form -->
                        <div class="flex items-center space-x-3">
                            <div class="w-5 h-5 bg-gradient-to-r from-rose-500 to-orange-500 rounded-full flex items-center justify-center">
                                <span class="text-white text-xs">📝</span>
                            </div>
                            <a href="https://docs.google.com/forms/d/1vaOBrXUbunoGOEe2gPV6oS9UApMxvnTC-hc0fJsvSMw/edit" target="_blank" rel="noopener noreferrer"
                               class="text-sm text-gray-600 hover:text-rose-600 transition-colors">
                                {t('footer.feedback', currentLanguage)}
                            </a>
                        </div>
                    </div>
                </div>
                
                <!-- Service Info -->
                <div class="flex flex-col space-y-4">
                    <h4 class="text-base font-semibold text-gray-800">{t('footer.service', currentLanguage)}</h4>
                    <div class="space-y-2">
                        <div class="flex items-center space-x-2">
                            <span class="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium">
                                Beta
                            </span>
                            <span class="text-sm text-gray-600">{t('footer.version', currentLanguage)}</span>
                        </div>
                        <p class="text-xs text-gray-500">
                            {t('main.betaNotice', currentLanguage)}
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- Copyright -->
            <div class="border-t border-gray-200 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center">
                <p class="text-xs text-gray-500">
                    © 2024 TripWand. {t('footer.rights', currentLanguage)}
                </p>
                <p class="text-xs text-gray-400 mt-2 sm:mt-0">
                    {t('footer.poweredBy', currentLanguage)}
                </p>
            </div>
        </div>
    </footer>
</div>