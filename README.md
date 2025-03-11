# **ELD Project - Frontend** 🚛

## **Overview**  
The **Electronic Logging Device (ELD) System** is a web-based platform designed to help drivers track and manage their trips efficiently. It calculates distances between locations using the **Haversine formula** and provides detailed trip reports. The system allows drivers to log trip segments, monitor their driving history, and generate downloadable reports.  

---

![Screenshot 2025-03-11 084421](https://github.com/user-attachments/assets/e45780f1-0576-4dd6-b7f0-898bd50868fc)
![Screenshot 2025-03-11 084449](https://github.com/user-attachments/assets/4e162dd8-7aba-44e2-931a-6f81efb0ef85)


## **Tech Stack** 🛠️  

The frontend is built using modern technologies for an efficient and scalable user experience:  

- **React** (with TypeScript) – Component-based UI development  
- **React Router DOM** – Navigation and route management  
- **React Hook Form** & **Zod** – Form validation and management  
- **Axios** – API communication  
- **Tailwind CSS** – Styling and layout  
- **React Toastify** – Notifications and alerts  
- **React Leaflet** – Interactive maps for trip visualization  
- **Haversine Formula** – Calculates distance between two geographical points  

---

## **Key Features** 🚀  

### **1. Authentication & User Management**  
🔹 Secure login & registration for drivers  
🔹 Persistent authentication with JWT tokens  

### **2. Trip Management**  
✅ **Add New Trip:** Start and end location, distance, and duration  
✅ **Trip Segments:** Record multiple segments within a trip  
✅ **Trip Summary:** Displays total distance, required breaks, and rest periods  

### **3. ELD Log & Compliance Tracking**  
📌 **Automated Logging:** Records trip details for compliance  
📌 **Real-time Data:** Tracks driving time and required rests  

### **4. Driver Profile & Trip History**  
👤 **Profile Dashboard:** Displays past trips and statistics  
📂 **Download Trip Reports:** Generate and download trip summaries in PDF  

---

## **Setup & Installation** ⚙️  

### **1. Clone the Repository**  
```sh
git clone https://github.com/Kiro0oz/ELD-Trip-Planner.git
```

### **2. Install Dependencies**  
```sh
npm install
```

### **3. Start the Development Server**  
```sh
npm run dev
```

---

## **Haversine Formula - Distance Calculation** 📍  

The Haversine formula is used to compute the great-circle distance between two points on a sphere using latitude and longitude.  
<img width="439" alt="haversine" src="https://github.com/user-attachments/assets/e2739ad8-0c27-4415-b7d8-1b9c46e346d8" />

---

## **License** 📜  
This project is open-source and available under the **MIT License**.  

