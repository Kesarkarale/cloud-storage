# ☁️ CloudVault – Cloud Storage

CloudVault is a modern and secure cloud storage web application that allows users to upload, manage, organize, download, and delete their files through a clean and responsive dashboard.

The project is built using **Next.js, TypeScript, Tailwind CSS, Spring Boot, PostgreSQL and JWT Authentication**.

---

## 🚀 Features

### 🔐 Authentication
- User Registration
- User Login
- JWT-based Authentication
- Current User Profile
- Secure Logout
- Protected API endpoints

### 📁 File Management
- Upload files
- View uploaded files
- Download files
- Delete files
- File type detection
- File size display
- Recent files
- File search
- Grid/List view

### 📂 Folder Management
- Create folders
- Organize files into folders
- Folder navigation
- Folder-based file organization

### ⭐ File Organization
- Starred files
- Recent files
- Shared files
- Trash management

### 🎨 Modern UI
- Professional dashboard
- Light/Dark mode
- Responsive design
- Mobile sidebar
- Modern cards and modals
- Toast notifications
- User profile dropdown
- Notification panel
- Responsive file management interface

### 🛡️ Security
- JWT authentication
- Protected APIs
- Stateless authentication
- Secure backend architecture
- PostgreSQL database

---

## 🛠️ Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Lucide React Icons

### Backend

- Java 21
- Spring Boot
- Spring Security
- JWT
- Spring Data JPA
- Hibernate

### Database

- PostgreSQL

### Development Tools

- Git
- GitHub
- Maven
- npm

---

## 🏗️ Project Architecture

```text
CloudVault
│
├── frontend/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── files/
│   │   ├── recent/
│   │   ├── starred/
│   │   ├── shared/
│   │   ├── trash/
│   │   ├── settings/
│   │   └── login/
│   │
│   ├── components/
│   │   ├── DashboardShell.tsx
│   │   ├── FileCard.tsx
│   │   └── StorageCard.tsx
│   │
│   └── ...
│
└── backend/
    ├── src/
    │   └── main/
    │       ├── java/
    │       │   └── com.example.demo/
    │       │       ├── controller/
    │       │       ├── service/
    │       │       ├── repository/
    │       │       ├── model/
    │       │       ├── security/
    │       │       └── config/
    │       │
    │       └── resources/
    │           └── application.properties
    │
    └── pom.xml

 ---

##  👨‍💻 Developed By

Kesar Karale
