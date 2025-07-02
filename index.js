import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import { db, getCachedData, getAllData } from "./dataCache.js";
import multer from "multer";
import env from "dotenv";

const app = express();
const PORT = 3000;
env.config();

const upload = multer({ storage: multer.memoryStorage() });

const saltRounds = process.env.SALTROUNDS;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
  secret:process.env.SECRET,
  resave:false,
  saveUninitialized:true
}));

app.use(passport.initialize());
app.use(passport.session());

await getAllData();// Load initially; 
setInterval(() => {
  getAllData();
}, 1000 * 10); 



app.get("/",(req,res)=>{
  if(req.isAuthenticated()){
    res.render("index.ejs");
  }
  else{
    const message  = req.session.messages || [];
    req.session.messages = [];
    res.render("login.ejs",{
      errorMessage: message[0] || null
    });
  }
});


app.get("/home",(req,res)=>{
  if(req.isAuthenticated()){
    res.render("index.ejs");
  }
  else{
    res.redirect("/");
  }
});

app.post("/login", passport.authenticate("local",{
  successRedirect:"/home",
  failureRedirect:"/",
  failureMessage:true
}));


app.get("/logout", (req, res, next) => {
  req.logout(function(err) {
    if (err) {
      return next(err);
    }
    req.session.destroy(() => {
      res.clearCookie("connect.sid"); 
      res.redirect("/");
    });
  });
});

app.get("/register",(req,res)=>{
  res.render("register.ejs");
});


app.post("/register", async (req,res)=>{
  const {password, 'confirm-password' : confirmPassword, role, name, email} = req.body;

  try{
    const storedEmail = await db.query("SELECT email_id FROM users WHERE email_id = $1;",[email]);
    if(storedEmail.rows.length > 0){
      res.render("register.ejs",{
        errorMessage:"Email already exists, Try to login!"
      });
    }
    else{
      if(password != confirmPassword){
        res.render("register.ejs",{
          errorMessage: "Password doesn't match!"
        });
      }
      else{
        bcrypt.hash(confirmPassword, saltRounds, async (err,hash)=>{
          if(err){
            console.log("error in hashing problem: "+ err);
          }
          else{
            const result = await db.query("INSERT INTO users (name, email_id, role, password) VALUES ($1,$2,$3,$4) RETURNING * ;",[name,email,role,hash]);
            const user = result.rows[0];
            req.login(user,(err)=>{
              if(err){
                console.log(err);
              }
              else{
                res.redirect("/home");
              }
            })
          }
        });
      }
    }
  }
  catch(err){
    console.log(err);
  } 
});


app.get("/listing", (req,res)=>{
  if(req.isAuthenticated()){
      const {jobs} = getCachedData();  
      res.render("job_listing.ejs",{
          job_details: jobs.length > 0 ? jobs : null,
      });
    }
    else{
      res.redirect("/");
    }
});


app.get("/filter-jobs",(req,res)=>{
  const {location, category, type } = req.query;
  const {jobs} = getCachedData();
  const searchedJobs = jobs.filter((job)=>{
    return job.location.toLowerCase() === location.toLowerCase() && job.job_category.toLowerCase() === category.toLowerCase() && job.job_type.toLowerCase() === type.toLowerCase()
  });

  res.render("job_listing.ejs",{
    job_details: searchedJobs.length > 0 ? searchedJobs : null
  });
})


app.get("/jobs", (req,res)=>{// job search route
  const job_title = req.query.job_title.toLowerCase();
  const location = req.query.location.toLowerCase();
  if(job_title && location){
    const {jobs} = getCachedData(); 
    const searchedJobs = jobs.filter((job) => {
      return job.title.toLowerCase().includes(job_title) && job.location.toLowerCase() === location;
    });
    res.render("job_listing.ejs",{
      job_details: searchedJobs.length > 0 ? searchedJobs : null
    });
  }
  else{
    res.redirect("/");
  }
});


app.get("/job_details/:id", (req,res)=>{ 
  const id = Number(req.params.id);
  try{
    const {jobs,users} = getCachedData(); 
    const job_info = jobs.find((job)=>{
      return job.id === id;
    });
    const employer_id = job_info.employer_id;
    const empDetails=  users.find((user)=>{
      return user.id === employer_id && user.role === "employer"
    });
    res.render("job_details.ejs",{
      job_details: job_info,
      details: empDetails
    });
  }
  catch(err){
    console.log(err);
  }
});



app.get("/dashboard", async (req,res)=>{
  if(req.isAuthenticated()){
    const role = req.user.role;
    const id = req.user.id;
    await getAllData();
    if( role === "employer"){
      const {jobs} = getCachedData(); 
      const jobPost = jobs.filter((jobPost)=>{
        return jobPost.employer_id === id;
      });
      try{
        const applications = await db.query("SELECT * FROM applications AS app JOIN jobs ON app.jobid = jobs.id WHERE employer_id = $1",[id]);

        res.render("dashboard.ejs",{
          role: role,
          jobPost: jobPost.length > 0 ? jobPost : null,
          applications: applications.rows.length > 0 ? applications.rows : null
        });
      }
      catch(err){
        console.log(err);
      }
    }
    else{ // user dashboard
      try{
        const user_id = req.user.id;
        const result = await db.query("SELECT jobs.id, jobs.title, jobs.location, jobs.company FROM jobs JOIN applications AS app ON app.jobid = jobs.id WHERE app.userid = $1;",[user_id]);
        res.render("dashboard.ejs",{
          role: role,
          jobs: result.rows
        });
      }
      catch(err){
        console.log(err);
      }
    }
  }
  else{
    res.redirect("/");
  }
});


