export { getUserInfo, getResults, getSkills };

// Normal Query: Get basic user info
async function getUserInfo(token) {
    const query = `
        query{
            user {
                id
                firstName
                lastName
                campus
                login
                auditRatio
                totalUp
                totalDown
                xps {
                    amount
                    path
                }
                attrs
            }
        }
    `;
    return await graphqlRequest(query, token);
}

async function getResults(token) {
    const query = `
        query {
            transaction(
                where: {type: {_eq: "xp"}}
                order_by: {createdAt: desc}
                ) {
                    amount
                    createdAt
                    path
            }
        }
    `;
    return await graphqlRequest(query, token);
}

// Get skills from user.transactions
async function getSkills(token) {
    const query = `
        query {
            user {
                skills: transactions(
                    order_by: [{type: desc}, {amount: desc}]
                    distinct_on: [type]
                    where: {type: {_like: "skill%"}}
                ) {
                    type
                    amount
                    createdAt
                }
            }
        }
    `;
    return await graphqlRequest(query, token);
}

// Reusable fetcher
async function graphqlRequest(query, token) {
    const res = await fetch('https://01.gritlab.ax/api/graphql-engine/v1/graphql'
        , {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
        });
    return res.json();
}
