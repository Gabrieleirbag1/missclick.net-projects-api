const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/'); // Files will be stored in this directory
  },
  filename: function (req, file, cb) {
    // Create a unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Initialize multer with storage configuration
const upload = multer({ storage: storage });

// Serve static files from the 'public' directory
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

mongoose.connect('mongodb://localhost:27017/projectsDB');

const projectSchema = new mongoose.Schema({
    title: String,
    description: [String],
    imageUrl: { grid: String, list: String },
    link: String,
    date: String,
    tags: [String],
    technologies: [String],
});
  
const Project = mongoose.model('Project', projectSchema);

app.get('/api/projects', async (req, res) => {
  console.log('Received GET request for /api/projects');
  const projects = await Project.find();
  console.log('Sending response:', projects);
  res.json(projects);
});

app.get('/api/projects/:id', async (req, res) => {
  console.log('Received GET request for /api/projects/:id');
  const project = await Project.findById(req.params.id);
  console.log('Sending response:', project);
  res.json(project);
});

app.get('/api/projects/image/:filename', (req, res) => {
  console.log('Received GET request for /api/projects/image/:filename');
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'public/uploads', filename);
  console.log('File path:', filePath);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error sending file:', err);
      res.status(404).send('File not found');
    } else {
      console.log('File sent successfully');
    }
  }
  );
});

// Handle file uploads (modified endpoint)
app.post('/api/projects', upload.fields([
  { name: 'gridImage', maxCount: 1 },
  { name: 'listImage', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('Received POST request for /api/projects');
    console.log('Files:', req.files);
    console.log('Body:', req.body);

    // Create a new project from form data
    const projectData = JSON.parse(req.body.projectData);
    
    // Add image URLs
    projectData.imageUrl = {
      grid: req.files['gridImage'] ? `/uploads/${req.files['gridImage'][0].filename}` : '',
      list: req.files['listImage'] ? `/uploads/${req.files['listImage'][0].filename}` : ''
    };

    const newProject = new Project(projectData);
    await newProject.save();
    console.log('Saved new project:', newProject);
    res.json(newProject);
  } catch (error) {
    console.error('Error saving project:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/projects/:id', upload.fields([
  { name: 'gridImage', maxCount: 1 },
  { name: 'listImage', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('Received PUT request for /api/projects/:id');
    
    const projectData = JSON.parse(req.body.projectData);
    const existingProject = await Project.findById(req.params.id);
    
    // Update image URLs only if new files were uploaded
    if (req.files['gridImage']) {
      projectData.imageUrl.grid = `/uploads/${req.files['gridImage'][0].filename}`;
    } else {
      projectData.imageUrl.grid = existingProject.imageUrl.grid;
    }
    
    if (req.files['listImage']) {
      projectData.imageUrl.list = `/uploads/${req.files['listImage'][0].filename}`;
    } else {
      projectData.imageUrl.list = existingProject.imageUrl.list;
    }
    
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id, 
      projectData, 
      { new: true }
    );
    
    console.log('Updated project:', updatedProject);
    res.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  console.log('Received DELETE request for /api/projects/:id');
  const deletedProject = await Project.findByIdAndDelete(req.params.id);
  console.log('Deleted project:', deletedProject);
  res.json(deletedProject);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});