const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3100;

app.use(cors());
app.use(bodyParser.json());

const uploadsDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(path.join(__dirname, 'public'))) {
  fs.mkdirSync(path.join(__dirname, 'public'));
}
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

const deleteFile = async (filename) => {
  if (!filename) return;
  
  const filePath = path.join(__dirname, 'public/uploads', filename);
  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      console.log(`Deleted file: ${filename}`);
    }
  } catch (error) {
    console.error(`Error deleting file ${filename}:`, error);
  }
};

app.use('/api/projects/image', express.static(path.join(__dirname, 'public/uploads')));

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/projectsDB';
console.log('Connecting to MongoDB at:', mongoUri);
mongoose.connect(mongoUri);

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

app.get('/api/projects/secrets/:key', async (req, res) => {
  try {
    const configPath = path.join(__dirname, 'private', 'secrets', '.secrets.json');
    const key = req.params.key;
    
    if (fs.existsSync(configPath)) {
      const secretsData = fs.readFileSync(configPath, 'utf8');
      const secrets = JSON.parse(secretsData);
      
      if (secrets.hasOwnProperty(key)) {
        res.json({ [key]: secrets[key] });
      } else {
        res.status(404).json({ error: `Secret with key "${key}" not found` });
      }
    } else {
      res.status(404).json({ error: 'Configuration file not found' });
    }
  } catch (error) {
    console.error('Error retrieving secret:', error);
    res.status(500).json({ error: 'Failed to retrieve secret' });
  }
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
  });
});

app.get('/api/projects/:id', async (req, res) => {
  try {
    console.log('Received GET request for project ID:', req.params.id);
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid project ID format' });
    }
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    console.log('Sending response:', project);
    res.json(project);
  } catch (error) {
    console.error('Error getting project:', error);
    res.status(500).json({ error: error.message });
  }
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

    // Handle both JSON string and direct object
    let projectData;
    try {
      // Try to parse as JSON string first
      projectData = JSON.parse(req.body.projectData);
    } catch (e) {
      // If parsing fails, use the data directly (it might already be an object)
      projectData = req.body;
    }
    
    // Add image URLs, checking if req.files and the specific fields exist
    projectData.imageUrl = {
      grid: req.files && req.files['gridImage'] ? req.files['gridImage'][0].filename : '',
      list: req.files && req.files['listImage'] ? req.files['listImage'][0].filename : ''
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
    
    let projectData;
    try {
      // Try to parse as JSON string first
      projectData = JSON.parse(req.body.projectData);
    } catch (e) {
      // If parsing fails, use the data directly
      projectData = req.body;
    }
    
    const existingProject = await Project.findById(req.params.id);
    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Delete old images if new ones are uploaded
    if (req.files && req.files['gridImage'] && existingProject.imageUrl.grid) {
      await deleteFile(existingProject.imageUrl.grid);
    }
    
    if (req.files && req.files['listImage'] && existingProject.imageUrl.list) {
      await deleteFile(existingProject.imageUrl.list);
    }
    
    // Update image URLs only if new files were uploaded
    projectData.imageUrl = {
      grid: req.files && req.files['gridImage'] ? req.files['gridImage'][0].filename : existingProject.imageUrl.grid,
      list: req.files && req.files['listImage'] ? req.files['listImage'][0].filename : existingProject.imageUrl.list
    };
    
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
  try {
    console.log('Received DELETE request for /api/projects/:id');
    const deletedProject = await Project.findByIdAndDelete(req.params.id);
    
    if (!deletedProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (deletedProject.imageUrl.grid) {
      console.log('Deleting grid image:', deletedProject.imageUrl.grid);
      await deleteFile(deletedProject.imageUrl.grid);
    }
    if (deletedProject.imageUrl.list) {
      console.log('Deleting list image:', deletedProject.imageUrl.list);
      await deleteFile(deletedProject.imageUrl.list);
    }
    
    console.log('Deleted project:', deletedProject);
    res.json(deletedProject);
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});