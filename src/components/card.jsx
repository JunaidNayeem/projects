/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// eslint-disable-next-line no-unused-vars
import React, { useEffect, useRef } from 'react';
import "../assets/scss/global.scss";
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import gsap from 'gsap';




gsap.registerPlugin(ScrollTrigger);
const ProjectCard = ({imageURL}) => {
  const cardRef = useRef(null);

  useEffect(() => {
    const element = cardRef.current;
    gsap.fromTo(
      element,
      { opacity: 0, y: 50 }, 
      {
        opacity: 1,
        y: 0, 
        duration: 1.5,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 80%', 
          toggleActions: 'play reverse play reverse', 
        },
      }
    );
  }, []);

  const handleMouseEnter = () => {
   
    gsap.to(cardRef.current, {
      scale: 1.05,
      duration: 0.3,
      ease: 'power3.out',
    });
  };

  const handleMouseLeave = () => {
    
    gsap.to(cardRef.current, {
      scale: 1,
      duration: 0.3,
      ease: 'power3.out',
    });
  };
  return (
    <div className='Card'
    ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
      <div className="BackgroundImage" 
      style={{backgroundImage:`url(${imageURL})`}} />
      <div className='CardContent'>
        <div className='Title'>Project Title</div>


        <div className='Description'>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eius iusto obcaecati maxime suscipit provident magni porro dolorem maiores at, repudiandae perferendis consequuntur ipsam sequi consequatur animi vero est laudantium ad nemo corporis.
        </div>
        <a className="Button" href="#">
          View Project
        </a>
        <a className="Button" href="#">
          View Code
        </a>
      </div>
    </div>
  );
};

export default ProjectCard;
