// mongodbPing.js - MongoDB Atlas Connectivity Check
// This script verifies your MongoDB Atlas connection is working correctly

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file if it exists
// This allows beginners to simply create a .env file instead of setting system env vars
function loadEnvFile() {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        console.log('📄 Found .env file, loading variables...');
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            // Skip comments and empty lines
            if (line.trim() && !line.startsWith('#')) {
                const [key, ...valueParts] = line.split('=');
                if (key && valueParts.length > 0) {
                    const value = valueParts.join('=').trim();
                    // Remove quotes if present
                    process.env[key.trim()] = value.replace(/^["']|["']$/g, '');
                }
            }
        });
    }
}

// Main connectivity test function
async function testMongoDBConnection() {
    console.log('🔍 MongoDB Atlas Connectivity Test\n');
    
    // Step 1: Check for connection string
    // We read from environment variables first (good for production)
    // Fallback to .env file (good for local development)
    loadEnvFile();
    
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
        console.error('❌ Error: MONGODB_URI not found');
        console.error('   Please set it in your .env file or environment variables');
        console.error('   Example .env line: MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname');
        process.exit(1);
    }
    
    // Mask the URI for safe logging (show only the cluster host)
    const maskedUri = uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    console.log(`🌐 Connecting to: ${maskedUri}\n`);
    
    // Step 2: Create MongoDB client
    // We use the unified topology for better error handling and monitoring
    const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000, // Wait max 5 seconds for server selection
        connectTimeoutMS: 10000,          // Connection timeout
    });
    
    try {
        // Step 3: Attempt connection
        console.log('⏳ Attempting to connect...');
        await client.connect();
        console.log('✅ Successfully connected to MongoDB Atlas!\n');
        
        // Step 4: Verify with admin ping command
        // The ping command is lightweight and confirms the connection is truly alive
        console.log('📡 Sending ping command to verify...');
        const adminDb = client.db('admin');
        const pingResult = await adminDb.command({ ping: 1 });
        
        if (pingResult.ok === 1) {
            console.log('✅ Ping successful! Database is responding.\n');
            
            // Step 5: Show connection info
            // This helps beginners understand what they're connected to
            const dbList = await client.db().admin().listDatabases();
            console.log(`📊 Available databases: ${dbList.databases.map(d => d.name).join(', ')}`);
            console.log(`🔗 Connection state: ${client.topology?.isConnected() ? 'Connected' : 'Unknown'}`);
        } else {
            console.warn('⚠️  Ping returned unexpected result:', pingResult);
        }
        
        console.log('\n🎉 All checks passed! Your MongoDB Atlas connection is working.');
        
    } catch (error) {
        console.error('\n❌ Connection failed!\n');
        
        // Provide helpful error messages for common issues
        if (error.message.includes('authentication failed')) {
            console.error('💡 Tip: Check your username and password in the connection string');
            console.error('   - Verify the user exists in MongoDB Atlas Database Access');
            console.error('   - Make sure the password is correct (no special character issues)');
        } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
            console.error('💡 Tip: Cannot resolve cluster hostname');
            console.error('   - Check your internet connection');
            console.error('   - Verify the cluster URL is correct');
        } else if (error.message.includes('IP that')) {
            console.error('💡 Tip: IP address not whitelisted');
            console.error('   - Add your IP to Network Access in MongoDB Atlas (0.0.0.0/0 for any IP)');
        } else if (error.message.includes('SSL') || error.message.includes('TLS')) {
            console.error('💡 Tip: SSL/TLS connection issue');
            console.error('   - Try adding ?tls=true or check firewall settings');
        }
        
        console.error('\n📋 Full error details:');
        console.error(error.message);
        process.exit(1);
        
    } finally {
        // Step 6: Always close the connection, even if there was an error
        // This prevents connection leaks and hanging processes
        console.log('\n🔒 Closing connection...');
        await client.close();
        console.log('👋 Connection closed cleanly.');
    }
}

// Run the test
testMongoDBConnection();

/* 
INSTALLATION & RUN INSTRUCTIONS:

1. Install dependencies:
   npm install mongodb

2. Create a .env file in the same folder with your connection string:
   MONGODB_URI=mongodb+srv://youruser:yourpassword@yourcluster.mongodb.net/yourdb

3. Run the test:
   node mongodbPing.js

4. Expected output if successful:
   🔍 MongoDB Atlas Connectivity Test
   📄 Found .env file, loading variables...
   🌐 Connecting to: mongodb+srv://***:***@yourcluster.mongodb.net/yourdb
   ⏳ Attempting to connect...
   ✅ Successfully connected to MongoDB Atlas!
   📡 Sending ping command to verify...
   ✅ Ping successful! Database is responding.
   🎉 All checks passed!

COMMON ISSUES:
- "authentication failed": Wrong username/password or user doesn't exist
- "IP not whitelisted": Add 0.0.0.0/0 in Atlas Network Access
- "ENOTFOUND": Wrong cluster URL or no internet connection
*/
