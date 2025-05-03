import { getUserInfo, getResults, getSkills } from './query.js';
import { radarChart } from './graph.js';

const LOGIN_Path = 'https://01.gritlab.ax/api/auth/signin'
const GraphQL_ENDPOINT = 'https://01.gritlab.ax/api/graphql-engine/v1/graphql'
let jwtToken = '';

// This needs to be reworked
document.addEventListener('DOMContentLoaded', () => {
    // if JWT token exists, load profile
    const storedToken = localStorage.getItem('JWT');
    if (storedToken) {
        jwtToken = storedToken;
        loadProfile();
    } else {
        document.getElementById('login-page').style.display = 'block';
        document.getElementById('profile-page').style.display = 'none';
    }

    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // prevent form from refreshing the page
        login();
    });

    // Connect logout button
    document.getElementById('logout-btn').addEventListener('click', logout);
});

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
 * Clears the JWT token and hides the profile page
 */
function logout() {
    jwtToken = '';
    localStorage.removeItem('JWT');
    document.getElementById('profile-page').style.display = 'none';
    document.getElementById('login-page').style.display = 'block';
}
/**
 * Load the user profile and display it
 */
async function loadProfile() {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('profile-page').style.display = 'block';

    const userInfo = await getUserInfo(jwtToken);
    const xpResults = await getResults(jwtToken);
    const skillsData = await getSkills(jwtToken);

    // debugging
    console.log('User Info:', userInfo);
    console.log('XP Results:', xpResults);
    console.log('Skills Data:', skillsData);

    document.getElementById('user-name').innerText = `${userInfo.data.user[0].login}`;

    displayUserInfo();
    displaySkills();
}

async function displayUserInfo() {
    try {
        const data = await getUserInfo(jwtToken);
        const user = data?.data?.user?.[0];
        if (!user) return;

        document.getElementById("user-info").innerHTML = `
        <p><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
        <p><strong>Username:</strong> ${user.login}</p>
        <p><strong>ID:</strong> ${user.id}</p>
        <p><strong>Email:</strong> ${user.attrs?.email}</p>
        <p><strong>Campus:</strong> ${user.campus}</p>
        <p><strong>Nationality:</strong> ${user.attrs?.nationality}</p>
        <p><strong>Audit Ratio:</strong> ${user.auditRatio.toFixed(1)}</p>
    `;
    } catch (error) {
        console.error('Error displaying user info:', error);
    }
}

async function displaySkills() {
    try {
        const data = await getSkills(jwtToken);
        const skillValue = new Map();
        console.log('Skills Data in display:', data);

        // Process skills from user.transactions with type like 'skill%'
        if (data?.data?.user?.[0]?.skills) {
            const skills = data.data.user[0].skills;

            skills.forEach(skill => {
                if (skill.type && skill.type.startsWith('skill_')) {
                    skillValue.set(skill.type, skill.amount);
                }
            });
        }

        console.log('Processed Skill Map:', skillValue);

        // If we still don't have skills, use hardcoded data for testing
        // if (skillValue.size === 0) {
        //     console.log('No skill data found, using hardcoded data');
        //     skillValue.set('skill_js', 40);
        //     skillValue.set('skill_front-end', 45);
        //     skillValue.set('skill_back-end', 50);
        //     skillValue.set('skill_go', 55);
        //     skillValue.set('skill_game', 10);
        //     skillValue.set('skill_sys-admin', 5);
        //     skillValue.set('skill_docker', 15);
        //     skillValue.set('skill_html', 35);
        //     skillValue.set('skill_sql', 25);
        //     skillValue.set('skill_algo', 35);
        //     skillValue.set('skill_unix', 15);
        //     skillValue.set('skill_tcp', 30);
        //     skillValue.set('skill_css', 15);
        //     skillValue.set('skill_prog', 50);
        // }

        // format the skills data for radar chart
        const skills = Array.from(skillValue.entries()).map(([name, value]) => {
            // Clean up the skill name by removing 'skill_' prefix
            const cleanName = name.replace('skill_', '');

            // Scale values to fit the chart (assuming values could be large)
            const scaledValue = value > 100 ? 100 : value;

            return {
                name: cleanName,
                value: scaledValue
            };
        });

        console.log('Processed skills for radar chart:', skills);

        // Generate and render the radar chart
        const radarChartSVG = radarChart(skills);
        document.getElementById('radar-chart').innerHTML = radarChartSVG;
    } catch (error) {
        console.error('Error displaying skills:', error);
    }
}

