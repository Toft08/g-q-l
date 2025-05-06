# GraphQL Profile Dashboard

A personal profile dashboard built with HTML, CSS, and JavaScript that authenticates users and visualizes data from the Gritlab GraphQL API using custom SVG charts.

---

## Features

- Login with email:password or username:password.
- Secure JWT authentication (Bearer token).
- GraphQL querying (normal, nested, with arguments).
- Profile displays:
  - User information
  - XP summary
  - Audit summary
  - A statistics section with two SVG graphs.
- Logout functionality.

---

## Technologies Used

- Frontend: **HTML**, **CSS**, **JavaScript**
- API: **GraphQL**
- Graphs: **Custom SVG**
- Hosting: [GitHub Pages](https://toft08.github.io/g-q-l/)

---

## Project structure

```
g-q-l/
├── assets/
│   ├── favicon.ico
│   └── styles.css
├── index.html
├── app.js
├── graph.js
├── query.js
└── README.md

```

## How to Run

### Live Version

Visit: https://toft08.github.io/g-q-l/

### Run Locally

1. Clone the repository:

```bash
git clone https://github.com/Toft08/g-q-l.git
cd g-q-l
```

2. Open index.html in your browser.

3. Enter your credentials to log in and explore your profile!
