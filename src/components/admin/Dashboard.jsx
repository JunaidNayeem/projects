import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getProjects, createProject, updateProject, deleteProject } from '../../services/api';
import { io } from 'socket.io-client';
import ProjectModal from '../common/ProjectModal';
import Button from '../common/Button';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await getProjects();
        setProjects(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        setLoading(false);
      }
    };
    fetchProjects();

    const socket = io('http://localhost:5000');
    socket.on('projectUpdate', (updatedProject) => {
      setProjects(prev => {
        if (updatedProject.action === 'delete') {
          return prev.filter(p => p._id !== updatedProject.project._id);
        } else if (updatedProject.action === 'create') {
          return [...prev, updatedProject.project];
        } else {
          return prev.map(p => (p._id === updatedProject.project._id ? updatedProject.project : p));
        }
      });
    });

    return () => socket.disconnect();
  }, []);

  const handleAddProject = () => {
    setCurrentProject(null);
    setIsModalOpen(true);
  };

  const handleEditProject = (project) => {
    setCurrentProject(project);
    setIsModalOpen(true);
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await deleteProject(projectId);
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  const handleSaveProject = async (projectData) => {
    try {
      if (currentProject) {
        await updateProject(currentProject._id, projectData);
      } else {
        await createProject(projectData);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save project:', err);
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            {user?.username}'s Dashboard
          </h1>
          <div className="flex gap-4">
            <Button
              onClick={handleAddProject}
              className="bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500"
            >
              Add Project
            </Button>
            <Button
              onClick={logout}
              className="bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500"
            >
              Logout
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div key={project._id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{project.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 line-clamp-3">{project.description}</p>
              <div className="mt-4 flex gap-2">
                <Button
                  onClick={() => handleEditProject(project)}
                  className="bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => handleDeleteProject(project._id)}
                  className="bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-gray-600 dark:text-gray-300">
          Share your showcase: <a href={`/showcase/${user?._id}`} className="text-blue-500 dark:text-blue-400">/showcase/{user?._id}</a>
        </p>
        {isModalOpen && (
          <ProjectModal
            project={currentProject}
            onSave={handleSaveProject}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;