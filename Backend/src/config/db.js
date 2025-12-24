const mongoose = require("mongoose");

/**
 * Connect to MongoDB with retry logic
 * @param {number} retries - Number of retry attempts (default: 5)
 * @returns {Promise<boolean>} - True if connected, exits process if failed
 */
const connectMongo = async (retries = 5) => {
    const options = {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    };

    for (let i = 0; i < retries; i++) {
        try {
            await mongoose.connect(process.env.MONGO_URI, options);
            console.log("✅ MongoDB connected successfully");
            
            // Handle connection events
            mongoose.connection.on('error', (err) => {
                console.error("❌ MongoDB connection error:", err);
            });
            
            mongoose.connection.on('disconnected', () => {
                console.warn("⚠️  MongoDB disconnected. Attempting to reconnect...");
            });
            
            mongoose.connection.on('reconnected', () => {
                console.log("✅ MongoDB reconnected");
            });
            
            return true;
        } catch (err) {
            console.error(`❌ MongoDB connection attempt ${i + 1}/${retries} failed:`, err.message);
            
            if (i === retries - 1) {
                console.error("❌ Failed to connect to MongoDB after multiple attempts");
                console.error("💡 Please check your MONGO_URI in .env file");
                console.error("💡 Ensure MongoDB is running and accessible");
                
                // In production, we might want to exit; in development, continue
                if (process.env.NODE_ENV === 'production') {
                    process.exit(1);
                } else {
                    console.warn("⚠️  Continuing without MongoDB (development mode)");
                    return false;
                }
            }
            
            // Wait before retrying (exponential backoff)
            const waitTime = Math.min(1000 * Math.pow(2, i), 10000);
            console.log(`⏳ Waiting ${waitTime}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
    
    return false;
};

module.exports = connectMongo;