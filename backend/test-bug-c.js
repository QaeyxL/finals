// Quick script to test Bug C - Creates entries and checks retrieval

const mongoose = require('mongoose');
require('dotenv').config();

const Journal = require('./models/journal');

// Test user ID (use a real one from your signup)
const TEST_USER_ID = '674890abcdef12345'; // Replace with actual userId after signup

async function testBugC() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DB_URL);
    console.log('✅ Connected to MongoDB');

    // Create test entries
    console.log('\n📝 Creating test entries...');
    
    const entry1 = new Journal({
      headline: 'Test Entry 1 for Bug C',
      journalText: 'This is a test entry to demonstrate Bug C',
      photo: 'https://example.com/photo.jpg',
      locationName: 'Manila, Philippines',
      coordinates: {
        latitude: 14.5995,
        longitude: 120.9842
      },
      author: TEST_USER_ID
    });

    const entry2 = new Journal({
      headline: 'Test Entry 2 for Bug C',
      journalText: 'Another test entry for Bug C testing',
      photo: 'https://example.com/photo2.jpg',
      locationName: 'Quezon City, Philippines',
      coordinates: {
        latitude: 14.6760,
        longitude: 121.0437
      },
      author: TEST_USER_ID
    });

    await entry1.save();
    await entry2.save();
    
    console.log('✅ Created 2 test entries');
    console.log('   Entry 1 ID:', entry1._id);
    console.log('   Entry 2 ID:', entry2._id);
    console.log('   Author field:', entry1.author);

    // Now try to retrieve them (simulating the bug)
    console.log('\n🔍 Querying entries with author:', TEST_USER_ID);
    const entries = await Journal.find({ author: TEST_USER_ID });
    
    console.log('📊 Query result:');
    console.log('   Entries found:', entries.length);
    
    if (entries.length === 0) {
      console.log('   ❌ BUG C CONFIRMED: No entries found even though we just created them!');
      
      // Debug: Check what's actually in the database
      console.log('\n🐛 DEBUGGING: Let\'s check ALL entries in database...');
      const allEntries = await Journal.find({});
      console.log('   Total entries in DB:', allEntries.length);
      
      if (allEntries.length > 0) {
        console.log('   Sample entry author field:', allEntries[0].author);
        console.log('   Type of author field:', typeof allEntries[0].author);
        console.log('   Does it match our userId?', allEntries[0].author === TEST_USER_ID);
      }
    } else {
      console.log('   ✅ Entries found successfully!');
      entries.forEach((e, i) => {
        console.log(`   ${i + 1}. ${e.headline}`);
      });
    }

    await mongoose.connection.close();
    console.log('\n✅ Test complete');

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.connection.close();
  }
}

console.log('='.repeat(50));
console.log('BUG C TEST SCRIPT');
console.log('='.repeat(50));
console.log('⚠️  IMPORTANT: Update TEST_USER_ID with a real userId');
console.log('   Get it from signup response in Chrome Console');
console.log('='.repeat(50));
console.log('');

testBugC();
