import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cloudinaryStorage from 'multer-storage-cloudinary';
import multer from 'multer';
import cloudinaryFramework from 'cloudinary';

import projectsData from './data/projects.json';
import thoughtsData from './data/thoughts.json';
import skillsData from './data/skills.json'; 

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/portfolio";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

//This will read my .env file and turn each of the cloudinary stuff in the 
//.env file into process.env. bla bla bla
dotenv.config();

const cloudinary = cloudinaryFramework.v2; 
cloudinary.config({
  cloud_name: 'dnbo9afao', // this needs to be whatever you get from cloudinary
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = cloudinaryStorage({
  cloudinary,
  params: {
    folder: 'thoughts',
    allowedFormats: ['jpg', 'png'],
    transformation: [{ width: 520, height: 354, crop: 'limit' }],
  },
});
const parser = multer({ storage });

//Models

//Figure out how to display featured projects with images and other projects without image
const Project = mongoose.model('Project', {
  title: {
    type: String
  },
  description: {
    type: String
  },
  url: {
    type: String
  },
  imageUrl: {
    type: String
  },
  imageId: {
    type: String
  },
  isFeatured: {
    type: Boolean
  },
  tech: Array
});

const Thought = mongoose.model('Thought', {
  date: {
    type: String
    //type: Date,
    //default: Date.now
  },
  imageUrl: {
    type: String
  },
  title: {
    type: String
  },
  introduction: {

  },
  url: {
    type: String
  },
  intro: {
    type: String
  },
  isFeatured: {
    type: Boolean
  }
});

const Skill = mongoose.model('Skill', {
  title: {
    type: String
  },
  skillItems: {
    type: Array
  }
});

const Contact = mongoose.model('Contact', {
  name: {
    type: String,
  },
  email: {
    type: String
  },
  telephone: {
    type: Number
  },
  message: {
    type: String
  }
});

//To avoid that the data duplicates everytime you seed the database, we have to do deleteMany before you seed the database.
//Here we say if we reset the database by doing RESET_DB=true npm run dev, then delete the data and seed the database.
if (process.env.RESET_DB) {
  const seedDatabase = async () => {
    await Project.deleteMany();
    await Thought.deleteMany();
    await Skill.deleteMany();
    
//Here we take all the data from the whole array and for each item we create a 
//Project, Thought & Skill model
    projectsData.forEach(item => {
      const newProject = new Project(item);
      newProject.save();
    });

    thoughtsData.forEach(item => {
      const newThought = new Thought(item);
      newThought.save();
    });

    skillsData.forEach(item => {
      const newSkill = new Skill(item);
      newSkill.save();
    });
  }
  seedDatabase();
};

const port = process.env.PORT || 8080;
const app = express();

app.use(cors());
app.use(bodyParser.json());

//Routes
app.get('/', (req, res) => {
  res.send(`This is Jessica Panditha's portfolio API`);
});

app.get('/projects', async (req, res) => {
  try {
    const allProjects = await Project.find(req.query);
    res.json(allProjects);
  } catch (error) {
    res.status(400).json({ error: "Could not fetch any projects" })
  }
});

app.get('/thoughts', async (req, res) => {
  try {
    const allThoughts = await Thought.find(req.query);
    res.json(allThoughts);
  } catch (error) {
    res.status(400).json({ error: "Could not fetch any projects" })
  }
});

app.get('/skills', async (req, res) => {
  try {
    const allSkills = await Skill.find(req.query);
    res.json(allSkills);
  } catch (error) {
    res.status(400).json({ error: "Could not fetch any projects" })
  }
});

//This endpoint is only to upload own images to Cloudinary. Remove?
//image here is the key that will be used when we post as form-data.
//Remember to choose form-data when you choose the body and NOT JSON.
//In postman, when you click key, change text > file. 
//The fields that you add e.g. imageName could be written as a key in the post request 
//in postman
app.post('/thoughts',parser.single('image'), async (req, res) => {
  console.log(req.file);
  res.json({  imageUrl: req.file.path, imageId: req.file.filename });
});
//Create post request for contact form


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
