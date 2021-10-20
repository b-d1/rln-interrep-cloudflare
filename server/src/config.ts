import dotenv from 'dotenv';
dotenv.config();

export default {
    INTERREP_MOCK_BASE_URL: process.env.INTERREP_MOCK_BASE_URL || "",
    INTERREP_SUBGRAPH_URL: process.env.INTERREP_SUBGRAPH_URL || "",
    DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING || "",
    SERVER_PORT: parseInt((process.env.SERVER_PORT || "8080"), 10),
    MERKLE_TREE_LEVELS: parseInt(process.env.MERKLE_TREE_LEVELS || "15", 10),
    SPAM_TRESHOLD: parseInt(process.env.SPAM_THRESHOLD || "3", 10),
    INTERREP_SYNC_INTERVAL_SECONDS: parseInt(process.env.INTERREP_SYNC_INTERVAL_SECONDS || "10", 10),
    ZERO_VALUE: BigInt(0)
}