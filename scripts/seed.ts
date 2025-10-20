import mongoose from 'mongoose';
import { User, Question, Answer, Tag, Comment } from '../lib/models';
import { hashPassword } from '../lib/auth';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fixbuddy';

// Sample users data
const sampleUsers = [
  {
    username: 'john_repairman',
    email: 'john@fixbuddy.com',
    password: 'password123',
    bio: 'Professional appliance technician with 15 years of experience',
    reputation: 850,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john'
  },
  {
    username: 'sarah_techie',
    email: 'sarah@fixbuddy.com',
    password: 'password123',
    bio: 'DIY enthusiast and home appliance expert',
    reputation: 620,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah'
  },
  {
    username: 'mike_fixer',
    email: 'mike@fixbuddy.com',
    password: 'password123',
    bio: 'Specializing in refrigeration systems',
    reputation: 450,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike'
  },
  {
    username: 'lisa_helper',
    email: 'lisa@fixbuddy.com',
    password: 'password123',
    bio: 'Always learning, always helping!',
    reputation: 280,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa'
  },
  {
    username: 'david_novice',
    email: 'david@fixbuddy.com',
    password: 'password123',
    bio: 'New to appliance repair, eager to learn',
    reputation: 50,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david'
  }
];

// Sample tags data
const sampleTags = [
  {
    name: 'refrigerator',
    description: 'Questions about refrigerators, freezers, and cooling issues',
    icon: '❄️'
  },
  {
    name: 'washing machine',
    description: 'Washing machine problems, drainage, and spin issues',
    icon: '🧺'
  },
  {
    name: 'dishwasher',
    description: 'Dishwasher repairs, cleaning, and maintenance',
    icon: '🍽️'
  },
  {
    name: 'microwave',
    description: 'Microwave oven issues and repairs',
    icon: '📡'
  },
  {
    name: 'oven',
    description: 'Oven and stove troubleshooting',
    icon: '🔥'
  },
  {
    name: 'dryer',
    description: 'Clothes dryer problems and solutions',
    icon: '🌀'
  },
  {
    name: 'water heater',
    description: 'Water heater maintenance and repair',
    icon: '💧'
  },
  {
    name: 'electrical',
    description: 'Electrical issues and wiring problems',
    icon: '⚡'
  },
  {
    name: 'diy',
    description: 'Do-it-yourself repairs and tips',
    icon: '🔧'
  },
  {
    name: 'maintenance',
    description: 'Preventive maintenance and care tips',
    icon: '🛠️'
  }
];

// Sample questions data (will be populated with actual user/tag references)
const sampleQuestions = [
  {
    title: 'Refrigerator not cooling properly - what could be the issue?',
    content: `My refrigerator stopped cooling properly about 3 days ago. The freezer section is still cold, but the fridge compartment is warm. I can hear the compressor running. What could be causing this?

I've already tried:
- Cleaning the condenser coils
- Checking the door seals
- Making sure vents aren't blocked

The refrigerator is about 5 years old, a Whirlpool model. Any suggestions would be greatly appreciated!`,
    tags: ['refrigerator', 'diy'],
    views: 150,
    votes: 12
  },
  {
    title: 'Washing machine making loud banging noise during spin cycle',
    content: `My front-load washing machine has started making a very loud banging/knocking noise during the spin cycle. It's so loud that I'm worried something might break.

The machine is still washing clothes fine, but the noise is unbearable. Could this be a bearing issue? How difficult is it to replace the bearings myself?

Model: Samsung WF45R6100AW`,
    tags: ['washing machine', 'diy'],
    views: 230,
    votes: 18
  },
  {
    title: 'Dishwasher not draining - standing water at bottom',
    content: `After running a cycle, there's always standing water at the bottom of my dishwasher. I've checked the drain hose and it's not kinked. I also cleaned the filter, but the problem persists.

Should I check the drain pump? How can I test if it's working properly?`,
    tags: ['dishwasher', 'maintenance'],
    views: 89,
    votes: 7
  },
  {
    title: 'Microwave turns on but does not heat food',
    content: `My microwave runs normally - the turntable spins, the light is on, and the timer counts down. But it's not heating food at all.

Is this the magnetron? Is it worth repairing or should I just buy a new microwave? The unit is about 8 years old.`,
    tags: ['microwave', 'electrical'],
    views: 310,
    votes: 25
  },
  {
    title: 'Electric oven temperature is inaccurate',
    content: `I've noticed that my electric oven temperature is way off. When I set it to 350°F, an oven thermometer shows it's actually running at 320°F.

Can I calibrate this myself, or do I need to call a technician? It's a GE built-in oven, about 10 years old.`,
    tags: ['oven', 'diy'],
    views: 65,
    votes: 5
  },
  {
    title: 'Dryer takes forever to dry clothes',
    content: `My dryer used to dry a full load in about 45 minutes, but now it takes 2+ hours. I've cleaned the lint trap and checked the exhaust vent - both seem clear.

What else could be causing this? Could it be the heating element?`,
    tags: ['dryer', 'maintenance'],
    views: 178,
    votes: 14
  },
  {
    title: 'Water heater making popping/crackling sounds',
    content: `My gas water heater has started making loud popping and crackling sounds, especially when heating water. The water still gets hot, but I'm concerned about the noise.

Is this sediment buildup? How do I flush the tank properly?`,
    tags: ['water heater', 'maintenance'],
    views: 92,
    votes: 8
  },
  {
    title: 'Best practices for appliance maintenance?',
    content: `I just bought my first home and want to make sure I'm taking proper care of all my appliances. What are the essential maintenance tasks I should be doing regularly?

Currently have: refrigerator, dishwasher, washer/dryer, and gas stove.`,
    tags: ['maintenance', 'diy'],
    views: 420,
    votes: 31
  }
];

