import { getUserInfo, getResults, getSkills } from './query.js';
import { xpGraph, radarChart } from './graph.js';

const LOGIN_Path = 'https://01.gritlab.ax/api/auth/signin'
let jwtToken = '';

document.addEventListener('DOMContentLoaded', () => {
    // Set initiall display for pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.add('hidden'));

    // if JWT token exists, load profile
    const storedToken = localStorage.getItem('JWT');
    if (storedToken) {
        jwtToken = storedToken;

        if (isTokenValid(jwtToken)) {
            loadProfile();
        } else {
            localStorage.removeItem('JWT');
            jwtToken = '';
            document.getElementById('error-msg').innerText = "Session expired. Please log in again.";
            showPage('login-page');
        }
    } else {
        showPage('login-page');
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // prevent form from refreshing the page
            login();
        });
    } else {
        console.error("Login form not found");
    }

    // Connect logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    } else {
        console.error("Logout button not found");
    }
});

/**
 * Show a specific page and hide others
 * @param {string} pageId 
 */
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.add('hidden');
    });

    // Show the requested page by removing the 'hidden' class
    const pageToShow = document.getElementById(pageId);
    if (pageToShow) {
        pageToShow.classList.remove('hidden');
    } else {
        console.error(`Cannot show page: Element with ID '${pageId}' not found`);
    }
}
/**
 * Login function
 * Fetches the JWT token from the server and stores it in localStorage
 */
async function login() {
    const userinput = document.getElementById('UserInput').value;
    const password = document.getElementById('password').value;

    if (!userinput || !password) {
        document.getElementById('error-msg').innerText = "Please enter credentials.";
        return;
    }
    const userCred = btoa(`${userinput}:${password}`);

    try {
        const response = await fetch(LOGIN_Path, {
            method: 'POST',
            headers: {
                "Authorization": `Basic ${userCred}`,
            }
        });

        if (!response.ok) {
            document.getElementById('error-msg').innerText = "Invalid credentials.";
            return;
        }

        const JWT = await response.text();
        jwtToken = JWT.replace(/"/g, '');

        if (!isTokenValid(jwtToken)) {
            document.getElementById('error-msg').innerText = "Recieved invalid token. Please try again.";
            return;
        }
        localStorage.setItem('JWT', jwtToken);
        loadProfile();
    } catch (error) {
        console.error('Error during login:', error);
        document.getElementById('error-msg').innerText = "An error occurred. Please try again.";
        return;
    }
}

/**
 * Logout function
 * Clears the JWT token and shows the login page
 */
function logout() {
    jwtToken = '';
    localStorage.removeItem('JWT');
    showPage('login-page');
}

/**
 * Check if the JWT token is valid and not expired
 * @returns {boolean} True if valid, false otherwise
 */
function isTokenValid(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);

        if (payload.exp < currentTime) {
            console.error('Token expired');
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error decoding token:', error);
        return false;
    }
}

/**
 * Load the user profile and display it
 */
async function loadProfile() {
    if (!isTokenValid(jwtToken)) {
        document.getElementById('error-msg').innerText = "Session expired. Please log in again.";
        localStorage.removeItem('JWT');
        jwtToken = '';
        showPage('login-page');
        return;
    }

    showPage('profile-page');

    try {
        const [userInfo, xpResults, skillsData] = await Promise.all([
            getUserInfo(jwtToken),
            getResults(jwtToken),
            getSkills(jwtToken)
        ]);

        if (userInfo?.data?.user?.[0]?.login) {
            document.getElementById('user-name').innerText = `${userInfo.data.user[0].login}`;
        }

        displayUserInfo(userInfo);
        displayAuditInfo(userInfo);
        displaySkills(skillsData);
        displayXP(xpResults);
    } catch (error) {
        console.error('Error loading profile:', error);
        document.getElementById('error-msg').innerText = '<p>Error loading profile data</p>';

        // Check if the error is due to an expired token
        if (error.message.includes('401')) {
            document.getElementById('error-msg').innerText = "Session expired. Please log in again.";
            localStorage.removeItem('JWT');
            jwtToken = '';
            showPage('login-page');
        }
    }
}

/**
 *  Displays user information in the profile page
 * @param {Object} userData - The user data object 
 */
function displayUserInfo(userData) {
    try {
        const userInfoSection = document.getElementById("user-info");
        if (!userInfoSection) {
            console.error("User info section not found");
            return;
        }

        const user = userData?.data?.user?.[0];
        if (!user) {
            userInfoSection.innerHTML = '<p>No user data available</p>';
            return;
        }

        userInfoSection.innerHTML = `
            <h3>User Information</h3>
            <p><strong>Name:</strong> ${user.firstName || ''} ${user.lastName || ''}</p>
            <p><strong>Username:</strong> ${user.login || 'N/A'}</p>
            <p><strong>ID:</strong> ${user.id || 'N/A'}</p>
            <p><strong>Email:</strong> ${user.attrs?.email || 'N/A'}</p>
            <p><strong>Campus:</strong> ${user.campus || 'N/A'}</p>
            <p><strong>Nationality:</strong> ${user.attrs?.nationality || 'N/A'}</p>
        `;
    } catch (error) {
        console.error('Error displaying user info:', error);
        const userInfoSection = document.getElementById("user-info");
        if (userInfoSection) {
            userInfoSection.innerHTML = '<p>Error loading user information</p>';
        }
    }
}

