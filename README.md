# YourExodus — Bible Study Dashboard Front End

## Overview

**YourExodus** is a full-stack Bible study and personal faith application designed to provide users with a structured space to explore Bible studies, record journal entries, manage prayers, and track their spiritual growth.

This repository contains the **front-end application** for YourExodus. The front end communicates with a REST API to retrieve and manage application data.

The project demonstrates hands-on experience building a responsive web application that connects a JavaScript front end to a Python-based backend API.

---

## Features

* 📖 Bible Study Dashboard
* 🙏 Prayer Dashboard
* 📝 Personal Journal
* 📚 Bible Study Categories
* 🔐 User-based content
* 👤 User authentication and session handling
* ✅ Study completion tracking
* 🎥 YouTube/video resources
* 🛠️ Administrative functionality
* 📱 Responsive browser-based interface
* 🔗 REST API integration

---

## Front-End Technologies

* HTML5
* CSS3
* JavaScript
* REST API
* JSON
* Local Storage
* Responsive Web Design

---

## Application Architecture

The front end communicates with the YourExodus REST API.

```text
┌─────────────────────────────┐
│       YourExodus UI         │
│                             │
│ HTML / CSS / JavaScript     │
└──────────────┬──────────────┘
               │
               │ HTTP / JSON
               ▼
┌─────────────────────────────┐
│       YourExodus API        │
│                             │
│ Python / Flask              │
│ Flask-Smorest               │
│ SQLAlchemy                  │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│        PostgreSQL           │
│                             │
│ Users / Studies / Journals  │
│ Prayers / Categories        │
└─────────────────────────────┘
```

---

## Project Structure

```text
frontend/
│
├── index.html
├── biblestudy.html
├── biblestudy.js
├── journal.html
├── journal.js
├── prayer.html
├── prayer.js
├── styles.css
└── README.md
```

> File names may vary as the application continues to evolve.

---

## Bible Study Dashboard

The Bible Study Dashboard allows users to:

1. View available Bible studies
2. Browse studies by category
3. Open individual studies
4. Read scripture and study content
5. Access related video resources
6. Mark studies as completed

Example workflow:

```text
User
  │
  ▼
Bible Study Dashboard
  │
  ├── Select Category
  │
  ├── Select Study
  │
  ▼
Study Details
  │
  ├── Scripture
  ├── Study Content
  ├── Video
  └── Mark Complete
```

---

## Journal Dashboard

The Journal Dashboard provides users with a personal space to record reflections and maintain journal entries.

Journal data is associated with the current user so that entries remain connected to the appropriate account.

---

## Prayer Dashboard

The Prayer Dashboard provides a dedicated interface for recording and managing prayer requests.

The application uses the REST API to communicate with the backend and persist user information.

---

## API Integration

The front end communicates with the YourExodus API using HTTP requests.

Example:

```javascript
fetch(`${API_URL}/biblestudies`)
  .then(response => response.json())
  .then(data => {
      // Process Bible study data
  });
```

The API provides endpoints for application resources such as:

```text
/users
/biblestudies
/categories
/journals
/prayers
```

---

## User Data

The application uses browser Local Storage for selected client-side session information.

For example:

```javascript
localStorage.setItem("username", username);
```

The front end uses this information when determining which user is currently interacting with the application.

---

## Error Handling

The application handles API responses and provides user feedback when requests fail.

Examples include:

* Authentication errors
* Invalid requests
* Missing data
* API/server errors
* Failed resource requests

This allows the application to provide a more useful experience than simply exposing raw API errors to the user.

---

## Development

To run the front end locally:

```text
1. Clone the repository.
2. Open the project in your development environment.
3. Start the YourExodus API.
4. Configure the front end with the API URL.
5. Open the appropriate HTML page in a browser.
```

The API is responsible for database operations and persistent application data.

---

## What This Project Demonstrates

This project demonstrates practical experience with:

* Front-end web development
* JavaScript application logic
* REST API integration
* JSON data handling
* Authentication/session concepts
* Local Storage
* CRUD-style application workflows
* Responsive UI development
* Debugging front-end/API communication
* Connecting a browser application to a Python backend
* Working with PostgreSQL-backed applications

---

## Future Improvements

Potential future enhancements include:

* Improved authentication and token management
* Additional Bible study categories
* Search and filtering
* Expanded study tracking
* Enhanced mobile responsiveness
* Additional administrative tools
* Improved accessibility
* Expanded API integration
* Automated front-end testing

---

## Project

**YourExodus**

A full-stack application combining faith-based content with practical software development.

**Front End:** HTML / CSS / JavaScript
**Back End:** Python / Flask
**Database:** PostgreSQL
**API:** REST

---

## Author

**Marlainna Francis**

Full-Stack / Data / Mainframe Technology Portfolio

LinkedIn: `https://www.linkedin.com/in/iknowhowtoskills`


