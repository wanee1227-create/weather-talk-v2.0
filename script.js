const getWeatherBtn = document.getElementById("getWeatherBtn");
const cityInput = document.getElementById("cityInput");
const addFavoriteBtn = document.getElementById("addFavoriteBtn");
const weatherInfo = document.getElementById("weatherInfo");
const favoritesList = document.getElementById("favoritesList");

// --- 로그인/회원가입 관련 요소 ---
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const submitLoginBtn = document.getElementById("submitLoginBtn");
const cancelLoginBtn = document.getElementById("cancelLoginBtn");
const usernameInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");
const welcomeMessage = document.getElementById("welcomeMessage");
const favoritesContainer = document.getElementById("favoritesContainer");

// 회원가입 폼 요소
const submitSignupBtn = document.getElementById("submitSignupBtn");
const cancelSignupBtn = document.getElementById("cancelSignupBtn");
const newUsernameInput = document.getElementById("newUsernameInput");
const newPasswordInput = document.getElementById("newPasswordInput");
const confirmPasswordInput = document.getElementById("confirmPasswordInput");

// --- 테마 관련 요소 ---
const themeToggleBtn = document.getElementById("themeToggleBtn");
const body = document.body;
// ------------------------------

// 영어 → 한글 변환
const weatherMap = {
  "sunny":"맑음","clear":"맑음","partly cloudy":"구름 조금","cloudy":"흐림",
  "overcast":"흐림","mist":"안개","patchy rain possible":"간헐적 비","patchy snow possible":"간헐적 눈",
  "patchy sleet possible":"간헐적 진눈깨비","patchy freezing drizzle possible":"간헐적 빙결 이슬비",
  "thundery outbreaks possible":"번개 가능","blowing snow":"눈보라","blizzard":"눈보라",
  "fog":"안개","freezing fog":"빙결 안개","patchy light drizzle":"간헐적 이슬비",
  "light drizzle":"이슬비","freezing drizzle":"빙결 이슬비","heavy freezing drizzle":"강한 빙결 이슬비",
  "patchy light rain":"간헐적 약한 비","light rain":"약한 비","moderate rain at times":"가끔 비",
  "moderate rain":"보통 비","heavy rain at times":"가끔 강한 비","heavy rain":"강한 비",
  "light snow":"약한 눈","moderate snow":"보통 눈","heavy snow":"강한 눈",
  "ice pellets":"우박","light sleet":"약한 진눈깨비","moderate or heavy sleet":"보통/강한 진눈깨비",
  "light rain shower":"약한 소나기","moderate or heavy rain shower":"보통/강한 소나기",
  "torrential rain shower":"폭우","light sleet showers":"약한 진눈깨비 소나기",
  "moderate or heavy sleet showers":"보통/강한 진눈깨비 소나기","light snow showers":"약한 눈 소나기",
  "moderate or heavy snow showers":"보통/강한 눈 소나기",
  "light showers of ice pellets":"약한 우박 소나기","moderate or heavy showers of ice pellets":"보통/강한 우박 소나기",
  "patchy light rain with thunder":"약한 비+번개","moderate or heavy rain with thunder":"보통/강한 비+번개",
  "patchy light snow with thunder":"약한 눈+번개","moderate or heavy snow with thunder":"보통/강한 눈+번개"
};

function translateWeather(desc) {
  const key = desc.trim().toLowerCase();
  return weatherMap[key] || "";
}

// 사용자 로그인 상태 관리 변수
let loggedInUser = null;

// 가입된 사용자 목록 (가상 데이터베이스 역할)
function getRegisteredUsers() {
    return JSON.parse(localStorage.getItem("registeredUsers") || "[]");
}
function addRegisteredUser(username) {
    let users = getRegisteredUsers();
    users.push(username);
    localStorage.setItem("registeredUsers", JSON.stringify(users));
}

// --- 테마 로직 ---

