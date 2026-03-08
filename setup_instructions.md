# Setup Instructions

## Prerequisites
- Python 3.10 or higher
- Java 17 or higher
- Node.js 18 or higher
- MySQL
- Google Colab account (for running the translation pipeline)
- Mistral API key — get one free at https://console.mistral.ai
- ngrok account — get a free auth token at https://ngrok.com

---

## 1. Translation Pipeline (Google Colab)

1. Open `src/translator/Core_translator.ipynb` in Google Colab
2. Make sure you have a GPU runtime:
   - Runtime → Change runtime type → T4 GPU
3. Run the first cell — it will prompt you to authenticate with your Google account to mount Google Drive. Click the link, sign in, and paste the code back
4. Make sure the IndicTrans2 model files are saved in your Google Drive at the correct path — check the notebook for the exact folder path
5. Add your Mistral API key in the notebook where prompted:
```
   MISTRAL_API_KEY = "your_mistral_api_key_here"
```
6. Add your ngrok auth token where prompted:
```
   ngrok.set_auth_token("your_ngrok_token_here")
```
7. Run all cells from top to bottom
8. Wait for the FastAPI server to start — you will see a public ngrok URL like:
```
   https://xxxx-xx-xx-xxx-xx.ngrok-free.app
```
9. Copy this URL — you will need it for the backend setup

---

## 2. Backend (Spring Boot)

1. Open `src/backend/chatapp` in IntelliJ IDEA or VS Code
2. Make sure MySQL is running on your machine
3. Create a new database in MySQL:
```sql
   CREATE DATABASE your_db_name;
```
4. Copy `application.properties.template` and rename it to `application.properties`:
```
   src/backend/chatapp/src/main/resources/application.properties
```
5. Fill in your details:
```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/your_db_name
   spring.datasource.username=your_mysql_username
   spring.datasource.password=your_mysql_password
   translator.api.url=YOUR_NGROK_URL_FROM_COLAB
   spring.mail.username=your_email@gmail.com
   spring.mail.password=your_gmail_app_password
   cloudinary.api.key=your_cloudinary_key
   cloudinary.api.secret=your_cloudinary_secret
```
6. Run the Spring Boot application:
   - In IntelliJ: Click the Run button
   - In terminal:
```
     cd src/backend/chatapp
     ./mvnw spring-boot:run
```

---

## 3. Frontend (React)

1. Open a terminal inside `src/frontend/chat-frontend`
2. Install dependencies:
```
   npm install
```
3. Start the app:
```
   npm start
```
4. The app will open at `http://localhost:3000`

---

## 4. Usage

1. Register two users with different preferred languages
2. Log in as User A in one browser tab and User B in another
3. Send a message in any language — it will be automatically translated into the receiver's preferred language
4. The sender always sees their original message, the receiver always sees it in their own language

---

## Notes

- The ngrok URL changes every time you restart the Colab session — update `translator.api.url` in `application.properties` each time and restart the Spring Boot backend
- Make sure the Colab notebook is fully running before starting the Spring Boot backend
- MySQL must be running before starting the backend
- The IndicTrans2 model files must be present in your Google Drive — the notebook loads them from Drive to avoid re-downloading every session
- Never share your Mistral API key, ngrok token, or any credentials publicly
- For Gmail app password — go to Google Account → Security → 2-Step Verification → App Passwords
