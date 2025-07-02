import pg from "pg";
import env from "dotenv";

env.config();
const db = new pg.Client({
  user: process.env.USER, 
  host: process.env.HOST,
  database: process.env.DATABASE,     
  password: process.env.PASSWORD,    
  port: process.env.PORT      
});

db.connect();

export {db};

let jobs = [];
let users = [];
let applications = [];
let lastUpdated = null;

export async function getAllData(){

  try{
    await db.query("BEGIN");
    const usersData =  await db.query("SELECT * FROM users");
    const applicationsData =  await db.query("SELECT * FROM applications");
    const jobsData = await db.query("SELECT * FROM jobs");
    await db.query("COMMIT");
    users = usersData.rows;
    applications = applicationsData.rows;
    jobs = jobsData.rows;
    lastUpdated = new Date();
  }
  catch(err){
    await db.query("ROLLBACK");
    console.log("error message from getAllData:", err);
  }
}

export function getCachedData() {
  return { jobs, users, applications, lastUpdated };
}
