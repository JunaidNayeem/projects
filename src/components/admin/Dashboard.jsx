import { useState, useEffect, useContext, useCallback,useParams } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getProjects, createProject, updateProject, deleteProject } from '../../utils/services/api';
import ProjectModal from '../common/ProjectModal';
import Button from '../common/Button';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);

  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getProjects();
      setProjects(response?.data?.projects || response?.data || []);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchProjects();
      console.log("UserData",user);
      
    }
  }, [user, fetchProjects]);

  const handleAddProject = useCallback(() => {
    console.log('Add Project button clicked');
    setCurrentProject(null);
    setIsModalOpen(true);
  },[]);

  const handleEditProject = useCallback((project) => {
    setCurrentProject(project);
    setIsModalOpen(true);
  },[]);

  const handleDeleteProject = useCallback(async (projectId) => {
    try {
      setError(null);
      setLoading(true);
      await deleteProject(projectId);
      await fetchProjects();
    } catch (err) {
      console.error('Failed to delete project:', err);
      setError('Failed to delete project. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [fetchProjects]);

  const handleSaveProject = useCallback(async (projectData) => {
    console.log('Saving project:', projectData);
    try {
      setError(null);
      setLoading(true);
      if (currentProject) {
        await updateProject(currentProject._id, projectData);
      } else {
        await createProject(projectData);
      }
      await fetchProjects();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save project:', err);
      setError('Failed to save project. Please try again.');
    } finally {
      setLoading(false);
      console.log(projectData);
      
    }
  }, [currentProject, fetchProjects]);

  if (!user) {
    return <div className="text-center py-20">Please log in to view your dashboard.</div>;
  }

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-6">
        {error && (
          <div
            role="alert"
            className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg"
          >
            {error}
          </div>
        )}
        {loading && (
          <div className="text-center py-20" aria-live="polite">
            Loading...
          </div>
        )}
        {!loading && (
          <>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            {user?.username}'s Dashboard
          </h1>
          <div className="flex gap-4">
            <Button
              onClick={handleAddProject}
              className="bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500"
              disabled={loading}
              aria-label="Add a new project"
            >
              Add Project
            </Button>
            <Button
              onClick={logout}
              className="bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500"
              disabled={loading}
              aria-label="Log out"
            >
              Logout
            </Button>
          </div>
        </div>
        {projects.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-300 text-center">
                No projects found. Click "Add Project" to create one.
              </p>
            ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div key={project._id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{project.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 line-clamp-3">{project.description}</p>
              <div className="mt-4 flex gap-2">
                <Button
                  onClick={() => handleEditProject(project)}
                  className="bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500"
                  disabled={loading}
                  aria-label={`Edit project ${project.title}`}
                >
                  Edit
                </Button>
                <Button
                  onClick={() => handleDeleteProject(project._id)}
                  className="bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500"
                  disabled={loading}
                  aria-label={`Delete project ${project.title}`}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
            )}
        <p className="mt-8 text-gray-600 dark:text-gray-300">
          Share your showcase: <a href={`/showcase/${user?.userId}`} className="text-blue-500 dark:text-blue-400"aria-label="Link to your showcase page">/showcase/{user?._id}</a>
        </p>
        {isModalOpen && (
          <ProjectModal
            project={currentProject}
            onSave={handleSaveProject}
            onClose={() => setIsModalOpen(false)}
          />
          )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;