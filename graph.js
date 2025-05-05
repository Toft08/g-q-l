// XP Progress Bar Chart - SVG generator
export function xpGraph(xpData) {
    if (!xpData || xpData.length === 0) {
        return '<svg width="800" height="400"><text x="400" y="200" text-anchor="middle" fill="#000">No XP data available</text></svg>';
    }

    // Filter XP data by project path (ignores checkpoint & piscine projects)
    const filteredXP = xpData.filter(xp => {
        const path = xp.path;
        return (
            path.startsWith('/gritlab/school-curriculum') &&
            !path.includes('/checkpoint-') &&
            !path.includes('/piscine-')
        );
    });

    console.log('Filtered XP Data:', filteredXP);
    // Group XP by project name
    const projectXP = new Map();
    filteredXP.forEach(item => {
        const segments = item.path.split('/');
        const projectName = segments[3]; // Customize this as needed
        projectXP.set(projectName, (projectXP.get(projectName) || 0) + item.amount);
    });

    // Get top 10 projects by XP
    const sortedProjects = Array.from(projectXP.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    // Chart dimensions
    const width = 800, height = 400;
    const margin = { top: 20, right: 30, bottom: 120, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const barWidth = chartWidth / sortedProjects.length * 0.7;
    const barSpacing = chartWidth / sortedProjects.length * 0.3;
    const rawMaxXP = Math.max(...sortedProjects.map(p => p[1]));
    const maxXP = Math.ceil(rawMaxXP / 10000) * 10000;

    // Scale XP to chart height
    const yScale = value => chartHeight - (value / maxXP) * chartHeight;

    let svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <style>
        .bar { fill: #4682B4; }
        .bar:hover { fill: #6495ED; }
        .axis { stroke: #333; stroke-width: 1; }
        .axis-label { font-size: 12px; fill: #333; }
        .title { font-size: 16px; font-weight: bold; text-anchor: middle; }
    </style>
    <g transform="translate(${margin.left}, ${margin.top})">
        <text class="title" x="${chartWidth / 2}" y="-5">XP Earned by Project</text>
        <line class="axis" x1="0" y1="0" x2="0" y2="${chartHeight}" />
    `;

    // Y-axis grid and labels
    const ticks = 10;
    for (let i = 0; i <= ticks; i++) {
        const value = (maxXP / ticks) * i;
        const y = chartHeight - (i / ticks) * chartHeight;

        svg += `
            <line class="axis" x1="-5" y1="${y}" x2="0" y2="${y}" />
            <text class="axis-label" x="-10" y="${y + 5}" text-anchor="end">${Math.round(value).toLocaleString()}</text>
        `;
    }

    // X-axis line
    svg += `<line class="axis" x1="0" y1="${chartHeight}" x2="${chartWidth}" y2="${chartHeight}" />`;

    // Draw bars and labels
    sortedProjects.forEach((project, index) => {
        const [projectName, xpAmount] = project;
        const x = index * (barWidth + barSpacing);
        const y = yScale(xpAmount);
        const barHeight = chartHeight - y;

        svg += `
        <g>
            <rect 
                class="bar" 
                x="${x}" 
                y="${y}" 
                width="${barWidth}" 
                height="${barHeight}"
            >
                <title>${projectName}: ${xpAmount.toLocaleString()} XP</title>
            </rect>
            <text 
                class="axis-label" 
                x="${x + barWidth / 2}" 
                y="${chartHeight + 15}" 
                text-anchor="end" 
                transform="rotate(-45, ${x + barWidth / 2}, ${chartHeight + 15})"
            >
                ${projectName}
            </text>
        </g>
        `;
    });

    svg += `</g></svg>`;
    return svg;
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