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

export function radarChart(skills) {
    if (!skills || skills.length === 0) {
        return '<svg width="600" height="600"><text x ="300" y="300" text-anchor="middle" fill="#000">No data provided</text></svg>';
    }

    const centerX = 300;
    const centerY = 300;
    const maxRadius = 200;
    const levels = 10;
    const angleSlice = (2 * Math.PI) / skills.length;

    let svg = `<svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg" style="background-color: #fff">`;

    // Draw background circles
    for (let level = 1; level <= levels; level++) {
        const radius = (maxRadius / levels) * level;
        svg += `<circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="none" stroke="#000" stroke-width="0.5" />`;
    }

    // Draw axes and labels
    skills.forEach((skill, i) => {
        const angle = i * angleSlice - Math.PI / 2;
        const x = centerX + maxRadius * Math.cos(angle);
        const y = centerY + maxRadius * Math.sin(angle);
        svg += `<line x1="${centerX}" y1="${centerY}" x2="${x}" y2="${y}" stroke="#000" stroke-width="1" />`;

        const labelDist = maxRadius + 15;
        const labelX = centerX + labelDist * Math.cos(angle);
        const labelY = centerY + labelDist * Math.sin(angle);
        const anchor = angle > Math.PI / 2 && angle < 3 * Math.PI / 2 ? 'end' : 'start';
        svg += `<text x="${labelX}" y="${labelY}" text-anchor="${anchor}" fill="#000">${skill.name}</text>`;
    });

    // Draw the radar polygon
    const points = skills.map((skill, i) => {
        const value = skill.value || 0;
        const angle = i * angleSlice - Math.PI / 2;
        const x = centerX + (maxRadius * value / 100) * Math.cos(angle);
        const y = centerY + (maxRadius * value / 100) * Math.sin(angle);
        return `${x},${y}`;
    });

    svg += `<polygon points="${points.join(' ')}" fill="rgba(0, 128, 0, 0.5)" stroke="green" stroke-width="2" />`;

    // Draw data points
    skills.forEach((skill, i) => {
        const value = skill.value || 0;
        const angle = i * angleSlice - Math.PI / 2;
        const x = centerX + (maxRadius * value / 100) * Math.cos(angle);
        const y = centerY + (maxRadius * value / 100) * Math.sin(angle);
        svg += `<circle cx="${x}" cy="${y}" r="4" fill="green" />`;
    });

    svg += `</svg>`;
    return svg;
}