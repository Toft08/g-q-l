import { getUserInfo, getResults, getSkills } from './query.js';
import { xpGraph, radarChart } from './graph.js';

const LOGIN_Path = 'https://01.gritlab.ax/api/auth/signin'
const GraphQL_ENDPOINT = 'https://01.gritlab.ax/api/graphql-engine/v1/graphql'
let jwtToken = '';


document.addEventListener('DOMContentLoaded', () => {
    // Set initiall display for pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.add('hidden'));

    // if JWT token exists, load profile
    const storedToken = localStorage.getItem('JWT');
    if (storedToken) {
        jwtToken = storedToken;
        loadProfile();
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
 * Load the user profile and display it
 */
async function loadProfile() {
    showPage('profile-page');

    try {
        const [userInfo, xpResults, skillsData] = await Promise.all([
            getUserInfo(jwtToken),
            getResults(jwtToken),
            getSkills(jwtToken)
        ]);

        // debugging
        console.log('User Info:', userInfo);
        console.log('XP Results:', xpResults);
        console.log('Skills Data:', skillsData);

        if (userInfo?.data?.user?.[0]?.login) {
            document.getElementById('user-name').innerText = `${userInfo.data.user[0].login}`;
        }

        displayUserInfo(userInfo);
        displayAuditRatio(userInfo);
        displaySkills(skillsData);
        displayXPByProject(xpResults);
    } catch (error) {
        console.error('Error loading profile:', error);
        document.getElementById('error-msg').innerText = '<p>Error loading profile data</p>';
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

function displayAuditRatio(userData) {
    try {
        const AuditInfoSection = document.getElementById("audit-info");
        if (!AuditInfoSection) {
            console.error("XP Audit Info section not found");
            return;
        }
        const user = userData?.data?.user?.[0];
        if (!user) {
            AuditInfoSection.innerHTML = '<p>No user data available</p>';
            return;
        }
        AuditInfoSection.innerHTML = `
            <h3>XP Audit Ratio</h3>
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

function displayXPRatio(userData) {
    try {
        const AuditInfoSection = document.getElementById("audit-info");
        if (!AuditInfoSection) {
            console.error("XP Audit Info section not found");
            return;
        }
        const user = userData?.data?.user?.[0];
        if (!user) {
            AuditInfoSection.innerHTML = '<p>No user data available</p>';
            return;
        }
        AuditInfoSection.innerHTML = `
            <h3>XP Audit Ratio</h3>
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

        console.log('Processed Skill Map:', skillValue);

        // Format the skills data for radar chart
        const skills = Array.from(skillValue.entries()).map(([name, value]) => {
            const cleanName = name.replace('skill_', '');
            const scaledValue = value > 100 ? 100 : value;

            return {
                name: cleanName,
                value: scaledValue
            };
        });

        console.log('Processed skills for radar chart:', skills);

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
 *  Displays XP data by project in a bar chart
 * @param {Object} xpData - The XP data object 
 */
function displayXPByProject(xpData) {
    try {
        const xpChartDiv = document.getElementById('xp-project-chart');
        if (!xpChartDiv) {
            console.error("XP chart container not found");
            return;
        }

        if (!xpData?.data?.transaction || xpData.data.transaction.length === 0) {
            xpChartDiv.innerHTML = '<p>No XP data available</p>';
            return;
        }

        // Extract XP data from transactions
        const formattedXpData = xpData.data.transaction.map(transaction => ({
            amount: transaction.amount,
            path: transaction.path,
            createdAt: new Date(transaction.createdAt)
        }));

        console.log('XP Data for Graph:', formattedXpData);

        // Generate and render the XP chart
        const xpChartSVG = xpGraph(formattedXpData);
        xpChartDiv.innerHTML = xpChartSVG;
    } catch (error) {
        console.error('Error displaying XP by project:', error);
        const xpChartDiv = document.getElementById('xp-project-chart');
        if (xpChartDiv) {
            xpChartDiv.innerHTML = '<p>Error loading XP data</p>';
        }
    }
}
