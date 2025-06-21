import { Github, ExternalLink, Code, Layers } from 'lucide-react';
import Button from './Button';

const ProjectModal = ({ project, onClose }) => {
  if (!project) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <img 
            src={project.thumbnail} 
            alt={project.title}
            className="w-full h-64 object-cover"
          />
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-8">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-3xl font-bold text-gray-800">{project.title}</h2>
            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              {project.category}
            </span>
          </div>
          <p className="text-gray-600 mb-6 text-lg leading-relaxed">
            {project.description}
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Code size={20} />
                Technologies Used
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.mTechnologies.map((tech, i) => (
                  <span 
                    key={i}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Layers size={20} />
                Project Links
              </h3>
              <div className="space-y-3">
                {project.github && (
                  <Button
                    as="a"
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-gray-900 text-white px-4 py-3 rounded-lg hover:bg-gray-800 w-full"
                  >
                    <Github size={20} />
                    View Source Code
                  </Button>
                )}
                {project.liveUrl && (
                  <Button
                    as="a"
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 w-full"
                  >
                    <ExternalLink size={20} />
                    Live Preview
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;