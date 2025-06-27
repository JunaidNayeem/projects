"use client"

const HeroSection = ({ projectCount, userInfo, isUserShowcase = false }) => {
  return (
    <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-20">
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          {isUserShowcase ? (
            <>
              {userInfo?.username}'s
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                Portfolio
              </span>
            </>
          ) : (
            <>
              Discover Amazing
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                Projects
              </span>
            </>
          )}
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-blue-100">
          {isUserShowcase
            ? `Explore ${userInfo?.username}'s creative work and technical projects`
            : "Explore innovative solutions and creative works from talented developers"}
        </p>
        <div className="flex justify-center items-center gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
            <span className="text-2xl font-bold">{projectCount}</span>
            <span className="text-blue-100 ml-2">{isUserShowcase ? "Projects" : "Public Projects"}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
