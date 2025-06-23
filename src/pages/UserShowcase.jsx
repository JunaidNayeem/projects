import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { getProjectsByUser } from '../services/api';
import HeroSection from '../components/layout/HeroSection';
import FilterSection from '../components/layout/FilterSection';
import ProjectCard from '../components/common/ProjectCard';

const UserShowcase = () => {
  const { userId } = useParams();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await getProjectsByUser(userId);
        setProjects(response.data);
        setFilteredProjects(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        setLoading(false);
      }
    };
    fetchProjects();

    const socket = io('http://localhost:5000');
    socket.on('projectUpdate', (updatedProject) => {
      if (updatedProject.project.userId === userId) {
        setProjects(prev => {
          if (updatedProject.action === 'delete') {
            return prev.filter(p => p._id !== updatedProject.project._id);
          } else if (updatedProject.action === 'create') {
            return [...prev, updatedProject.project];
          } else {
            return prev.map(p => (p._id === updatedProject.project._id ? updatedProject.project : p));
          }
        });
      }
    });

    return () => socket.disconnect();
  }, [userId]);

  useEffect(() => {
    setFilteredProjects(
      projects.filter(project =>
        (activeFilter === 'all' || project.category.toLowerCase() === activeFilter) &&
        project.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [projects, activeFilter, searchTerm]);

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <HeroSection projectCount={projects.length} />
      <FilterSection
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      <section className="py-12">
        <div className="container mx-auto px-6">
          {filteredProjects.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-300">No projects found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map(project => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default UserShowcase;