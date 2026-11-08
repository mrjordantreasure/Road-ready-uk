!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Home - RoadReady UK</title>
        <link rel="stylesheet" href="styles.css">
        </head>
        <body>

          <header>
              <h1>🚗 RoadReady UK</h1>
                  <nav>
                        <a href="lessons.html">Lessons</a>
                              <a href="mock-test.html">Mock Test</a>
                                    <a href="progress.html">My Progress</a>
                                          <a href="safety.html">Safety</a>
                                                <a href="hazard.html">Hazards</a>
                                                      <button onclick="signOutUser()" class="sign-out-btn">Sign Out</button>
                                                          </nav>
                                                            </header>

                                                              <main>
                                                                  <h2>Welcome to RoadReady UK!</h2>
                                                                      <p>Your driving theory practice hub.</p>

                                                                          <div class="welcome-card">
                                                                                <p id="userEmail">Loading your account...</p>
                                                                                    </div>

                                                                                        <div class="quick-links">
                                                                                              <a href="lessons.html" class="card">
                                                                                                      <h3>📖 Learn</h3>
                                                                                                              <p>Study driving theory topics</p>
                                                                                                                    </a>
                                                                                                                          <a href="mock-test.html" class="card">
                                                                                                                                  <h3>📝 Mock Test</h3>
                                                                                                                                          <p>Test your knowledge</p>
                                                                                                                                                </a>
                                                                                                                                                      <a href="progress.html" class="card">
                                                                                                                                                              <h3>📊 My Progress</h3>
                                                                                                                                                                      <p>Track your learning</p>
                                                                                                                                                                            </a>
                                                                                                                                                                                </div>
                                                                                                                                                                                  </main>

                                                                                                                                                                                    <script type="module" src="script.js"></script>
                                                                                                                                                                                      <script type="module">
                                                                                                                                                                                          import { auth } from './script.js';
                                                                                                                                                                                              import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

                                                                                                                                                                                                  onAuthStateChanged(auth, (user) => {
                                                                                                                                                                                                        if (!user) {
                                                                                                                                                                                                                // Not logged in — go to login page
                                                                                                                                                                                                                        window.location.href = "login.html";
                                                                                                                                                                                                                              } else {
                                                                                                                                                                                                                                      // Logged in — show their email
                                                                                                                                                                                                                                              document.getElementById('userEmail').textContent = 
                                                                                                                                                                                                                                                        `Welcome back! You're logged in as: ${user.email}`;
                                                                                                                                                                                                                                                              }
                                                                                                                                                                                                                                                                  });
                                                                                                                                                                                                                                                                    </script>

                                                                                                                                                                                                                                                                    </body>
                                                                                                                                                                                                                                                                    </html>
