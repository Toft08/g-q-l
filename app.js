// Login, logout and page control

let jwtToken = '';

document.getElementById('login-btn').addEventListener('click', login);
document.getElementById('logout-btn').addEventListener('click', logout);

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        document.getElementById('error-msg').innerText = "Please enter credentials.";
        return;
    }

    const response = await fetch('https://((DOMAIN))/api/auth/signin', {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + btoa(`${username}:${password}`)
        }
    });

    if (response.ok) {
        const data = await response.json();
        jwtToken = data.token; // store JWT
        loadProfile();
    } else {
        document.getElementById('error-msg').innerText = "Invalid credentials.";
    }
}

function logout() {
    jwtToken = '';
    document.getElementById('profile-page').style.display = 'none';
    document.getElementById('login-page').style.display = 'block';
}

async function loadProfile() {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('profile-page').style.display = 'block';

    const userInfo = await getUserInfo(jwtToken);
    const results = await getResults(jwtToken);

    document.getElementById('user-info').innerText = `User: ${userInfo.data.user[0].login}`;

    // Example data for graphs
    createXPGraph([100, 300, 500, 700, 900]); 
    createPassFailGraph(15, 5); 
}
