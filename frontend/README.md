# Farmer Application

Farmer Application is a comprehensive platform designed to assist farmers in managing their agricultural activities efficiently. The application provides tools for managing finances, labor, transportation, and more, ensuring streamlined operations and better productivity.

## Features

- **Dashboard**: Overview of all key metrics and activities.
- **Money Records**: Track financial transactions and generate reports.
- **Labour Management**: Manage labor groups, attendance, and payments.
- **Transportation**: Record and monitor transportation activities.
- **Lot Numbers**: Manage and track lot numbers for produce.
- **Field Management**: Organize and monitor field activities.
- **Reports**: Generate detailed reports for better insights.
- **Authentication**: Secure login and signup functionality.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## Technologies Used

### Frontend

- **React.js**: For building the user interface.
- **Tailwind CSS**: For styling and responsive design.
- **Context API**: For state management.
- **i18n**: For multi-language support.

### Backend

- **FastAPI**: For building the RESTful API.
- **SQLAlchemy**: For database interactions.
- **PostgreSQL**: As the database.
- **JWT**: For secure authentication.

## Installation

### Prerequisites

- Node.js (v16 or higher)
- Python (v3.9 or higher)
- PostgreSQL

### Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

### Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv env
   ```
3. Activate the virtual environment:
   - On Windows:
     ```bash
     .\env\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source env/bin/activate
     ```
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Start the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```

## Usage

1. Open the frontend in your browser at `http://localhost:3000`.
2. Ensure the backend is running at `http://127.0.0.1:8000`.
3. Login or signup to access the application.
4. Navigate through the various sections to manage your farming activities.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add your message here"
   ```
4. Push to the branch:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to the open-source community for providing amazing tools and libraries.
- Special thanks to all contributors who made this project possible.

---

**Note**: This application is under active development. For any issues or feature requests, please open an issue in the repository.