// 테마를 적용하고 localStorage에 저장하는 함수
function applyTheme(isDarkMode) {
    if (isDarkMode) {
        body.classList.add('dark-mode');
        themeToggleBtn.textContent = '☀️ 화이트 모드';
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.remove('dark-mode');
        themeToggleBtn.textContent = '🌙 다크 모드';
        localStorage.setItem('theme', 'light');
    }
}

// 저장된 테마를 불러와 적용하는 함수
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme === 'dark');
}

// 테마 토글 버튼 이벤트 리스너
themeToggleBtn.addEventListener('click', () => {
    const isDarkMode = body.classList.contains('dark-mode');
    applyTheme(!isDarkMode);
});

// ----------------------

// 로그인 상태 업데이트 UI
function updateAuthUI() {
    loggedInUser = localStorage.getItem("loggedInUser");

    // 폼 숨기기 및 입력값 초기화
    loginForm.classList.add('hidden');
    signupForm.classList.add('hidden');
    usernameInput.value = '';
    passwordInput.value = '';
    newUsernameInput.value = '';
    newPasswordInput.value = '';
    confirmPasswordInput.value = '';

    if (loggedInUser) {
        welcomeMessage.textContent = `${loggedInUser}님 환영합니다!`;
        welcomeMessage.style.display = 'inline';
        loginBtn.style.display = 'none';
        signupBtn.style.display = 'none';
        logoutBtn.style.display = 'inline';
        addFavoriteBtn.style.display = 'inline';
        favoritesContainer.classList.remove('hidden');
    } else {
        welcomeMessage.textContent = '';
        welcomeMessage.style.display = 'none';
        loginBtn.style.display = 'inline';
        signupBtn.style.display = 'inline';
        logoutBtn.style.display = 'none';
        addFavoriteBtn.style.display = 'none';
        favoritesContainer.classList.add('hidden');
    }
    
    loadFavorites(); 
}


// --- 회원가입 로직 ---
signupBtn.addEventListener("click", () => {
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    signupBtn.style.display = 'none';
    loginBtn.style.display = 'none';
    newUsernameInput.focus();
});

cancelSignupBtn.addEventListener("click", () => {
    updateAuthUI(); 
});

submitSignupBtn.addEventListener("click", () => {
    const username = newUsernameInput.value.trim();
    const password = newPasswordInput.value.trim();
    const confirm = confirmPasswordInput.value.trim();
    const registeredUsers = getRegisteredUsers();

    if (!username || !password || !confirm) {
        alert("🚨 모든 필드를 채워주세요.");
        return;
    }
    if (password !== confirm) {
        alert("🚨 비밀번호와 비밀번호 확인이 일치하지 않습니다.");
        return;
    }
    if (registeredUsers.includes(username)) {
        alert("🚨 이미 존재하는 사용자 ID입니다.");
        return;
    }

    addRegisteredUser(username);
    alert(`🎉 ${username}님, 회원가입 성공! 이제 로그인해주세요.`);
    
    usernameInput.value = username;
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    loginBtn.style.display = 'none';
    signupBtn.style.display = 'none';
    passwordInput.focus();
});


// --- 로그인/로그아웃 로직 ---

loginBtn.addEventListener("click", () => {
    signupForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    signupBtn.style.display = 'none';
    loginBtn.style.display = 'none';
    usernameInput.focus();
});

cancelLoginBtn.addEventListener("click", () => {
    updateAuthUI(); 
});

submitLoginBtn.addEventListener("click", () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const registeredUsers = getRegisteredUsers();

    if (!username || !password) {
        alert("🚨 ID와 비밀번호를 모두 입력해주세요.");
        return;
    }

    if (!registeredUsers.includes(username)) {
        alert(`🚨 '${username}'은(는) 등록되지 않은 사용자 ID입니다. 회원가입을 먼저 해주세요.`);
        return;
    }

    localStorage.setItem("loggedInUser", username);
    localStorage.removeItem("favorites");
    updateAuthUI();
    alert(`✨ ${username}님, 로그인 성공!`);
});

logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("favorites"); 
    updateAuthUI();
    alert("👋 로그아웃되었습니다.");
});

// ---------------------------


// 페이지 로드 시
document.addEventListener("DOMContentLoaded", () => {
  loadTheme();
  const savedCity = localStorage.getItem("lastCity");
  if(savedCity) {
    cityInput.value = savedCity;
    fetchWeather(savedCity);
  }
  updateAuthUI();
});

// 'Enter' 키 활성화 로직
cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        const city = cityInput.value.trim() || "서울";
        localStorage.setItem("lastCity", city);
        fetchWeather(city);
    }
});

// 날씨 버튼 클릭
getWeatherBtn.addEventListener("click", () => {
  const city = cityInput.value.trim() || "서울";
  localStorage.setItem("lastCity", city);
  fetchWeather(city);
});

// 즐겨찾기 관련 함수들
addFavoriteBtn.addEventListener("click", () => {
  if (!loggedInUser) {
    alert("🚨 즐겨찾기는 로그인 후 이용 가능합니다.");
    return;
  }
  
  const city = cityInput.value.trim();
  if(!city) return;

  let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
  if(!favorites.includes(city)) {
    favorites.push(city);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    loadFavorites();
  }
});

function loadFavorites() {
  favoritesList.innerHTML = "";
  if (!loggedInUser) return;

  const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
  favorites.forEach(city => {
    const btn = document.createElement("div");

    const nameSpan = document.createElement("span");
    nameSpan.textContent = city;
    nameSpan.className = "favoriteCityName";
    nameSpan.addEventListener("click", () => {
      cityInput.value = city;
      localStorage.setItem("lastCity", city);
      fetchWeather(city);
    });

    const delBtn = document.createElement("span");
    delBtn.textContent = "❌";
    delBtn.className = "deleteBtn";
    delBtn.addEventListener("click", () => removeFavorite(city));

    btn.appendChild(nameSpan);
    btn.appendChild(delBtn);
    favoritesList.appendChild(btn);
  });
}

function removeFavorite(city) {
  if (!loggedInUser) return;

  let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
  favorites = favorites.filter(c => c !== city);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  loadFavorites();
}

// 날씨 불러오기
function fetchWeather(city) {
  weatherInfo.innerHTML = "<p>🌤️ 날씨 불러오는 중...</p>";

  fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`)
    .then(response => response.json())
    .then(data => displayWeather(data, city))
    .catch(err => {
      weatherInfo.innerHTML = "❌ 날씨 정보를 가져올 수 없습니다.";
      console.error(err);
    });
}

// 날씨 표시
function displayWeather(data, city) {
  let html = `<h2>${city} 날씨</h2>`;
  const today = data.current_condition[0];
  const desc = translateWeather(today.weatherDesc[0].value);

  html += `<p>현재: ${today.temp_C}°C | ${desc}</p>`;
  html += `<p>습도: ${today.humidity}% | 바람: ${today.windspeedKmph} km/h</p>`;

  html += `<h3>주간 예보</h3>`;
  data.weather.forEach(day => {
    const dayDesc = translateWeather(day.hourly[0].weatherDesc[0].value);
    html += `
      <div class="dayForecast">
        <div>${day.date}</div>
        <div>${day.maxtempC}°C / ${day.mintempC}°C</div>
        <div>${dayDesc}</div>
      </div>
    `;
  });

  weatherInfo.innerHTML = html;
}

// 정보 버튼 토글 (클릭 이벤트는 이전과 동일하며, CSS 수정으로 클릭 문제를 해결함)
const infoBtn = document.getElementById("infoBtn");
const infoBox = document.getElementById("infoBox");
infoBtn.addEventListener("click", () => {
  infoBox.classList.toggle("visible");
});