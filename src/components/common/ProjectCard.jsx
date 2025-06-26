import { Github, ExternalLink, Calendar, ChevronRight } from 'lucide-react';

const ProjectCard = ({ project, index, onClick }) => {
   if (!project) return null;
  return (
    <div 
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group cursor-pointer border border-gray-100"
      style={{ 
        transform: `translateY(${index * 20}px)`,
        opacity: 0,
        animation: `slideUp 0.6s ease-out ${index * 0.1}s forwards`
      }}
      onClick={onClick}
    >
      <div className="relative overflow-hidden">
        <img 
          src={project.thumbnail?.trim() ? project.thumbnail : "src/assets/imagetest/test.jpg"} 
           alt={project.title || "Project Thumbnail"}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            {project.category}
          </span>
        </div>
        {project.featured && (
          <div className="absolute top-4 right-4">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              ⭐ Featured
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex gap-2">
            {project.github && (
              <button className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors">
                <Github size={18} />
              </button>
            )}
            {project.liveUrl && (
              <button className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors">
                <ExternalLink size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
          {project.title}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {project.technologies.slice(0, 3).map((tech, i) => (
            <span 
              key={i}
              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium"
            >
              {tech}
            </span>
          ))}
          {project.technologies.length > 3 && (
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium">
              +{project.technologies.length - 3} more
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500 text-sm flex items-center gap-1">
            <Calendar size={14} />
            {new Date(project.createdAt).toLocaleDateString()}
          </span>
          <ChevronRight size={20} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;