app.get("/download", async (req,res)=>{
  const {userid,jobid} = req.query;

  try{
    const result = await db.query(
    "SELECT resume, resume_filename FROM applications WHERE userid = $1 AND jobid = $2",
    [userid, jobid]
    );

    if (result.rows.length === 0) return res.status(404).send("Resume not found");

    const file = result.rows[0];
    res.setHeader("Content-Disposition", `attachment; filename="${file.resume_filename}"`);
    res.setHeader("Content-Type", "application/pdf");
    res.send(file.resume);
  }
  catch(err){
    console.log(err);
  } 
})


app.get("/apply-job/:id",(req,res)=>{
  if(req.isAuthenticated()){
    console.log(req.params.id);
    const job_id = Number(req.params.id);
    const {jobs} = getCachedData();
    const job = jobs.find((job)=>{
      return job.id === job_id 
    });
    res.render("apply_job.ejs",{
      title: job?.title,
      job_id: job_id
    });
  }
  else{
    res.redirect("/");
  }
});


app.get("/job-post-edit/:id",(req,res)=>{
  const job_id = Number(req.params.id);
  const {jobs} = getCachedData();
  const job_details = jobs.find((job)=>{
    return job.id === job_id;
  });
  res.render("edit_job.ejs",{
    job: job_details
  });
});

app.post("/job-post-edit/:id", async (req,res)=>{
  const job_id = Number(req.params.id);
  const {jobs} = getCachedData();
  const job_details = jobs.find((job)=>{
    return job.id === job_id;
  });

  const employer_id = req.user.id;

  const newJobUpdate = {
    job_id: job_id,
    title: req.body.title || job_details.title,
    location: req.body.location || job_details.location,
    salary: req.body.salary || job_details.salary,
    job_type: req.body.job_type || job_details.job_type,
    job_category : req.body.job_category || job_details.job_category,
    description: req.body.description || job_details.description
  }

  try{
    await db.query(`UPDATE jobs SET title = $1, location = $2, salary = $3, job_type = $4, job_category = $5, description = $6  WHERE id = $7 AND employer_id = $8 `,
    [
      newJobUpdate.title,
      newJobUpdate.location,
      newJobUpdate.salary,
      newJobUpdate.job_type,
      newJobUpdate.job_category,
      newJobUpdate.description,
      newJobUpdate.job_id,
      employer_id
    ]
  );
  res.redirect("/dashboard");
  }
  catch(err){
    console.log(err);
  }
});

app.get("/job-delete/:id", async (req,res)=>{
  const employer_id = req.user.id;
  const job_id = req.params.id;
  try{
    await db.query("DELETE FROM jobs WHERE id = $1 AND employer_id = $2;",[job_id,employer_id]);
    res.redirect("/dashboard");
  }
  catch(err){
    console.log(err);
  }
});





app.post("/jobs/apply/:id", upload.single("resume"), async (req,res)=>{
  const job_id= Number(req.params.id);
  const cover_letter = req.body.cover_letter;
  const user_Id = req.user.id;
  const resumeByte= req.file.buffer;
  const resumeFileName = req.file.originalname;
  try{
    const result = await db.query("INSERT INTO applications (userid, jobid, cover_letter, resume, resume_filename) VALUES ($1, $2, $3, $4, $5) RETURNING *;",
    [user_Id, job_id, cover_letter, resumeByte, resumeFileName]
  );
    res.redirect("/dashboard");
  }
  catch(err){
    console.log(err);
  }
})


app.get("/post-job",(req,res)=>{
  if(req.isAuthenticated()){
    res.render("job_post_page.ejs");
  }
  else{
    res.redirect("/");
  }
});



app.post("/post-job", async (req,res)=>{
  const {title, description, company, location, salary, job_category, type} = req.body;
  const employer_id = req.user.id;
  try{
    await db.query("INSERT INTO jobs (title,description, location, job_type,company, salary, job_category, employer_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8);",
      [title, description, location, type, company, salary, job_category, employer_id]);
      res.redirect("/dashboard");
  }
  catch(err){
    console.log(err);
  }
});



passport.use(
  'local', 
  new Strategy({ usernameField: 'email' }, async function verify(email,password,cb){
      try{
        const result = await db.query("SELECT * FROM users WHERE email_id = $1;",[email]);
        
        if(result.rows.length > 0){
          const storeHashPassword = result.rows[0].password;
          bcrypt.compare(password, storeHashPassword, (err,valid)=>{
            if(err){
              cb(err);
            }
            else{
              if(valid){
                const user = {
                  id:result.rows[0].id,
                  name: result.rows[0].name,
                  email: result.rows[0].email_id,
                  role: result.rows[0].role
                }
                cb(null,user);// password check
              }
              else{
                cb(null,false,{message: "Incorrect Password!"});
              }
            }
          });
        }
        else{
          cb(null,false,{message:"Email not found. Try registering your account." });
        }
      }
      catch(err){
        console.log(err);
      }
  })
);


passport.serializeUser((user,cb)=>{
  cb(null,user.id);
});


passport.deserializeUser( async (id,cb)=>{
  try{
    const result = await db.query("SELECT id,name, email_id, role FROM users WHERE id = $1;",[id]);
    if(result.rows.length>0){
      cb(null,result.rows[0]);
    }   
    else{
      cb(null,false);
    }
  }
  catch(err){
    console.log(err);
  }
});


app.listen(PORT,()=>{
  console.log(`server is running on PORT: ${PORT}`);
});