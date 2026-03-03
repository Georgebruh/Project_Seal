# 🦭 Project Seal
**Secure, transparent, and seamless agreements for the modern freelancer.**

[![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E)](https://supabase.io/)
[![PayMongo](https://img.shields.io/badge/PayMongo-00E676?style=for-the-badge&logo=stripe&logoColor=white)](#)

## 📖 The Pitch
In the Philippines, a vast majority of gig work happens informally through social media and messaging apps, operating purely on a "Kaliwaan" (handshake) basis. This reliance on blind trust leaves an entire "Invisible Workforce" vulnerable to ghosting, wage theft, and endless anxiety over altered e-wallet payment screenshots. 

While platforms like Upwork or Fiverr exist, they aren't the solution for the local, off-platform worker. They charge exorbitant commission fees of up to 20%, enforce strict ecosystem rules that punish users for bringing their own clients, and simply aren't designed to secure deals with people you already know. Furthermore, because informal transactions are buried in private Facebook or WhatsApp chats, these workers build no verifiable work history. To banks, they are practically unemployed, leaving them locked out of basic financial services like loans or credit cards.

**Project Seal** eliminates this friction. 

We provide a secure, neutral platform where project terms are sealed, and funds are handled transparently. By bridging the trust gap, Project Seal not only protects both parties from fraud but also creates a professional, verifiable ledger of transactions—empowering the invisible workforce to finally build a recognized professional reputation while giving clients absolute peace of mind.

## ✨ What It Does
Project Seal provides a dedicated ecosystem for both sides of the freelance equation:

* **Dual-Sided Dashboards:** Distinct, tailored experiences for both Clients and Freelancers to track active projects and historical data.
* **"Sealing" the Deal:** Users can create and manage "Seals" (secure project agreements) detailing the scope of work, deliverables, and payment terms.
* **Secure Checkouts:** Integrated payment processing ensures that funds are captured safely before work begins and released when milestones are met.
* **Real-time Notifications:** Keep both parties synced on project updates, payment successes, and required actions.

## 💻 Visual Proof
*(Demo video and screenshots are currently in production and will be uploaded prior to final submission. Stay tuned!)*
![alt text](<Screenshot from 2026-03-03 14-20-42.png>)
![alt text](<Screenshot from 2026-03-03 14-31-58.png>)


## 🛠️ How We Built It
We engineered Project Seal with a modern, type-safe, and highly scalable stack:

* **Frontend:** Built with **Vue.js 3** (Composition API) and **TypeScript** for a robust, reactive user interface.
* **State Management:** Powered by **Pinia** for predictable state across dashboards and authentication flows.
* **Backend & Database:** Leveraged **Supabase** for rapid backend development, utilizing its PostgreSQL database, secure Authentication, and Edge Functions.
* **Payments:** Integrated **PayMongo** via Supabase Edge Functions (`create-paymongo-checkout`) to handle secure financial transactions.

## 🚀 The Hackathon Journey
* **The Challenge:** Trying to separate the tools of a Freelancer and a Client were tricky, as the user can be both at the same time. Syncing their data depending on what type of "mode" they are currently in definitely was a headache.
* **The Accomplishment:** We are incredibly proud of successfully implementing a seamless flow from agreement creation to secure payment processing within the tight hackathon timeframe. 
* **The Takeaway:** Working with supabase allowed us to utilize once of its greatest features, which are edge functions to implement a working testing environment for Paymongo.

## ⚙️ Running Project Seal Locally

Want to test out the platform? Follow these steps:

### Prerequisites
* Node.js (v18+ recommended)
* npm or yarn
* A Supabase account
* A PayMongo developer account

### Setup Instructions

1. **Clone the repository:**
```bash
git clone https://github.com/georgebruh/project_seal
cd project_seal
```

2. **Install Dependencies:**
```bash
npm install
```

3. **Configure Environmental Variables:**
Create a `.env` file in the root directory and add your required keys:
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
# Add any other required keys here
```

4. **Run the development server:**
```bash
npm run dev
```

## 🔮 What's Next for Project Seal?
While we achieved our MVP for this hackathon, our vision extends much further:
* **Dispute Resolution:** Implementing a mediation system for when project scopes shift.
* **Milestone Payments:** Allowing complex projects to be broken down into fractional payment releases.
* **Portfolio Integration:** Allowing freelancers to publicly display completed, highly-rated "Seals" as verified proof of work.

