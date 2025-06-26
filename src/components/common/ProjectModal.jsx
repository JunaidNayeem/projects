import { Code, Layers } from 'lucide-react';
import Button from './Button';
import { useState } from 'react';

const ProjectModal = ({ project, onSave,onClose }) => {

  const [formData, setFormData] = useState({
    title: project?.title || "",
    description: project?.description || "",
    category: project?.category || "",
    technologies: project?.technologies || [],
    github: project?.github || "",
    liveUrl: project?.liveUrl || "",
    thumbnail: project?.thumbnail || "",
    public: project?.public || false,
  });


  const [techInput, setTechInput] = useState('');


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const handleAddTech = (e) => {
    e.preventDefault();
    if (techInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        technologies: [...prev.technologies, techInput.trim()],
      }));
      setTechInput('');
    }
  };

  const handleRemoveTech = (techToRemove) => {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((tech) => tech !== techToRemove),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold text-gray-800">
              {project ? 'Edit Project' : 'Add Project'}
            </h2>
            <button
              onClick={onClose}
              className="bg-white/20 backdrop-blur-sm text-gray-800 p-2 rounded-full hover:bg-white/30 transition-colors"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg mt-1 text-gray-800"
                required
                aria-required="true"
              />
            </div>
            {/* Description */}
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg mt-1 text-gray-800"
                rows="4"
              />
            </div>
            {/* Category */}
            <div className="mb-4">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <input
                required ="true"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg mt-1 text-gray-800"
              />
            </div>
            {/* Technologies */}
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <Code size={20} />
                Technologies Used
              </h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.technologies.map((tech, i) => (
                  <span
                    key={i}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(tech)}
                      className="text-white hover:text-red-200"
                      aria-label={`Remove ${tech}`}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  className="w-full p-3 border rounded-lg text-gray-800"
                  placeholder="Add technology (e.g., React)"
                />
                <Button
                  type="button"
                  onClick={handleAddTech}
                  className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600"
                >
                  Add
                </Button>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <Layers size={20} />
                Project Links
              </h3>
              <div className="space-y-3">
                <div>
                  <label htmlFor="github" className="block text-sm font-medium text-gray-700">
                    GitHub URL
                  </label>
                  <input
                    id="github"
                    name="github"
                    value={formData.github}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg mt-1 text-gray-800"
                    placeholder="https://github.com/username/repo"
                  />
                </div>
              </div>
                <div>
                  <label htmlFor="liveUrl" className="block text-sm font-medium text-gray-700">
                    Live URL
                  </label>
                  <input
                    id="liveUrl"
                    name="liveUrl"
                    value={formData.liveUrl}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg mt-1 text-gray-800"
                    placeholder="https://your-project.com"
                  />
                </div>
               <div className="mb-4 flex items-center gap-2">
                  <input
                    id="public"
                    type="checkbox"
                    checked={formData.public}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, public: e.target.checked }))
                    }
                    className="w-4 h-4"
                  />
                  <label htmlFor="public" className="text-sm text-gray-700">
                    Make this project public
                  </label>
                </div>
            </div>

            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                onClick={onClose}
                className="bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600"
              >
                {project ? 'Save Changes' : 'Create Project'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;