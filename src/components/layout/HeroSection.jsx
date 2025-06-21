import ThemeToggle from '../common/ThemeToggle';

const HeroSection = ({ projectCount }) => {
  return (
    <section className="hero-gradient text-white py-20">
      <div className="container mx-auto px-6 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="text-center animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            My <span className="text-yellow-300 dark:text-yellow-200">Projects</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
            Explore my journey through code - from innovative web applications to cutting-edge mobile solutions
          </p>
          <div className="flex justify-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-1">
              <div className="bg-white/20 rounded-full px-6 py-3">
                <span className="font-semibold">{projectCount} Projects & Counting</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;