/**
 *  Displays the audit information in the profile page
 * @param {Object} userData 
 */
function displayAuditInfo(userData) {
    try {
        const AuditInfoSection = document.getElementById("audit-info");

        if (!AuditInfoSection) {
            console.error("Required info section not found");
            return;
        }
        const user = userData?.data?.user?.[0];
        if (!user) {
            AuditInfoSection.innerHTML = '<p>No user data available</p>';
            return;
        }
        AuditInfoSection.innerHTML = `
            <h3>Audit Summary</h3>
            <p><strong>Up:</strong> ${user.totalUp || 'N/A'}</p>
            <p><strong>Down:</strong> ${user.totalDown || 'N/A'}</p>
            <p><strong>Audit Ratio:</strong> ${user.auditRatio ? user.auditRatio.toFixed(1) : 'N/A'}</p>
        `;

    } catch (error) {
        console.error('Error displaying Audit Ratio:', error);
        const AuditInfoSection = document.getElementById("audit-info");
        if (AuditInfoSection) {
            AuditInfoSection.innerHTML = '<p>Error loading Audit Ratio</p>';
        }
    }
}

/**
 * Displays the skills data in a radar chart
 * @param {Object} skillsData - The skills data object
 */

function displaySkills(skillsData) {
    try {
        const radarChartDiv = document.getElementById('radar-chart');
        if (!radarChartDiv) {
            console.error("Radar chart container not found");
            return;
        }

        const skillValue = new Map();

        // Process skills from user data
        if (skillsData?.data?.user?.[0]?.skills) {
            const skills = skillsData.data.user[0].skills;

            skills.forEach(skill => {
                if (skill.type && skill.type.startsWith('skill_')) {
                    skillValue.set(skill.type, skill.amount);
                }
            });
        }

        // Format the skills data for radar chart
        const skills = Array.from(skillValue.entries()).map(([name, value]) => {
            const cleanName = name.replace('skill_', '');
            const scaledValue = value > 100 ? 100 : value;

            return {
                name: cleanName,
                value: scaledValue
            };
        });

        if (skills.length > 0) {
            const radarChartSVG = radarChart(skills);
            radarChartDiv.innerHTML = radarChartSVG;
        } else {
            radarChartDiv.innerHTML = '<p>No skills data available</p>';
        }
    } catch (error) {
        console.error('Error displaying skills:', error);
        const radarChartDiv = document.getElementById('radar-chart');
        if (radarChartDiv) {
            radarChartDiv.innerHTML = '<p>Error loading skills data</p>';
        }
    }
}

/**
 *  Displays XP data in profile pgae and by top ten project in a bar chart
 * @param {Object} xpData - The XP data object 
 */
function displayXP(xpData) {
    try {
        const xpChartDiv = document.getElementById('xp-project-chart');
        const xpInfoSection = document.getElementById("xp-info");

        if (!xpChartDiv || !xpInfoSection) {
            console.error("XP container not found");
            return;
        }

        if (!xpData?.data?.transaction || xpData.data.transaction.length === 0) {
            xpChartDiv.innerHTML = '<p>No XP data available</p>';
            xpInfoSection.innerHTML = '<p>No XP data available</p>';
            return;
        }

        // Extract XP data from transactions
        const formattedXpData = xpData.data.transaction.map(transaction => ({
            amount: transaction.amount,
            path: transaction.path,
            createdAt: new Date(transaction.createdAt)
        }));

        // Filter XP data for school curriculum only (excluding piscine projects)
        const filteredXpData = formattedXpData.filter(xp =>
            (xp.path.startsWith('/gritlab/school-curriculum') && !xp.path.includes('/gritlab/school-curriculum/piscine-')) ||
            xp.path.endsWith('piscine-js')
        );

        const totalXP = filteredXpData.reduce((sum, t) => sum + t.amount, 0);

        let latestXP = { amount: 0, createdAt: new Date() };
        let highestXP = { amount: 0, path: 'N/A' };

        if (filteredXpData.length > 0) {
            latestXP = filteredXpData[0];
            highestXP = filteredXpData.reduce((max, t) => t.amount > max.amount ? t : max, filteredXpData[0]);
        }

        xpInfoSection.innerHTML = `
            <h3>XP Summary</h3>
            <p><strong>Total amount:</strong> ${totalXP || 'N/A'}</p>
            <p><strong>Latest recived:</strong> ${latestXP.amount} (${latestXP.createdAt.toLocaleDateString()})</p>
            <p><strong>Highest recived:</strong> ${highestXP.amount} (${highestXP.createdAt.toLocaleDateString()})</p>
            `;

        // Generate and render the XP chart
        const xpChartSVG = xpGraph(filteredXpData);
        xpChartDiv.innerHTML = xpChartSVG;
    } catch (error) {
        console.error('Error displaying XP by project:', error);
        const xpChartDiv = document.getElementById('xp-project-chart');
        if (xpChartDiv) {
            xpChartDiv.innerHTML = '<p>Error loading XP data</p>';
        }
        const xpInfoSection = document.getElementById("xp-info");
        if (xpInfoSection) {
            xpInfoSection.innerHTML = '<p>Error loading XP data</p>';
        }
    }
}