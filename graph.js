// Functions to build SVG graphs

// XP Progress Line Graph
function createXPGraph(data) {
    const graph = document.getElementById('graph1');
    graph.innerHTML = `
        <svg width="300" height="200">
            <polyline
                fill="none"
                stroke="blue"
                stroke-width="2"
                points="${data.map((xp, i) => `${i * 30},${200 - xp / 10}`).join(' ')}"
            />
        </svg>
    `;
}

// Project Pass/Fail Pie Chart
function createPassFailGraph(pass, fail) {
    const graph = document.getElementById('graph2');
    const total = pass + fail;
    const passPercent = (pass / total) * 360;
    const failPercent = (fail / total) * 360;

    graph.innerHTML = `
        <svg width="200" height="200" viewBox="0 0 32 32">
            <circle r="16" cx="16" cy="16" fill="lightgrey"></circle>
            <path d="M16 16 L16 0 A16 16 0 ${passPercent > 180 ? 1 : 0} 1 ${16 + 16 * Math.sin(passPercent * Math.PI/180)} ${16 - 16 * Math.cos(passPercent * Math.PI/180)} Z" fill="green"></path>
        </svg>
    `;
}
