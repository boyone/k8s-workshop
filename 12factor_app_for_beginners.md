
# 🧠 The 12 Factor App – Explained for Beginners

The **12 Factor App** is a set of best practices for building **modern web apps** that are **easy to deploy, scale, and maintain**, especially in the **cloud**.

---

## 1. 📦 Codebase
**“One codebase, many deploys”**

- Use **a single code repository** per app.
- Deploy to different environments (staging, production) using the same code.

🛠 Example: A Git repo for your backend, deployed to both staging and production.

---

## 2. 📚 Dependencies
**“Explicitly declare and isolate dependencies”**

- List all libraries your app needs using tools like `npm`, `pip`, etc.
- Don’t rely on server-installed software.

🛠 Example: Use `package.json` in Node.js to declare packages.

---

## 3. ⚙️ Config
**“Store config in the environment”**

- Use **environment variables** for sensitive or environment-specific settings.

🛠 Example: Set `DB_PASSWORD` via `.env` or Docker `-e` flags.

---

## 4. 🔌 Backing Services
**“Treat services like MySQL, Redis as attached resources”**

- Connect to external services via config so they can be swapped easily.

🛠 Example: Switch from MySQL to PostgreSQL by changing an env variable.

---

## 5. 🔨 Build, Release, Run
**“Separate stages: build → release → run”**

- **Build**: Compile or package your app.
- **Release**: Combine code with config.
- **Run**: Execute it.

🛠 Example: Don’t edit code after the release. Treat builds as immutable.

---

## 6. ⚙️ Processes
**“Run your app as one or more stateless processes”**

- Avoid keeping data in local memory or disk.

🛠 Example: Use S3 or databases instead of saving files locally.

---

## 7. 🔉 Port Binding
**“Expose services via a port”**

- Your app should run standalone and bind to a port for communication.

🛠 Example: A Node.js app using `express` listens on `process.env.PORT`.

---

## 8. 📈 Concurrency
**“Scale by running multiple instances of processes”**

- Support horizontal scaling.

🛠 Example: Run multiple containers using Docker/Kubernetes.

---

## 9. 💥 Disposability
**“Start fast, shut down gracefully”**

- Ensure fast startup and clean shutdowns.

🛠 Example: Catch SIGTERM in your app to close DB connections.

---

## 10. 🌍 Dev/Prod Parity
**“Keep dev, staging, and prod as similar as possible”**

- Prevent “it works on my machine” issues.

🛠 Example: Use Docker for consistent environments.

---

## 11. 📜 Logs
**“Treat logs as event streams”**

- Output logs to stdout/stderr; let external systems handle them.

🛠 Example: Use cloud logging tools or Docker log drivers.

---

## 12. 🛠 Admin Processes
**“Run one-off tasks as one-time processes”**

- Run management tasks separately from the main app.

🛠 Example: Use `npm run migrate` or `flask shell`.

---

## ✅ Summary Table

| Principle        | Benefit                          |
|------------------|----------------------------------|
| Stateless         | Easy scaling                    |
| Config-driven     | Easy deployment                 |
| Dependency mgmt   | Avoids “it works on my laptop”  |
| Process-based     | Resilient design                |

---

[docker workshop: The 12 Factor App](./docker_workshop.md#the-12-factor-appenth)
