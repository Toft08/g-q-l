// input.js — fake user data for local dev and styling

export const fakeUserData = {
    user: [
        {
            attrs: {
                email: "johndoe@example.com",
                gender: "Male",
                lastName: "Doe",
                firstName: "John",
                tshirtSize: "L (Man)",
            },
            auditRatio: 0.8,
            campus: "gritlab",
            firstName: "John",
            id: 9999,
            lastName: "Doe",
            login: "jdoe",
            totalDown: 123456,
            totalUp: 654321,
            xps: [
                { amount: 50000, path: "/gritlab/school-curriculum/fake-project", createdAt: "2025-04-01T10:00:00+00:00" },
                { amount: 100000, path: "/gritlab/school-curriculum/another-project", createdAt: "2025-03-15T10:00:00+00:00" },
            ],
            skills: [
                { type: "skill_go", amount: 55, createdAt: "2025-04-29T12:24:46.912358+00:00" },
                { type: "skill_js", amount: 40, createdAt: "2025-04-22T10:19:06.174752+00:00" },
                { type: "skill_html", amount: 35, createdAt: "2025-02-07T10:42:53.983866+00:00" },
                { type: "skill_back-end", amount: 50, createdAt: "2025-04-29T12:24:46.912358+00:00" },
            ],
        },
    ],
};
