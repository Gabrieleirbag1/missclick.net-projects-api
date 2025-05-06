const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

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

app.post('/api/projects', async (req, res) => {
  console.log('Received POST request for /api/projects with body:', req.body);
  const newProject = new Project(req.body);
  await newProject.save();
  console.log('Saved new project:', newProject);
  res.json(newProject);
});

app.put('/api/projects/:id', async (req, res) => {
  console.log('Received PUT request for /api/projects/:id with body:', req.body);
  const updatedProject = await Project.findByIdAndUpdate
    (req.params.id, req.body, { new: true });
  console.log('Updated project:', updatedProject);
  res.json(updatedProject);
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