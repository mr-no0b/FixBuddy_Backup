# Database Seed Script

## Overview
Populates MongoDB database with sample data for testing and development.

---

## What Gets Created

### 👥 **5 Users**
- **john_repairman** (850 reputation) - Professional technician
- **sarah_techie** (620 reputation) - DIY enthusiast  
- **mike_fixer** (450 reputation) - Refrigeration specialist
- **lisa_helper** (280 reputation) - Active learner
- **david_novice** (50 reputation) - Beginner

**All users have password:** `password123`

---

### 🏷️ **10 Tags**
- refrigerator ❄️
- washing machine 🧺
- dishwasher 🍽️
- microwave 📡
- oven 🔥
- dryer 🌀
- water heater 💧
- electrical ⚡
- diy 🔧
- maintenance 🛠️

---

### ❓ **8 Questions**
Realistic questions about common appliance issues:
- Refrigerator not cooling
- Washing machine making noise
- Dishwasher not draining
- Microwave not heating
- Oven temperature issues
- Dryer taking too long
- Water heater sounds
- General maintenance tips

Each question includes:
- Detailed content
- Relevant tags (1-2 per question)
- View counts (65-420 views)
- Vote counts (5-31 votes)
- Realistic timestamps (within last 30 days)

---

### 💬 **22 Answers**
- 1-4 answers per question
- Various answer styles (DIY tips, professional advice, personal experiences)
- Some answers are marked as "accepted" (solved status)
- Vote counts assigned
- Timestamps after parent question

---

### 💭 **10 Comments**
- Comments on questions
- Comments on answers
- Realistic follow-up questions and thank-you messages

---

## How to Run

### First Time Setup
```bash
# Make sure MongoDB is running
# Default: mongodb://localhost:27017/fixbuddy

# Install dependencies
npm install
```

### Run Seed
```bash
npm run seed
```

### What Happens
1. ✅ Connects to MongoDB
2. 🗑️ Clears ALL existing data (Users, Questions, Answers, Tags, Comments)
3. 👤 Creates 5 users with hashed passwords
4. 🏷️ Creates 10 tags
5. ❓ Creates 8 questions with proper relationships
6. 💬 Creates 22 answers (some accepted)
7. 💭 Creates 10 comments
8. 📊 Prints summary
9. 🔌 Closes connection

**⚠️ WARNING:** This script will **DELETE ALL EXISTING DATA** before seeding!

---

## Test Credentials

You can login with any of these accounts:

| Email | Username | Reputation | Role |
|-------|----------|------------|------|
| john@fixbuddy.com | john_repairman | 850 | Expert |
| sarah@fixbuddy.com | sarah_techie | 620 | Enthusiast |
| mike@fixbuddy.com | mike_fixer | 450 | Specialist |
| lisa@fixbuddy.com | lisa_helper | 280 | Helper |
| david@fixbuddy.com | david_novice | 50 | Beginner |

**Password for all:** `password123`

---

## Testing After Seed

### 1. Test Authentication
Go to: `http://localhost:3000/auth-test`
- Login with: john@fixbuddy.com / password123
- Test logout, register new user

### 2. Test Questions
Go to: `http://localhost:3000/questions-test`
- View all questions with pagination
- Sort by: newest, popular, unanswered
- Create new questions (requires login)

### 3. Test API Endpoints

**Get all questions:**
```bash
curl http://localhost:3000/api/questions
```

**Get question by ID** (use an ID from the response above):
```bash
curl http://localhost:3000/api/questions/[QUESTION_ID]
```

**Get all tags:**
```bash
curl http://localhost:3000/api/tags
```

**Get questions by tag:**
```bash
curl http://localhost:3000/api/tags/refrigerator
```

**Search:**
```bash
curl "http://localhost:3000/api/search?q=refrigerator"
```

**Get user profile:**
```bash
curl http://localhost:3000/api/users/[USER_ID]
```

---

## Database Collections

After seeding, check MongoDB collections:

```bash
# Connect to MongoDB shell
mongosh fixbuddy

# View collections
show collections

# Count documents
db.users.countDocuments()      # 5
db.tags.countDocuments()       # 10
db.questions.countDocuments()  # 8
db.answers.countDocuments()    # 22
db.comments.countDocuments()   # 10

# View sample data
db.questions.find().pretty()
db.users.find({}, {username: 1, email: 1, reputation: 1})
```

---

## Customization

Edit `scripts/seed.ts` to:
- Add more users
- Create more questions
- Add different tags
- Adjust reputation values
- Change answer patterns
- Add more comments

---

## Troubleshooting

### MongoDB Connection Error
```bash
# Make sure MongoDB is running
sudo systemctl start mongod

# Or if using Docker
docker start mongodb
```

### Clear Data Manually
```bash
mongosh fixbuddy
db.dropDatabase()
```

### Re-run Seed
```bash
npm run seed
```
Safe to run multiple times - it clears data first!

---

## Next Steps

After seeding:
1. ✅ Start dev server: `npm run dev`
2. ✅ Test authentication: `/auth-test`
3. ✅ Browse questions: `/questions-test`
4. ✅ Test API endpoints with curl/Postman
5. ✅ Build frontend UI components

---

**Database is now populated with realistic sample data! 🎉**
