// GraphQL Queries

// Normal Query: Get basic user info
async function getUserInfo(token) {
    const query = `
        {
            user {
            id
            login
            }
        }
    `;
    return await graphqlRequest(query, token);
}  
  // Nested Query: Get result + user login
async function getResults(token) {
    const query = `
        {
            result {
                id
                user {
                    login
                }
            }
        }
    `;
    return await graphqlRequest(query, token);
}

// Query with arguments: Get a specific object by ID
async function getObjectById(token, objectId) {
    const query = `
        {
            object(where: { id: { _eq: ${objectId} }}) {
                name
                type
            }
        }
    `;
    return await graphqlRequest(query, token);
}

// Reusable fetcher
async function graphqlRequest(query, token) {
    const res = await fetch('https://((DOMAIN))/api/graphql-engine/v1/graphql', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
    body: JSON.stringify({ query })
    });
    return res.json();
}
