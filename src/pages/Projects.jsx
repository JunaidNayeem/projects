import { useState, useEffect } from 'react';
import HeroSection from '../components/layout/HeroSection';
import FilterSection from '../components/layout/FilterSection';
import ProjectCard from '../components/common/ProjectCard';
import ProjectModal from '../components/common/ProjectModal';
import { getProjects } from '../utils/services/api';


const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);


useEffect(() => {
  setLoading(true);
  getProjects()
    .then(res => {
      setProjects(res.data || []);
      setFilteredProjects(res.data || []);
    })
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
}, []);

  useEffect(() => {
    let filtered = projects;

    if (activeFilter !== 'all') {
      filtered = filtered.filter(project => 
        project.category.toLowerCase() === activeFilter.toLowerCase()
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.technologies.some(tech => 
          tech.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredProjects(filtered);
  }, [projects, activeFilter, searchTerm]);

  return (
    <>
      <HeroSection projectCount={projects.length} />
      <FilterSection 
        activeFilter={activeFilter} 
        setActiveFilter={setActiveFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      <section className="py-16">
        <div className="container mx-auto px-6">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {filteredProjects.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-600 mb-2">No projects found</h3>
                  <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProjects.map((project, index) => (
                    <ProjectCard 
                      key={project.id} 
                      project={project} 
                      index={index} 
                      onClick={() => setSelectedProject(project)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    {selectedProject && (
    <ProjectModal 
      project={selectedProject} 
      onClose={() => setSelectedProject(null)} 
    />
    )}
    </>
  );
};

export default Projects;