async function seed() {
  try {
    console.log('🌱 Starting database seed...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Question.deleteMany({});
    await Answer.deleteMany({});
    await Tag.deleteMany({});
    await Comment.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create users
    console.log('👤 Creating users...');
    const users = [];
    for (const userData of sampleUsers) {
      const hashedPassword = await hashPassword(userData.password);
      const user = await User.create({
        ...userData,
        passwordHash: hashedPassword,
        lastActiveAt: new Date()
      });
      users.push(user);
      console.log(`   ✓ Created user: ${user.username}`);
    }

    // Create tags
    console.log('🏷️  Creating tags...');
    const tags = [];
    for (const tagData of sampleTags) {
      // Generate slug from name
      const slug = tagData.name.toLowerCase().replace(/\s+/g, '-');
      const tag = await Tag.create({
        ...tagData,
        slug
      });
      tags.push(tag);
      console.log(`   ✓ Created tag: ${tag.name}`);
    }

    // Create questions
    console.log('❓ Creating questions...');
    const questions = [];
    for (let i = 0; i < sampleQuestions.length; i++) {
      const questionData = sampleQuestions[i];
      const author = users[i % users.length]; // Distribute questions among users
      
      // Find tag IDs
      const questionTags = tags.filter(tag => 
        questionData.tags.includes(tag.name)
      );

      const question = await Question.create({
        title: questionData.title,
        content: questionData.content,
        author: author._id,
        tags: questionTags.map(t => t._id),
        views: questionData.views,
        votes: questionData.votes,
        upvotedBy: [], // Empty for now
        downvotedBy: [],
        status: 'open',
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
      });
      
      questions.push(question);
      
      // Update tag usage count
      for (const tag of questionTags) {
        tag.usageCount += 1;
        await tag.save();
      }
      
      console.log(`   ✓ Created question: ${question.title.substring(0, 50)}...`);
    }

    // Create answers
    console.log('💬 Creating answers...');
    let answerCount = 0;
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const numAnswers = Math.floor(Math.random() * 4) + 1; // 1-4 answers per question
      
      for (let j = 0; j < numAnswers; j++) {
        const answerer = users[(i + j + 1) % users.length]; // Different user than question author
        
        const answerContents = [
          `Based on your description, this sounds like a common issue. I'd recommend checking the following:\n\n1. First step - detailed explanation\n2. Second step - more details\n3. Third step - final checks\n\nLet me know if this helps!`,
          `I had the exact same problem last year! Here's what fixed it for me:\n\n- Check component X\n- Replace part Y if needed\n- Clean the Z area thoroughly\n\nHope this works for you too!`,
          `This is likely caused by a faulty component. You'll need to:\n\n1. Disconnect power first (safety!)\n2. Access the part\n3. Test it with a multimeter\n4. Replace if necessary\n\nIt's a moderate DIY job if you're comfortable with tools.`,
          `I'm a professional technician and see this issue frequently. The most common cause is wear and tear on internal components. You have a few options:\n\n**DIY Repair:** Follow these steps...\n**Professional Repair:** Cost would be around $150-$200\n**Replacement:** Consider if unit is over 10 years old\n\nFeel free to ask follow-up questions!`
        ];

        const answer = await Answer.create({
          content: answerContents[j % answerContents.length],
          author: answerer._id,
          question: question._id,
          votes: Math.floor(Math.random() * 15),
          upvotedBy: [],
          downvotedBy: [],
          isAccepted: j === 0 && Math.random() > 0.5, // 50% chance first answer is accepted
          createdAt: new Date(question.createdAt.getTime() + (j + 1) * 2 * 60 * 60 * 1000) // Answers come after question
        });

        // If answer is accepted, update question status and give reputation
        if (answer.isAccepted) {
          question.status = 'solved';
          answerer.reputation += 15;
          await answerer.save();
        }
        
        answerCount++;
      }
      
      await question.save();
      console.log(`   ✓ Created ${numAnswers} answer(s) for question ${i + 1}`);
    }

    // Create comments
    console.log('💭 Creating comments...');
    let commentCount = 0;
    
    // Add comments to some questions
    for (let i = 0; i < Math.min(5, questions.length); i++) {
      const question = questions[i];
      const commenter = users[(i + 2) % users.length];
      
      await Comment.create({
        content: `Great question! I'm having a similar issue. Did you ever figure this out?`,
        author: commenter._id,
        parentType: 'question',
        parentId: question._id,
        createdAt: new Date(question.createdAt.getTime() + 60 * 60 * 1000)
      });
      
      commentCount++;
    }
    
    // Add comments to some answers
    const allAnswers = await Answer.find().limit(5);
    for (let i = 0; i < allAnswers.length; i++) {
      const answer = allAnswers[i];
      const commenter = users[(i + 3) % users.length];
      
      await Comment.create({
        content: `Thanks for the detailed explanation! This really helped me understand the issue.`,
        author: commenter._id,
        parentType: 'answer',
        parentId: answer._id,
        createdAt: new Date(answer.createdAt.getTime() + 30 * 60 * 1000)
      });
      
      commentCount++;
    }
    
    console.log(`   ✓ Created ${commentCount} comments`);

    // Print summary
    console.log('\n📊 Seed Summary:');
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   🏷️  Tags: ${tags.length}`);
    console.log(`   ❓ Questions: ${questions.length}`);
    console.log(`   💬 Answers: ${answerCount}`);
    console.log(`   💭 Comments: ${commentCount}`);
    console.log('\n✅ Database seeded successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('   Email: john@fixbuddy.com');
    console.log('   Password: password123');
    console.log('\n   (All users have the same password: password123)');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run seed
seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
